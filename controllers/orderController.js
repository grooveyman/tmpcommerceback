import Order from "../models/orderModel.js";
import asyncHandler from "../middleware/asyncHandler.js";
import PayStack from "../config/paystackConfig.js";
import Product from "../models/productModel.js";
import { getUserCart } from "./cartController.js";

const createOrder = async ({
  orderItems,
  shippingAddress,
  amount,
  taxprice,
  shippingprice,
  reference,
  user,
}) => {
  // const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
   
  if (orderItems && orderItems.length === 0) {
    return res
      .status(400)
      .json({ status: false, message: "No order items provided" });
  } else {
    //get the quantity of product and update it
   const updateres =  await Promise.all(orderItems.map(async (item) => {
        return await updateStockQuantity(item.productId, item.quantity)}
    ));


    const alltrue = updateres.every(result => result === true);
    if(!alltrue){
        return {success: false, error:'Could not update quantity', res:updateres};
    }
    const order = new Order({
      orderItems,
      user: user._id,
      shippingAddress,
      totalPrice: amount,
      taxPrice: taxprice,
      payStackReference: reference,
      shippingPrice: shippingprice,
    });
    try {
      const createdOrder = await order.save();
      // res.status(201).json({status:true, message:'Order created successfully', results:createdOrder});
      return { success: true, neworder: createdOrder };
    } catch (error) {
      // res.status(400).json({status:false, message:error.message});
      return { success: false, error: error.message };
    }
  }
};



const updateStockQuantity = async (productid, quantity) => {
    try{
        const product = await Product.findById(productid);
        if(!product){
            return false;
        }
        if(parseInt(product.quantity) <= 0 || parseInt(product.quantity) < quantity){
            return 'quantity less than 0 or more than available';
        }   
        product.quantity -= quantity;
        await product.save();   
        return true;
    }catch(error){
        return error.message;
    }
}

const updateOrder = async ({isPaid, paidAt, payStackTransactionId, payStackReference, paymentMethod}) => {
  try {
    const order = await Order.findOne({payStackReference:payStackReference});
    if (order) {
      order.isPaid = isPaid;
      order.paidAt = paidAt;
      order.payStackTransactionId = payStackTransactionId;
      order.paymentMethod = paymentMethod;
      

      const updatedOrder = await order.save();
      return { success: true, updateOrder: updatedOrder };
    }else{
        return { success: false, error:'Order not found'};
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({});
    return res.status(200).json({ status: true, results: orders });
  } catch (error) {
    return res.status(400).json({ status: false, results: error.message });
  }
});

export { createOrder, updateOrder, getAllOrders };
