const mongoose = require("mongoose");
const adminModel = require("../models/Admin.model");
const jwt = require("jsonwebtoken");

exports.signUp = async(req,res)=> {
    try {
        const admin = req.body;
        const adminId = req.body.adminId && mongoose.isValidObjectId(req.body.adminId)
            ? req.body.adminId :mongoose.Types.ObjectId();
        const adminCreated = await adminModel.findOneAndUpdate(
            {_id:adminId},admin,{new:true,upsert:true}
        ) 
        res.status(200).send({
            data:{Admin:adminCreated},
            error:null,
            status:1,
            message:"Created admin successfully"
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in creating admins"
        })
    }
};

exports.login = async(req,res)=> {
    try {
        const admin = await adminModel.findOne({email:req.body.email});
        if (!admin) {
            return res.send({
                data:null,
                error:error,
                message:"admin with mail doesn't Exists",
            });
        } 
        if (admin.password == req.body.password) {
            const token = jwt.sign(
                {_id:admin._id},
                process.env.JWT_TOKEN_KEY
            );
            res.status(200).send({
                data:{admin:admin,token:token},
                error:null,
                status:1,
                message:"login Successfully"
            })
        } else {
            res.status(200).send({
                data:null,
                error:null,
                status:1,
                message:"Incorrect password "
            })
        }
    } catch (error) {
        res.status(200).send({
            data:null,
            error:error,
            status:0,
            message:"Error in login the admin"
        })
    }
};

exports.getAll = async(req,res)=> {
    try {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) :10;
        const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;
        const get_admins = await adminModel.find().lean().limit(pageSize).sort({_id:-1})
        .skip((pageNumber - 1) * pageSize);
        const count = await adminModel.countDocuments();
        res.status(200).send({
            data:{Admins:get_admins,count:count},
            error:null,
            status:1,
            message:"Getting all Admins Successfully"
        })
    } catch (error) {
       res.status(400).send({
        data:null,
        error:error,
        status:0,
        message:"Error in getting all admins"
       }) 
    }
};

exports.delete = async(req,res)=> {
    try {
        const admin = await adminModel.findOneAndDelete({_id:req.params.adminId});
        res.status(200).send({
            data:{Admin:admin},
            error:null,
            status:1,
            message:"Deleted admin successfully"
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in deleting the admin"
        })
    }
};