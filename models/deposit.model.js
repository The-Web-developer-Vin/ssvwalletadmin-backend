const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    amount:{
        type:Number,
        enum:"30"
    },
    payment_type:{
        type:String,
    },
    transactionHash:{
        type:String
    },
    status:{
        type:String,
        default:"processing"
    },
},{
    timestamps:true
})

module.exports = mongoose.model("Deposit",depositSchema);