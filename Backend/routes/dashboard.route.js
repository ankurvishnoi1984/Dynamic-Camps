const express = require("express");
const { getRecentClientDetails, getRecentCampDetails, totalCountDetails, totalCountDetailsClient, getRecentCampDetailsDeptWise } = require("../controller/dashboard.controller");
const router = express.Router();

router.post("/getRecentClientDetails",getRecentClientDetails)
router.post("/getRecentCampDetailsDeptWise",getRecentCampDetailsDeptWise)
router.post("/getRecentCampDetails",getRecentCampDetails)
router.post("/totalCountDetails",totalCountDetails)
router.post("/totalCountDetailsClient",totalCountDetailsClient)


module.exports= router;