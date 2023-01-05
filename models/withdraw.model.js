const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    amount:{
        type:Number,
    },
    contactAddress:{
        type:String,
    },
    withdrawOption:{
        type:String
    },
    status:{
        type:String,
        default:"processing"
    },
},{
    timestamps:true
})
module.exports = mongoose.model("Withdraw",withdrawSchema);