const express = require("express");
const {logout,loginWithEmpCode} = require("../controller/auth.controller");
const router = express.Router();

router.post("/login",loginWithEmpCode)
router.post("/logout",logout)


module.exports= router;