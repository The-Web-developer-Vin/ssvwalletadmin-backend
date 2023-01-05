const mongoose = require("mongoose");
const bcrypt =require('bcrypt-nodejs');
const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        validate: {
            validator: function (v) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: "Please enter a valid email",
        },
    },
    password: {
        type: String,
        required: false,
        minlength: 8
    },
    userName:{
        type:String, 
        required:true
    },
    referralId:{
        type:String,
    },
    referralBy:{
        type:String
    },
    addReferral:{
        type:Boolean,
        default:true,
    },
    verify_otp:{
        type:Number,
        expires:"5m",
        index:true
    },
    ssv_id:{
        type:String,
        unique:true
    }
},{
    timestamps:true
})

userSchema.methods.generateHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};


module.exports = mongoose.model("User",userSchema,"users");