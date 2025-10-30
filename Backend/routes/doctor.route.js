const express = require("express");
const { getDoctorList } = require("../controller/doctor.controller");
const router = express.Router();

router.post("/getDoctorList",getDoctorList)


module.exports= router;