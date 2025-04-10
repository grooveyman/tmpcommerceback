const express = require('express');
const dotenv = require("dotenv").config();
const errorHandler = require("./middleware/errorHandler");
const connectDb = require('./config/dbConnection');

connectDb();

const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());

//routes
app.use('/api/users', require('./routes/userRoutes'));

//after routes
app.use(errorHandler);  

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});