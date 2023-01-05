const mongoose = require('mongoose');

const {Schema} = mongoose

const floorsSchema = new Schema({

    floorNo:{
        type:Number
    },
    userId:{
        // type:String
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    count:{
        type:Number,
        default:0
    },
    investment:{
        type:String,
        default:"F",
        enum:['F','R']
    },
    position:{
        type:Number
    },
    reinvest_count:{
        type:Number,
        default:0
    }
},{
    timestamps:true
})

module.exports = mongoose.model("Floors",floorsSchema);