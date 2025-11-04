const express = require("express");
const { getRecentClientDetails, getRecentCampDetails, totalCountDetails, totalCountDetailsClient } = require("../controller/dashboard.controller");
const router = express.Router();

router.post("/getRecentClientDetails",getRecentClientDetails)
router.post("/getRecentCampDetails",getRecentCampDetails)
router.post("/totalCountDetails",totalCountDetails)
router.post("/totalCountDetailsClient",totalCountDetailsClient)


module.exports= router;