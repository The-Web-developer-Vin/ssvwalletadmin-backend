const router = require("express").Router();
const userController = require("../controllers/user.controller");
const verify = require("../middlewares/Authentication");

router.post("/signup",userController.userSignUp);

router.post("/login",userController.userLogin);

router.post("/verify_otp",userController.verify_otp);

router.post("/geneOTP",userController.email_otp);

router.post("/forget_password",userController.forget_password);

router.get("/:userId",userController.getUser);

router.get("/",userController.get_users);

router.get("/get/user_filters",userController.userFilters);

module.exports = router;