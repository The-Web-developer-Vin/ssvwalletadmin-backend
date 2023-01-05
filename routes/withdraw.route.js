const router = require("express").Router();
const withdrawController = require("../controllers/withdraw.controller");
const verify = require("../middlewares/Authentication");

router.post("/createWithdraws",verify,withdrawController.createWithdraw);

router.get("/getAll",withdrawController.getAllWithdraws);

router.get("/getWithdraws",verify,withdrawController.getUserWithdraw);

router.delete("/:withdrawId",verify,withdrawController.delete);

router.get("/get/withdraw_filters",withdrawController.withdraws_filters);

router.post("/update/status_approvel",withdrawController.status_approvel);

router.post("/update/status_reject",withdrawController.status_reject);

module.exports = router;