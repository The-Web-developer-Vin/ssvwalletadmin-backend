const router = require("express").Router();
const adminController = require("../controllers/Admin.controller");

router.post("/signUp",adminController.signUp);

router.post("/login",adminController.login);

router.get('/',adminController.getAll);

router.delete("/:adminId",adminController.delete);

module.exports = router;