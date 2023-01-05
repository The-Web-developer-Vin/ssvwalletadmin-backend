const mongoose = require('mongoose');

const {Schema} = mongoose

const floors_countSchema = new Schema({

    floorNo:{
        type:Number,
    },
    no_of_users:{
        type:Number
    },
    reinvestment_count:{
        type:Number
    }
    
},{
    timestamps:true
})

module.exports = mongoose.model("Floors_count",floors_countSchema);