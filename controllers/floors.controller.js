const mongoose = require("mongoose");
const floorsModel = require("../models/floors.model");
const floor_countModel = require("../models/floor_count.model");
const ssv_walletModel = require("../models/ssv_wallet.model");
const userModel = require("../models/user.model");

// exports.floors = async (req, res) => {
//     try {
//         const find = await floorsModel.find().limit(5).sort({ _id: -1 })//15
//         // console.log(find[14],"find")
//         if (find.length > 0) {
//             for (let i = 0; i < find.length; i++) {
//                 const update_user = await floorsModel.findOneAndUpdate({ _id: find[i]._id }, {
//                     count: parseInt(find[i].count) + 1
//                 }, { new: true })
//             }
//         }
//         const findposition = await position_countModel.findOne({ type: "position" }).lean();
//         var update;
//         if (findposition) {
//             update = await position_countModel.findOneAndUpdate({ _id: findposition._id }, {
//                 position_count: parseInt(findposition.position_count) + 1
//             }, { new: true })
//         } else {
//             const schema = new position_countModel();
//             schema.position_count = 1;
//             schema.type = "position";
//             update = await position_countModel.create(schema)
//         }
//         const find15 = await floorsModel.findOne({ count: 5 }) //15
//         const find5 = await floorsModel.find().limit(5)
//         if (find15) {
//             for (let j = 0; j < find5.length; j++) {
//                 if (find5[j].reinvest_count < 2) {
//                     const schema = new floorsModel()
//                     schema.userId = find5[j].userId;
//                     schema.investment = "R";
//                     schema.position = update.position_count;
//                     schema.reinvest_count = parseInt(find5[j].reinvest_count) + 1;
//                     const create = await floorsModel.create(schema);
//                     // res.status(200).send({
//                     //     data:create,
//                     //     error:null,
//                     //     status:1,
//                     //     message:"Floors Created Successfully"
//                     // })
//                 }
//             }
//         } else {
//             const schema = new floorsModel()
//             schema.userId = req.body.userId;
//             schema.investment = req.body.investment;
//             schema.position = update.position_count;
//             schema.reinvest_count = 0;
//             const create = await floorsModel.create(schema);
//             res.status(200).send({
//                 data: create,
//                 error: null,
//                 status: 1,
//                 message: "Floors Created Successfully"
//             })
//         }
//     } catch (error) {
//         res.status(400).send({
//             data: null,
//             error: error,
//             status: 0,
//             message: "error in floors"
//         })
//     }
// }

exports.create = async (req, res) => {
    try {
        if (req.body.deposit_amount == 25) {
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
                    schema1.userId = req.body.userId;
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
                        }, { new: true }
                    );
                    const getFloor = await floorsModel.find({ floorNo: update_floorCount.floorNo }).lean();
                    for (let f = 0; f < getFloor.length; f++) {
                        const update_floors = await floorsModel.findOneAndUpdate({ _id: getFloor[f]._id },
                            { $inc: { count: parseInt(1) } }, { new: true });
                        const update_wallet = await ssv_walletModel.findOneAndUpdate({ userId: getFloor[f].userId },
                            { $inc: { amount: parseInt(5) } }, { new: true });
                        console.log(update_wallet, "updatew")
                    }
                    const schema1 = new floorsModel();
                    schema1.userId = req.body.userId;
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
                schema1.userId = req.body.userId;
                schema1.floorNo = create_floorcount.floorNo;
                schema1.count = 0;
                schema1.investment = 'F';
                schema1.position = create_floorcount.no_of_users;
                const floor_create = await floorsModel.create(schema1)
            }
            res.status(200).send({
                status: 1,
                message: "created successfully"
            })
        } else {
            res.status(400).send({
                status: 1,
                message: "your not deposit correct amount"
            })
        }
    } catch (error) {
        res.status(400).send({
            data: null,
            error: error,
            status: 0,
            message: "error in creating floor"
        })
    }
};

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
                    { $inc: { amount: parseInt(-25) } }, { new: true });
            } else {
                const update_wallet = await ssv_walletModel.findOneAndUpdate({ userId: getdata[j].userId },
                    { $inc: { amount: parseInt(5) } }, { new: true });
            }
        }
        const update_floorCount = await floor_countModel.findOneAndUpdate({ floorNo: floorNo },
            { $inc: { reinvestment_count: parseInt(1) } }, { new: true })
    }
};

exports.ssvCreate = async (req, res) => {
    try {
        const schema = new ssv_walletModel();
        schema.userId = req.body.userId;
        schema.amount = 0;
        const create = await ssv_walletModel.create(schema);
        res.status(200).send({
            data: create,
            error: null,
            status: 1,
            message: "creating wallet successfully"
        })
    } catch (error) {
        res.status(400).send({
            data: null,
            error: error,
            status: 0,
            message: "error in creating wallet"
        })
    }
};

exports.getSSVWallet = async(req,res)=> {
    try {
        const ssv_wallet = await ssv_walletModel.findOne({userId:req.params.userId});
        res.status(200).send({
            data: {ssvWallet : ssv_wallet},
            error: null,
            status: 1,
            message: "getting ssv wallet successfully"
        })
    } catch (error) {
        res.status(400).send({
            data: null,
            error: error,
            status: 0,
            message: "error in getting ssv wallet"
        })
    }
};

exports.getAllFloors = async(req,res)=>{
    try {
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
    const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;
    const floors = await floor_countModel.find().lean().skip((pageNumber - 1) * pageSize)
    .limit(pageSize).sort({ _id: -1 });
    const count = await floor_countModel.countDocuments()
    res.status(200).send({
      data:{floors:floors,count:count},
      error:null,
      status:1,
      message:"Getting floors successfully"
    })
    } catch (error) {
        res.status(400).send({
            data: null,
            error: error,
            status: 0,
            message: "error in getting floors"
        })
    }
};

exports.floor_filters = async(req,res)=>{
    try {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
        const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) :1;
        var search = {};
        const date1 = req.query.date + "T00:00:00.000Z";
        const date2 = req.query.date + "T23:59:59.999Z";
        if(req.query.date){
            search = { createdAt : { $gte: new Date(date1), $lte: new Date(date2) } }
        }
        else if(req.query.floorNo){
            search = { floorNo: parseFloat(req.query.floorNo)}
        }
        else if(req.query.no_of_users){
            search = { no_of_users: parseFloat(req.query.no_of_users)}
        }
        else if(req.query.reinvestment_count){
            search = { reinvestment_count: parseFloat(req.query.reinvestment_count)}
        }
        const floors = await floor_countModel.find(search).skip((pageNumber - 1) * pageSize)
        .limit(pageSize).sort({_id:-1}).lean();
        const count = await floor_countModel.countDocuments(search);
        res.status(200).send({
            data:{floors:floors,count:count},
            error:null,
            status:1,
            message:"Getting floor filters successfully"
        })
    } catch (error) {
        res.status(400).send({
            data:null,
            error:error,
            status:0,
            message:"Error in floor filters"
        })
        
    }
}