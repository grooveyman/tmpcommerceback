const mongoose = require('mongoose');

// Cart model for storing cart items
const cartSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },

  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  },

  status: {
    type: String,
    enum: ["active", "inactive"],
    required: true,
  },
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
