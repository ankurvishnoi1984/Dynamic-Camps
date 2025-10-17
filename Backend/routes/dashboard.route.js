const express = require("express");
const { getRecentClientDetails, getRecentCampDetails } = require("../controller/dashboard.controller");
const router = express.Router();

router.post("/getRecentClientDetails",getRecentClientDetails)
router.post("/getRecentCampDetails",getRecentCampDetails)


module.exports= router;