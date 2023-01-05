const mongoose = require("mongoose");
const withdrawModel = require("../models/withdraw.model");
const ssv_walletModel = require("../models/ssv_wallet.model")

exports.createWithdraw = async(req,res)=> {
    try {
        const find_user = await ssv_walletModel.findOne({userId:req.userAuthId});
        if (find_user) {
            if (find_user.amount<=req.body.amount) {
                res.status(200).send({
                    status:1,
                    message:"Insufficient amount in your ssv wallet"
                })
            } else {
                const update_wallet = await ssv_walletModel.findOneAndUpdate({userId:req.userAuthId},{
                    amount:parseFloat(find_user.amount)-parseFloat(req.body.amount)
                },{new:true})
                const schema = new withdrawModel()
                schema.userId = req.userAuthId
                schema.amount = req.body.amount
                schema.contactAddress = req.body.contactAddress
                schema.withdrawOption = req.body.withdrawOption
                schema.status = "processing"
                const withdraw = await withdrawModel.create(schema)
                res.status(200).send({
                    data:{update_wallet:update_wallet,withdraw:withdraw},
                    error:null,
                    status:1,
                    message:"Updated the ssv wallet"
                })
            }
        } else {
            res.status(200).send({
                status:1,
                message:"User not found"
            })
        }
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in Creating withdraw"
        })
    }
};

exports.getAllWithdraws = async(req,res)=> {
    try {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
        const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;
        const get_withdraws = await withdrawModel.find().lean().populate("userId").skip((pageNumber - 1) * pageSize)
        .limit(pageSize).sort({ _id: -1 });
        const count = await withdrawModel.countDocuments();
        res.status(200).send({
            data:{Withdraws:get_withdraws,count:count},
            error:null,
            status:1,
            message:"Getting withdraws successfully"
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in getting withdraws"
        })
    }
};

exports.getUserWithdraw = async(req,res)=> {
    try {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
        const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;
        const get_withdraws = await withdrawModel.find({userId:req.body.userId}).lean().populate("userId").skip((pageNumber - 1) * pageSize)
        .limit(pageSize).sort({ _id: -1 });
        const count = await withdrawModel.countDocuments({userId:req.body.userId});
        res.status(200).send({
            data:{Withdraws:get_withdraws,count:count},
            error:null,
            status:1,
            message:"Getting withdraws successfully"
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in getting withdraws"
        })
    }
};

exports.delete = async(req,res)=> { 
    try {
        const delete_withdraw = await withdrawModel.findOneAndDelete({_id:req.params.withdrawId}).lean();
        res.status(200).send({
            data:{Withdraws:delete_withdraw},
            status:1,
            error:null,
            message:"Deleting Withdraw Successfully"
        })  
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in getting withdraws"
        })
    }
};

exports.withdraws_filters = async(req,res)=>{
    try {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
        const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) :1;
        var search = {};
        if(req.query.date){
            const date1 = req.query.date + "T00:00:00.000Z";
            const date2 = req.query.date + "T23:59:59.000Z";
            search = { createdAt: {$gte: new Date(date1), $lte: new Date(date2) } }
        }  
        else if(req.query.amount){
            search = {amount:parseFloat(req.query.amount)}
        }
        else if(req.query.status){
            search = { status: { $regex:req.query.status + ".*", $options:"i" } }
        }
        else if(req.query.contactAddress){
            search = {contactAddress: {$regex:req.query.contactAddress + ".*", $options:"i" } }
        }
        else if(req.query.withdrawOption){
            search = {withdrawOption: {$regex:req.query.withdrawOption + ".*",$options:"i" } }
        }
        const data = [
            {
                $match:search
            },
            {
                $lookup:{
                    from:"users",
                    localField:"userId",
                    foreignField:"_id",
                    as:"Users"
                }
            },
            {
                $project:{
                    date:"$createdAt",
                    amount:"$amount",
                    status:"$status",
                    withdrawOption:"$withdrawOption",
                    contactAddress:"$contactAddress",
                    email:"$Users.email"
                }
            },
            {
                $unwind:{ path: "$email", preserveNullAndEmptyArrays: true }
            }
        ]
        if(req.query.email){
            data.splice(2,0,{
                $match:{"Users.email":{$regex:".*" + req.query.email + ".*" } }
            })
        }
        const filters = await withdrawModel.aggregate(data);
        const withdraws = filters.slice((pageNumber - 1) * pageSize, pageNumber * pageSize)
        .sort();
        const count = filters.length;
        res.status(200).send({
            data:{withdraws:withdraws,count:count},
            error:null,
            status:1,
            message:"Getting withdraws filters Succesfully"
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in withdraws filters"
        })        
    }
};

exports.status_approvel = async(req,res)=>{
    try {
        const update_status = await withdrawModel.findOneAndUpdate({_id:req.body.withdrawId},
           {status:"approvel"},{new:true} 
        )
        res.status(200).send({
            data:update_status,
            error:null,
            status:1,
            message:"Updated withdraws status successfully"
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in updating withdraws status"
        })
    }
};

exports.status_reject = async(req,res)=>{
    try {
        const update_status = await withdrawModel.findOneAndUpdate({_id:req.body.withdrawId},
            {status:"reject"},{new:true}
        )
        if(update_status){
            const find_wallet = await ssv_walletModel.findOne({userId:update_status.userId}).lean();
            if(find_wallet){
                const update_wallet = await ssv_walletModel.findOneAndUpdate({userId:update_status.userId},
                  {amount: parseFloat(find_wallet.amount) + parseFloat(update_status.amount)}  
                );
                res.status(200).send({
                    data: { Withdraw: update_wallet },
                    error: null,
                    status: 1,
                    message: "Updated the withdraws successfully"
                })
            } else {
                const schema = new ssv_walletModel()
                schema.amount = parseInt(update_status.amount)
                schema.userId = update_status.userId
                schema.save()
                res.status(200).send({
                    data: { Withdraw: update_status },
                    error: null,
                    status: 1,
                    message: "Updated the withdraws successfully"
                })
            }
        } else {
            res.status(200).send({
                data: null,
                status: 0,
                message: "withdraw updated failed"
            })
        }
        
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in updating the withdraws status"
        })
    }
};