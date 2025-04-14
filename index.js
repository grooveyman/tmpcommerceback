import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import userRoutes from "./routes/userRoutes.js";
import errorHandler from './middleware/errorHandler.js';
import connectDb from './config/dbConnection.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import paystackRoutes from './routes/paystackRoutes.js';
import cors from "cors";
import serverless from 'serverless-http';

dotenv.config();
const port = process.env.PORT || 5000;

connectDb();

const app = express();

app.use(cors({ origin: 'http://localhost:5173'}));

app.use(express.json({ limit:'50mb'}))
app.use(express.urlencoded({ limit:'50mb', extended: true }))
app.use(cookieParser())

//users
app.use('/api/users', userRoutes)
//categories
app.use('/api/categories', categoryRoutes)
// app.use(errorHandler)
//products
app.use('/api/products', productRoutes)
//order
app.use('/api/orders', orderRoutes)
//cart routes
app.use('/api/carts', cartRoutes)
//payment routes
app.use('/api/payments', paystackRoutes)


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


module.exports.handler = serverless(app);