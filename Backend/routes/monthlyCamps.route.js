const express = require("express");
const { createCampType, createCampConfig, getActiveCamps, getCampFieldDetails, createMonthlyCamp, submitFormAnswers, getCampTypeDetailsAdmin, getCampTypeList, getActiveCampsNavList, getMonthlyCampsList, getCampSubmissionsFull, monthlyCampsAdminReports, updateCampType, updateMonthlyCamp, manageCampStatus, getMonthlyCampsPrescriptionImages, saveBrandImages, getCampsNavListAdmin } = require("../controller/monthlyCamps.controller");
const { upload } = require("../config/multer");
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
router.post("/updateCampType",updateCampType)
router.post("/updateMonthlyCamp",updateMonthlyCamp)
router.post("/manageCampStatus",manageCampStatus);
router.post("/getMonthlyCampsPrescriptionImages",getMonthlyCampsPrescriptionImages)
router.post("/saveBrandImages",upload.any(),saveBrandImages)
router.post("/getCampsNavListAdmin",getCampsNavListAdmin)



module.exports= router;