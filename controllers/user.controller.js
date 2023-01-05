const mongoose = require("mongoose");
const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const passwordValidator = require('password-validator');
const schema = new passwordValidator();
const otpGenerator = require("otp-generator"); 
const data = require("../modules");
const sendEmail = require('../modules/mail');
const ssv_walletModel = require("../models/ssv_wallet.model");

schema.is().min(8).is().max(100).has().uppercase().has().lowercase().has().digits(2);

exports.userSignUp = async (req, res) => {
  try {
    const isUserExist = await userModel.findOne({ email: req.body.email });
    if (isUserExist) {
      return res.status(400).send({
        data: null,
        error: 'Email Exists',
        status: 1,
        message: 'User with mail already Exists'
      })
    }
    if (!schema.validate(req.body.password)) {
      return res.status(400).send({
        data: null,
        error: schema.validate(req.body.password, { details: true }),
        status: 0,
        message: 'Enter Valid Password'
      })
    }
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const otp = otpGenerator.generate(5, 
      { upperCaseAlphabets: false, specialChars: false }
    );
    const ssv = otpGenerator.generate(8, 
      { lowerCaseAlphabets: false, specialChars: false }
    );
   
    const userSignup = new userModel(req.body);
    userSignup.referralId = otp;
    userSignup.ssv_id = ssv
    const isUserCreated = await userSignup.save()
    
    if (isUserCreated) {

      sendEmail({
        html: data.VERIFYSSVID.html(isUserCreated.ssv_id),
        subject: `SSV ID : ${ssv}` ,
        email: isUserCreated.email,
      }); 
      const ssvWallet = new ssv_walletModel()
      ssvWallet.userId = isUserCreated._id;
      ssvWallet.totalAmount = 0;
      ssvWallet.save();
    }
    res.status(200).send({
      data: { user: isUserCreated },
      error: null,
      status: 1,
      message: 'User Account Created Succuessfully'
    })
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: 'Error in creating the User'
    })
  }
};
  
exports.userLogin = async (req, res) => {
  try {
    var isUserExist
    if (req.body.email) {
      isUserExist = await userModel.findOne({ email: req.body.email }).lean();
    } else if (req.body._id) {
      isUserExist = await userModel.findOne({ ssv_id: req.body.ssv_id }).lean();
    }
    if (!isUserExist) {
      return res.status(400).send({
        data: null,
        error: "Email Doesn't Exists",
        status: 1,
        message: "User with mail Doesn't  Exists"
      })
    }
    const isPasswordMatches = await bcrypt.compare(req.body.password, isUserExist.password);
    if (!isPasswordMatches) {
      return res.status(400).send({
        data: null,
        error: 'Incorrect Password',
        status: 0,
        message: 'Enter Incorrect Password'
      })
    }
    const token = jwt.sign({ authId: isUserExist._id}, process.env.JWT_TOKEN_KEY,{expiresIn: '2h' });
    res.status(200).send({
      data: { 
        _id: isUserExist._id,
        user: isUserExist.email, 
        userName: isUserExist.userName,
        token: token, 
        ssv_id:ssv_id
      },
      error: null,
      status: 1,
      message: 'Login Succuessfull'
    })
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: 'Error in Logging the User'
    })
  }
};

exports.email_otp = async(req,res)=> {
  try {
    const find_email = await userModel.findOne({email:req.body.email});
    if (find_email) { 
      const random_number = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      });
      const update_otp = await userModel.findOneAndUpdate({email:req.body.email},
        {verify_otp:random_number},{new:true}
      )
      sendEmail({
        html: data.VERIFYEMAIL.html(update_otp.verify_otp),
        subject: `OTP : ${random_number}` ,
        email: update_otp.email,
      });
      res.status(200).send({
        data:{verify_otp:update_otp},
        error:null,
        status:1,
        message:"otp send to your email"
      })
    } else {
      res.status(200).send({
        data:null,
        error:null,
        status:1,
        message:"user not found"
      })
    }
  } catch (error) {
    res.status(400).send({
      data:null,
      error:error,
      status:0,
      message:"Error in sending passcode to your email"
    })
  }
};

exports.verify_otp = async(req,res)=> {
  try {
    const find_user = await userModel.findOne({email:req.body.email})
    if (find_user) {
      if (req.body.verify_otp == find_user.verify_otp) { 
        const token = jwt.sign({ authId: find_user._id}, process.env.JWT_TOKEN_KEY,{expiresIn: '5m' });
        res.status(200).send({
          data:{find_user,token:token},
          message:"Verify OTP successfully",
          status:1,
          error:null
        })
      } else {
        res.status(200).send({
          message:"Invalid OTP",
          status:1,
          error:null
        })
      }
    } else {
      res.status(200).send({
        message:"email not found",
        status:1,
        error:null
      })
    }
  } catch (error) { 
    res.status(400).send({
      error:error,
      message:"error in Verifying OTP ",
      status:0
    })
  }
};

exports.forget_password = async(req,res)=> {
  try {
    const user = await userModel.findOne({_id:req.body.userId}).lean();
    console.log(req.body.userId,"user")
    const schema =new userModel({
      password : req.body.newPassword
    })
    schema.password = schema.generateHash(schema.password);
    console.log(schema.password,"pass")
    const update_password = await userModel.findOneAndUpdate({_id:req.body.userId},{
      password:schema.password,
    },{new:true})
    res.status(200).send({
      data:update_password,
      message:"Password updated successfully",
      status:1,
      error:null
    })
  } catch (error) {
    res.status(400).send({
      error:error,
      message:"error in forget password",
      status:0
    })
  }
};

exports.getUser = async(req,res)=> {
  try {
    const get_user = await userModel.findOne({_id:req.body.userId}).lean();
    res.status(200).send({
      data:{users:get_user},
      error:null,
      status:1,
      message:"Getting user successfully"
    })
  } catch (error) {
    res.status(400).send({
      data:null,
      error:error,
      status:0,
      message:"Error in getting user"
    }) 
  }
};

exports.get_users = async(req,res)=>{
  try {
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
    const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;
    const users = await userModel.find().lean().skip((pageNumber - 1) * pageSize)
    .limit(pageSize).sort({ _id: -1 });
    const count = await userModel.countDocuments()
    res.status(200).send({
      data:{users:users,count:count},
      error:null,
      status:1,
      message:"Getting users successfully"
    })
  } catch (error) {
    res.status(400).send({
      data:null,
      error:error,
      status:0,
      message:"Error in getting users"
    }) 
  }
};

exports.userFilters = async(req,res)=>{
  try {
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
    const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;
    var search = {}
    if(req.query.date){
      const date1 = req.query.date + "T00:00:00.000Z";
      const date2 = req.query.date + "T23:59:59.999Z";
      search = {createdAt: { $gte: new Date(date1), $lte: new Date(date2) } };
    }
    else if(req.query.email){
      search = {email:{$regex:req.query.email + ".*",$options:"i"}}
    }
    else if(req.query.userName){
      search = {userName:{$regex:req.query.userName+".*",$options:"i"}}
    }
    else if(req.query.referralId){
      search = {referralId:{$regex:req.query.referralId+".*",$options:"i"}}
    }
    else if(req.query.ssv_id){
      search = {ssv_id:{$regex:req.query.ssv_id+".*",$options:"i"}}
    }
    const filters = await userModel.find(search).lean().skip((pageNumber - 1) * pageSize)
    .limit(pageSize).sort({ _id: -1 });
    const count = await userModel.countDocuments(search);
    res.status(200).send({
      data:{users:filters,count:count},
      error:null,
      status:1,
      message:"Getting user filters successfully"
    })
  } catch (error) {
    res.status(400).send({
      data:null,
      error:error,
      status:0,
      message:"Error in filters"
    })
  }
}