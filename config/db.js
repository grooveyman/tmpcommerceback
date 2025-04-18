const mongoose = require('mongoose');

let isConnected = false;

const dbConnect = async() => {
    if(isConnected){
        return;
    }
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});
        isConnected = true;
        // console.log(`Successfully connected to mongodb`);
    }catch(error){
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
}

module.exports = dbConnect;