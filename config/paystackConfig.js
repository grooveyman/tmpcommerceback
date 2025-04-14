const { response } = require('express');
const request = require('request');

const PayStack = (req) => {
    const MySecretKey = process.env.PAYSTACK_SECRET_KEY;

    const initializePayment = (form, mycallback) => {
        const options = {
            url: "https://api.paystack.co/transaction/initialize",
            headers: {
              authorization: `Bearer ${MySecretKey}`,
              "Content-Type": "application/json",
              "cache-control": "no-cache",
            },
            body: JSON.stringify(form),
          };

          const callback = (error, response, body) => {
            if(error){
                return mycallback(error, null);
            }

            if(response.statusCode === 200){
                try{
                    const data = JSON.parse(body);
                    return mycallback(null, data);
                }catch(error){
                    return mycallback(error, null);
                }
            }else{
                return mycallback(new Error(`Failed with status code: ${response.statusCode}`), null);
            }
            
          };
            
          request.post(options, callback);
    }

    const verifyPayment = (ref, mycallback) => {
        const options = {
          url:
            `https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`,
          headers: {
            authorization: `Bearer ${MySecretKey}`,
            "Content-Type": "application/json",
            "cache-control": "no-cache",
          },
        };
        const callback = (error, response, body) => {
          return mycallback(error, JSON.parse(body));
        };
        request(options, callback);
      };
      return {initializePayment, verifyPayment};
}

module.exports = PayStack;