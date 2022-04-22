
const mongoose = require ("mongoose")
const ObjectId = mongoose.Types.ObjectId

const orderSchema = new mongoose.Schema({

    userId :{
        type:ObjectId,
        required:true,
        ref:"user"
    },
    items:[{
        productId:{
        type:ObjectId,
        required:true,
        ref:"product"
        },
        quantity:{
            type:Number,
            required:true,
            min: 1
        },
    }],
    totalPrice:{
        type:Number,
        required:true,
    },
    totalItems:{
        type:Number,
        required:true
    },
    totalQuantity:{
        type:Number,
        required:true
    },
    cancellable:{
        type:Boolean,
        default:true
    },
    status:{
        type:String,
        default:'pending',
        enum:["pending",'completed','canceled']
    }
},
{timestamps:true})

module.exports=mongoose.model('order',orderSchema)