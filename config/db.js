const mongoose = require('mongoose');

const dbConnect = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Successfully connected to mongodb`);
    }catch(error){
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
}

mongoose.model.exports = dbConnect;