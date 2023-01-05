const mongoose = require('mongoose');

const {Schema} = mongoose

const ssvSchema = new Schema({

    userId:{
        // type:String
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    amount:{
        type:Number
    }
},{
    timestamps:true
})

module.exports = mongoose.model("ssv_wallet",ssvSchema);