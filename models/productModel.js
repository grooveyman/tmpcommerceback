import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    required:true,
    ref: "User",
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  slug: {
    type: String,
    required: false,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  brand: {
    type: String,
    required: false,
  },
  rating: {
    type: Number,
    required: false,
    default: 0,
  },
  reviews: [reviewSchema],
  numReviews: {
    type: Number,
    required: false,
  },

  description: {
    type: String,
    required: false,
  },
});

//create search index for product name, categories and description
productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model("Product", productSchema);
export default Product;