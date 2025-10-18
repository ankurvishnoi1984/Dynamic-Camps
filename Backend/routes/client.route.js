const express = require("express");
const { addNewClient, getClientDetails } = require("../controller/client.controller");
const { upload } = require("../config/multer");
const router = express.Router();

router.post("/addNewClient",upload.any(),addNewClient)
router.post("/getClientDetails",getClientDetails)


module.exports= router;