const express = require("express");
const { createCampType, createCampConfig } = require("../controller/monthlyCamps.controller");
const router = express.Router();

router.post("/createCampType",createCampType)
router.post("/createCampConfig",createCampConfig)


module.exports= router;