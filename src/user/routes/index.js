const express = require("express");
const router = express.Router();

const authController = require("../controller/user.controller");
const authMiddleware = require("../../middleware/auth.middleware");

router.post("/auth/signup", authController.signup);

router.post("/auth/login", authController.login);

router.post("/auth/admin/login", authController.adminLogin);

module.exports = router;
