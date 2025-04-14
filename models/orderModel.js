const mongoose = require('mongoose');

const orderItemsSchema = mongoose.Schema(
    {
        name: {type: String, required:true},
        quantity: {type: Number, required:true},
        price: {type: Number, required: true},
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Product",
        }
    }
);

const orderSchema = mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",

        },
        orderItems:[orderItemsSchema],

        shippingAddress:{
            address: {type: String, required:true},
            city: {type: String, required:true},
            postalcode: {type: String, required:false},
            country: {type: String, required:true},
            email: {type: String, required: true},
            phone: {type: String, required: true}
        },

        paymentMethod: {
            type: String,
            required: false,
        },

        payStackReference: {
            type: String,
            required: false,
        },

        payStackTransactionId: {
            type: String,
            required: false,
        },

        taxPrice: {
            type: Number,
            required: true,
            default: 0.0,

        },

        shippingPrice: {
            type: Number,
            required: true,
            default: 0.0,

        },

        totalPrice:{
            type: Number,
            required: true,
            default: 0.0,
        },

        isPaid: {
            type: Boolean,
            required: false,
            default: false,
        },

        paidAt: {
            type: Date,
            required: false
        },

        isDelivered: {
            type: Boolean,
            required: false,
            default: false,
        },

        deleveredAt: {
            type: Date,
            required: false
        }
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;