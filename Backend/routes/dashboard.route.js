const express = require("express");
const { getRecentClientDetails } = require("../controller/dashboard.controller");
const router = express.Router();

router.post("/getRecentClientDetails",getRecentClientDetails)


module.exports= router;