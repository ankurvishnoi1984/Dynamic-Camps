const express = require("express");
const { createCampType, createCampConfig, getActiveCamps, getCampFieldDetails, createMonthlyCamp, submitFormAnswers, getCampTypeDetailsAdmin, getCampTypeList, getActiveCampsNavList, getMonthlyCampsList, getCampSubmissionsFull, monthlyCampsAdminReports } = require("../controller/monthlyCamps.controller");
const router = express.Router();

router.post("/createCampType",createCampType)
router.post("/createCampConfig",createCampConfig)
router.post("/getActiveCamps",getActiveCamps)
router.post("/getCampFieldDetails",getCampFieldDetails)
router.post("/createMonthlyCamp",createMonthlyCamp)
router.post("/submitFormAnswers",submitFormAnswers)
router.post("/getCampDetailsAdmin",getCampTypeDetailsAdmin)
router.post("/getAllCampType",getCampTypeList)
router.post("/getMonthlyCampsList",getMonthlyCampsList)
router.post("/getActiveCampsNavList",getActiveCampsNavList)
router.post("/getCampSubmissionsFull",getCampSubmissionsFull)
router.post("/monthlyCampsAdminReports",monthlyCampsAdminReports)


module.exports= router;