const express = require('express');
const router = express.Router();
const verify = require("../middlewares/Authentication");
const floorsController = require("../controllers/floors.controller");

// router.post("/floors",floorsController.floors);

router.post("/floor",verify,floorsController.create);

router.post('/create_wallet',verify,floorsController.ssvCreate);

router.get("/:userId",floorsController.getSSVWallet);

router.get("/",floorsController.getAllFloors);

router.get("/get/floor_filters",floorsController.floor_filters)

module.exports = router;