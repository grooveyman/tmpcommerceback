const mongoose = require('mongoose');

let isConnected = false; // Track the connection status
const connectDb = async () => {
    if(isConnected){
        console.log('Already Connected to Database');
        return;
    }

    try{
        const connect = await mongoose.connect(process.env.CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
       isConnected = connect.connection.readyState === 1;
        console.log(`MongoDB connected: ${connect.connection.host}`);
    }catch(err){
        console.log(err);
        process.exit(1);
    }
}

module.exports =  connectDb;
