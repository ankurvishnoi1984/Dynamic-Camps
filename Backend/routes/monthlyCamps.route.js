const express = require("express");
const { createCampType, createCampConfig, getActiveCamps, getCampFieldDetails, createMonthlyCamp, submitFormAnswers } = require("../controller/monthlyCamps.controller");
const router = express.Router();

router.post("/createCampType",createCampType)
router.post("/createCampConfig",createCampConfig)
router.post("/getActiveCamps",getActiveCamps)
router.post("/getCampFieldDetails",getCampFieldDetails)
router.post("/createMonthlyCamp",createMonthlyCamp)
router.post("/submitFormAnswers",submitFormAnswers)


module.exports= router;