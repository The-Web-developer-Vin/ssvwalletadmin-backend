const router = require("express").Router();
const depositController = require("../controllers/deposit.controller");
const verify = require("../middlewares/Authentication");

router.post("/createDeposit",verify,depositController.createDeposit);

router.get("/getDeposits",depositController.getdeposits);

router.get("/get_deposits",verify,depositController.get_deposit);

router.delete("/:depositId",verify,depositController.delete);

router.get("/get/deposit_filter",depositController.deposits_filters);

router.post("/update/status_reject",depositController.status_reject);

router.post("/update/status_approvel",depositController.status_approvel);



module.exports = router;