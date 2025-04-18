// Required modules
const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const userRoutes = require("../routes/userRoutes.js");
const errorHandler = require("../middleware/errorHandler.js");
const connectDb = require("../config/dbConnection.js");
const categoryRoutes = require("../routes/categoryRoutes.js");
const productRoutes = require("../routes/productRoutes.js");
const orderRoutes = require("../routes/orderRoutes.js");
const cartRoutes = require("../routes/cartRoutes.js");
const paystackRoutes = require("../routes/paystackRoutes.js");
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

app.get("/", (req, res) => {
  res.status(200).send("Server is alive!");
});

// Routes
app.use("/api/users", userRoutes);
// console.log("Loaded /api/users");
app.use("/api/categories", categoryRoutes);
// console.log("Loaded /api/category");
app.use("/api/products", productRoutes);
// console.log("Loaded /api/products");
app.use("/api/orders", orderRoutes);
// console.log("Loaded /api/orders");
app.use("/api/carts", cartRoutes);
// console.log("Loaded /api/cart");
app.use("/api/payments", paystackRoutes);
// console.log("Loaded /api/paystack");

// Error handling middleware
app.use(errorHandler);

// Ensure database connection is established
connectDb().then(() => {
//   console.log("Database connected successfully");
}).catch((err) => {
//   console.error("Database connection failed:", err.message);
});

app.listen(5002, () => {
  console.log("Server is running on port 5002");
});


// const handler = async (req, res) => {
//   if (!handler._serverless) {
//     // Database connection
//     console.log("Connecting to DB...");
//     await connectDb();
//     console.log("DB connection completed");

//     handler._serverless = serverless(app);
//   }
//   return handler._serverless(req, res);
// };
// module.exports = serverless(app);
// module.exports = handler;


// Export the serverless handler directly
module.exports = serverless(app);



