// Required modules
const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const userRoutes = require("../routes/userRoutes");
const errorHandler = require("../middleware/errorHandler");
const connectDb = require("../config/dbConnection");
const categoryRoutes = require("../routes/categoryRoutes");
const productRoutes = require("../routes/productRoutes");
const orderRoutes = require("../routes/orderRoutes");
const cartRoutes = require("../routes/cartRoutes");
const paystackRoutes = require("../routes/paystackRoutes");
const cors = require("cors");
const serverless = require("serverless-http");

// Initialize dotenv
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.get("/test", (req, res) => {
  res.status(200).send("Server is alive!");
});

// Routes
app.use("/api/users", userRoutes);
console.log("Loaded /api/users");
app.use("/api/categories", categoryRoutes);
console.log("Loaded /api/category");
app.use("/api/products", productRoutes);
console.log("Loaded /api/products");
app.use("/api/orders", orderRoutes);
console.log("Loaded /api/orders");
app.use("/api/carts", cartRoutes);
console.log("Loaded /api/cart");
app.use("/api/payments", paystackRoutes);
console.log("Loaded /api/paystack");

// Error handling middleware
app.use(errorHandler);

// Export handler for Vercel serverless
// let handler;
const handler = async (req, res) => {
  if (!handler._serverless) {
    // Database connection
    console.log("Connecting to DB...");
    await connectDb();
    console.log("DB connection completed");

    handler._serverless = serverless(app);
  }
  return handler._serverless(req, res);
};
// module.exports = serverless(app);
module.exports = handler;
