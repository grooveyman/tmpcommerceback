import asyncHandler from "../middleware/asyncHandler.js";
import Cart from "../models/cartModel.js";

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, amount } = req.body;
  const userId = req.user._id; // from authentication middleware

  // Check if the product already exists in the cart
  if (!productId || !quantity || !amount) {
    return res.status(400).json({
      status: false,
      message: "Please provide productId, quantity and amount",
    });
  }

  try {
    const existingCart = await Cart.findOne({ user: userId, productId });
    if (existingCart) {
      existingCart.quantity = quantity;
      existingCart.amount = amount;
      await existingCart.save();
      return res.json(200).json({
        status: true,
        message: "Product updated in cart",
        results: existingCart,
      });
    } else {
      //create a new cart item
      const newCart = new Cart({
        user: userId,
        productId,
        quantity,
        amount,
        status: "active",
      });
      await newCart.save();
      return res.status(201).json({
        status: true,
        message: "Product added to cart",
        results: newCart,
      });
    }
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

//get all carts by the user
const getUserCart = asyncHandler(async (req, res) => {
  const userId = req.user._id; // from authentication middleware
  try {
    const carts = await Cart.find({ user: userId });
    if (carts.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "No items in cart" });
    }
    return res
      .status(200)
      .json({ status: true, message: "Cart items", results: carts });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

//remove product from cart
const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  try {
    const productExist = await Cart.findOne({ user: userId, productId });
    if (!productExist) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found in cart" });
    }
    await Cart.deleteOne({ user: userId, productId });
    return res
      .status(200)
      .json({ status: true, message: "Product removed from cart" });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

export { addToCart, getUserCart, removeCartItem };
