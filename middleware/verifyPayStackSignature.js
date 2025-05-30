const asyncHandler = require('./asyncHandler');

const verify = asyncHandler(async(req, res, buf, encoding) => {
    const crypto = require('crypto');

    const paystackSignature = req. headers['x-paystack-signature'];
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(buf).digest('hex');

    if(hash !== paystackSignature){
        throw new Error('Invalid Paystack signature');
    }
});

module.exports = verify;