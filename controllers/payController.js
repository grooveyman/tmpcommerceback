import asyncHandler from "../middleware/asyncHandler.js";
import PayStack from "../config/paystackConfig.js";
import request from 'request';
import { createOrder, updateOrder } from "./orderController.js";

const initializePayment = asyncHandler( async (req, res) => {
    const paystack = PayStack(req);
    
    const {orderitems:orderItems, shippingaddress:shippingAddress, taxprice, shippingprice, amount,  } = req.body;

    //validate data
    if(!orderItems || ! shippingAddress || !taxprice || !shippingprice || !amount){
        return res.status(422).json({status:false, message:'Required fields cannot be empty'});
    }

    //save initial details to order
    const user = req.user;

    const form = {
        email:req.user.email,
        amount: amount * 100,
        callback_url: 'http://localhost:5001/paystack/callback',
    };

    //initialize payment
    paystack.initializePayment(form, (error, response) => {
        if(error){
            console.log('Payment initialization failed',error);
            return res.status(500).json({message:'Payment initialization failed. Try again.'});
        }
        
        if(response.status){
            (async () => {
                const result = await createOrder({orderItems, shippingAddress, amount, taxprice, shippingprice, reference:response.data.reference, user});
                return res.json({result});
                if(!result.success){
                    return res.status(500).json({status:false, message:'Order processing failed', error:result.error}); 
                }
                return res.status(200).json({message:'Payment initialization successful,', authorization_url:response.data.authorization_url, reference: response.data.reference});

            })();
            
        }else{
            return res.status(400).json({message:'Payment initialization failed'});
        }
    })
});

const verifyPayment = asyncHandler( async (req, res) => {
    const paystack = PayStack(req);
    const reference = req.params.id;

    paystack.verifyPayment(reference, (error, response) => {
        if(error){
            console.log(`Could not verify payment: ${error}`);
            return res.status(500).json({status: false, message: 'Failed to verify payment'});
        }

        if(response.status){
            //update order details with extra data
            const data = response.data;
            const transactionId = data.id;
            const paymentMethod = data.channel;
            const paidAt = data.created_at;

            if(data.status === 'success'){
                
               return  (async () => {
                    const isPaid = true;
                    const result = await updateOrder({isPaid, paidAt, payStackTransactionId:transactionId, payStackReference:reference, paymentMethod:paymentMethod});
                    
                    if(!result.success){
                        return res.status(500).json({status:false, message:'Order Completion Failed!', error:result.error});
                    }
                    return res.status(200).json({status: true, message:'Payment verified and order placed'});
                })();
            }else{
                return res.status(500).json({status:false, message:"Payment was not successful"});
            }
            
        }else{
            return res.status(400).json({status: false, message:'Payment verification failed'});
        }
    });
});

export {initializePayment, verifyPayment };