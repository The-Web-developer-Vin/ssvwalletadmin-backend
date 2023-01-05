const mongoose = require("mongoose");
const depositModel = require("../models/deposit.model");
const ssv_walletModel = require("../models/ssv_wallet.model");
const floorsModel = require("../models/floors.model");
const floor_countModel = require("../models/floor_count.model");


exports.createDeposit = async(req,res)=> {
    try {
        const schema = new depositModel()
            schema.amount =  req.body.amount
            schema.payment_type = req.body.payment_type
            schema.transactionHash = req.body.transactionHash
            schema.status = "processing"
            schema.userId = req.body.userId
        const deposit = await depositModel.create(schema)
        // if(deposit){
        //     const depWallet_user = await depositWalletModel.findOne({userId:req.userAuthId}).lean();
        //     const depWallet = await depositWalletModel.findOneAndUpdate({userId:req.userAuthId},
        //         {totalAmount: parseFloat(totalAmount) + parseFloat(req.body.amount)
        //         },{new:true}
        //     )
        // }
        res.status(200).send({
            data:{Deposits:deposit},
            error:null,
            status:1,
            message:"Created deposits successfully"
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"error in creating deposit"
        })
    }
};

exports.getdeposits = async(req,res)=> {
    try {
        const d = new Date();
        let hour = d.getHours();
        console.log(hour,"hour1111111111");
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
        const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;
        const get_deposits = await depositModel.find().lean().populate("userId").skip((pageNumber - 1) * pageSize)
        .limit(pageSize).sort({ _id: -1 });
        const count = await depositModel.countDocuments();
        res.status(200).send({
            data:{Deposits:get_deposits,count:count},
            error:null,
            status:1,
            message:"Getting deposits successfully"
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"error in getting deposit"
        })
    }
};

exports.get_deposit = async(req,res)=> {
    try {
        const get_deposits = await depositModel.find({userId:req.body.userId}).lean().populate("userId").skip((pageNumber - 1) * pageSize)
        .limit(pageSize).sort({ _id: -1 });
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
        const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;
        const count = await depositModel.countDocuments({userId:req.body.userId});
        res.status(200).send({
            data:{Deposits:get_deposits,count:count},
            error:null,
            status:1,
            message:"Getting deposits successfully"
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"error in getting deposit"
        })
    }
};

exports.delete = async(req,res)=> {
    try {
        const delete_deposit = await depositModel.findOneAndDelete({_id:req.params.depositId}).lean();
        res.status(200).send({
            data:{Deposits:delete_deposit},
            error:null,
            status:1,
            message:"Deleting deposits"
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in deleting deposits"
        })
    }
};

exports.deposits_filters = async(req,res)=>{
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
        else if(req.query.payment_type){
            search = { payment_type: { $regex:req.query.payment_type + ".*", $options:"i" } }
        }
        else if(req.query.transactionHash){
            search = {transactionHash: {$regex:req.query.transactionHash + ".*", $options:"i" } }
        }
        else if(req.query.status){
            search = {status: {$regex:req.query.status + ".*",$options:"i" } }
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
                    payment_type:"$payment_type",
                    transactionHash:"$transactionHash",
                    status:"$status",
                    email:"$Users.email",
                    image:"$image"
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
        const filters = await depositModel.aggregate(data);
        const deposits = filters.slice((pageNumber - 1) * pageSize, pageNumber * pageSize)
        .sort();
        const count = filters.length;
        res.status(200).send({
            data:{deposits:deposits,count:count},
            error:null,
            status:1,
            message:"Getting deposits filters Succesfully"
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in deposits filters"
        })        
    }
};

exports.status_reject = async(req,res)=>{
    try {
        const update_status = await depositModel.findOneAndUpdate({
            _id:req.body.depositId},{status:"reject"},{new:true}
        );
        res.status(200).send({
            data:update_status,
            error:null,
            status:1,
            message:"Updated the deposits status Successfully"
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in updating deposits Status"
        })
    }
};

exports.status_approvel = async(req,res)=>{
    try {
        const get_deposit = await depositModel.findOne({_id:req.body.depositId}).lean();
        console.log("data12847t")
        if(get_deposit){
            const get_deposit = await depositModel.findOneAndUpdate({_id:req.body.depositId},{status:"approved"},{new:true}).lean();
            if (get_deposit.amount == 30) {
                const getfloorCount = await floor_countModel.find().limit(1).sort({ _id: -1 }).lean();
                console.log(getfloorCount, 'step 1')
                if (getfloorCount.length > 0) {
    
                    if (getfloorCount[0].no_of_users >= 15) {
                        console.log("step no_of_users")
                        reinvest(getfloorCount[0].floorNo)
                        const schema = new floor_countModel();
                        schema.floorNo = getfloorCount[0].floorNo + 1;
                        schema.no_of_users = 1;
                        schema.reinvestment_count = 0;
                        const create_floorcount = await floor_countModel.create(schema)
                        const schema1 = new floorsModel();
                        schema1.userId = get_deposit.userId;
                        schema1.floorNo = create_floorcount.floorNo;
                        schema1.count = 0;
                        schema1.investment = 'F';
                        schema1.position = create_floorcount.no_of_users;
                        const floor_create = await floorsModel.create(schema1)
                    } else {
                        console.log("else step")
                        const update_floorCount = await floor_countModel.findOneAndUpdate({ _id: getfloorCount[0]._id },
                            {
                                $inc: { no_of_users: parseInt(1) }
                            }, { new: true });
                        const getFloor = await floorsModel.find({ floorNo: update_floorCount.floorNo }).lean();
                        for (let f = 0; f < getFloor.length; f++) {
                            const update_floors = await floorsModel.findOneAndUpdate({ _id: getFloor[f]._id },
                                { $inc: { count: parseInt(1) } }, { new: true });
                            const update_wallet = await ssv_walletModel.findOneAndUpdate({ userId: getFloor[f].userId },
                                { $inc: { amount: parseInt(3) } }, { new: true });
                            console.log(update_wallet, "updatew")
    
                        }
                        const schema1 = new floorsModel();
                        schema1.userId = get_deposit.userId;
                        schema1.floorNo = getfloorCount[0].floorNo;
                        schema1.count = 0;
                        schema1.investment = 'F';
                        schema1.position = update_floorCount.no_of_users;
                        const floor_create = await floorsModel.create(schema1)
    
                    }
    
                } else {
                    const schema = new floor_countModel();
                    schema.floorNo = 1;
                    schema.no_of_users = 1;
                    schema.reinvestment_count = 0;
                    const create_floorcount = await floor_countModel.create(schema)
    
                    const schema1 = new floorsModel();
                    schema1.userId = get_deposit.userId;
                    schema1.floorNo = create_floorcount.floorNo;
                    schema1.count = 0;
                    schema1.investment = 'F';
                    schema1.position = create_floorcount.no_of_users;
                    const floor_create = await floorsModel.create(schema1)
    
                }
                res.status(200).send({
                    status: 1,
                    message: "deposit approved successfully"
                })
            } else {
                res.status(400).send({
                    status: 1,
                    message: "your not deposit correct amount"
                })
            }
        }else{
            res.status(200).send({
                data:null,
                status:0,
                message:"deposit not found"
            })
        }
        // res.status(200).send({
        //     data:update_status,
        //     error:null,
        //     status:1,
        //     message:"Updated deposit status successfully"
        // })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in updating the deposit status"
        })
    }
}
async function reinvest(floorNo) {
    for (let i = 0; i < 15; i++) {
        const getdata = await floorsModel.find({ floorNo }).sort({ position: -1 }).lean()
        console.log(getdata, "getdata")
        for (let j = 0; j < getdata.length; j++) {
            const update_floor = await floorsModel.findOneAndUpdate({ _id: getdata[j]._id }, {
                count: getdata[j].count == 14 ? 0 : getdata[j].count + 1,
                position: getdata[j].position == 15 ? 1 : getdata[j].position + 1,
                $inc: { reinvest_count: parseInt(1) },
                investment: "R"
            }, { new: true })
            console.log(update_floor, "update_floor")
            if (getdata[j].position == 15) {
                const update_wallet = await ssv_walletModel.findOneAndUpdate({ userId: getdata[j].userId },
                    { $inc: { amount: parseInt(-30) } }, { new: true });
            } else {
                const update_wallet = await ssv_walletModel.findOneAndUpdate({ userId: getdata[j].userId },
                    { $inc: { amount: parseInt(3) } }, { new: true });
            }
        }
        const update_floorCount = await floor_countModel.findOneAndUpdate({ floorNo: floorNo },
            { $inc: { reinvestment_count: parseInt(1) } }, { new: true })
    }
}