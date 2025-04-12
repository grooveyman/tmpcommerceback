import asyncHandler from "../middleware/asyncHandler.js";
import PayStack from "../config/paystackConfig.js";
import request from "request";
import { createOrder, updateOrder } from "./orderController.js";
import { getUserCart } from "./cartController.js";
import Cart from "../models/cartModel.js";
import { getProductNameById } from "./productController.js";
import Order from "../models/orderModel.js";

const initializePayment = asyncHandler(async (req, res) => {
  const paystack = PayStack(req);
  const cartItems = await getCartItems(req, res);

  if(cartItems.error){
    return res.status(400).json({status:false, message:'Cart items were not found', error:cartItems.error});
  }
  const {
    shippingaddress: shippingAddress,
    taxprice,
    shippingprice,
  } = req.body;

  //validate data
  if (
    !shippingAddress ||
    !taxprice ||
    !shippingprice
  ) {
    return res
      .status(422)
      .json({ status: false, message: "Required fields cannot be empty" });
  }

  //save initial details to order
  const user = req.user;

  const form = {
    email: req.user.email,
    amount: cartItems.total * 100,
    currency:'USD',
    callback_url: "http://localhost:5001/paystack/callback",
  };

  //initialize payment
  paystack.initializePayment(form, (error, response) => {
    if (error) {
      console.log("Payment initialization failed", error);
      return res
        .status(500)
        .json({ message: "Payment initialization failed. Try again.", error:error.message });
    }

    if (response.status) {
      (async () => {
        const result = await createOrder({
          orderItems:cartItems.results,
          shippingAddress,
          amount:cartItems.total,
          taxprice,
          shippingprice,
          reference: response.data.reference,
          user,
        });
        // return res.json({ result });
        if (!result.success) {
          return res
            .status(500)
            .json({
              status: false,
              message: "Order processing failed",
              error: result.error,
              res:result.res
            });
        }
        return res
          .status(200)
          .json({
            message: "Payment initialization successful,",
            authorization_url: response.data.authorization_url,
            reference: response.data.reference,
          });
      })();
    } else {
      return res.status(400).json({ message: "Payment initialization failed" });
    }
  });
});

const getCartItems = async (req, res) => {
  const userId = req.user._id; // from authentication middleware
  try {
    const carts = await Cart.find({ user: userId }).select('-_id').lean();
    if (carts.length === 0) {
      return {success:false, error:'Could not find any items in cart'}
    }
    const newcarts = await Promise.all(carts.map(async (cart) => {
        const name = await getProductNameById(cart.productId);
        
        if(name.success){
            const newName = name.results;
            return {...cart, name:newName};
        }
    }));
   

    const totalamount = carts.reduce((acc, cart) =>  acc + cart.price, 0);
    return {success:true, results:newcarts, total:totalamount}

  } catch (error) {
    return {success:false, message:'Failed to get cart items', error:error.message}
  }
};

const verifyPayment = asyncHandler(async (req, res) => {
  const paystack = PayStack(req);
  const reference = req.params.id;

  paystack.verifyPayment(reference, (error, response) => {
    if (error) {
      console.log(`Could not verify payment: ${error}`);
      return res
        .status(500)
        .json({ status: false, message: "Failed to verify payment" });
    }

    if (response.status) {
      //update order details with extra data
      const data = response.data;
      const transactionId = data.id;
      const paymentMethod = data.channel;
      const paidAt = data.created_at;

      if (data.status === "success") {
        return (async () => {
          const isPaid = true;
          const result = await updateOrder({
            isPaid,
            paidAt,
            payStackTransactionId: transactionId,
            payStackReference: reference,
            paymentMethod: paymentMethod,
          });

          if (!result.success) {
            return res
              .status(500)
              .json({
                status: false,
                message: "Order Completion Failed!",
                error: result.error,
              });
          }
          return res
            .status(200)
            .json({
              status: true,
              message: "Payment verified and order placed",
            });
        })();
      } else {
        return res
          .status(500)
          .json({ status: false, message: "Payment was not successful" });
      }
    } else {
      return res
        .status(400)
        .json({ status: false, message: "Payment verification failed" });
    }
  });
});


const verifyWebHook = asyncHandler(async (req, res) => {
    const event = req.body;

    if(event.event === 'charge.success'){
        const reference = event.data.reference;

        const updateOrder = await updateOrderStatus(reference, verifyPayment.data);
        if(updateOrder.success){
            return res.status(200).json(updateOrder);
        }

    }
});

const updateOrderStatus = async (reference, verifyData) => {
    try{
        const order = Order.findOne({payStackReference: reference});
        return {success:true, results:order};
    }catch(error){
        return {success:false, error:error.message};
    }
}

export { initializePayment, verifyPayment, verifyWebHook };
