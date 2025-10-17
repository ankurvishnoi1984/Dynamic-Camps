const express = require("express");
const { createCampType, createCampConfig, getActiveCamps, getCampFieldDetails } = require("../controller/monthlyCamps.controller");
const router = express.Router();

router.post("/createCampType",createCampType)
router.post("/createCampConfig",createCampConfig)
router.post("/getActiveCamps",getActiveCamps)
router.post("/getCampFieldDetails",getCampFieldDetails)


module.exports= router;