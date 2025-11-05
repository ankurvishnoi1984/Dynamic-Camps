const express = require("express");
const { addNewClient, getClientDetails, updateClient } = require("../controller/client.controller");
const { upload } = require("../config/multer");
const router = express.Router();

router.post("/addNewClient",upload.any(),addNewClient)
router.post("/getClientDetails",getClientDetails)
router.post("/updateClient",upload.any(),updateClient)


module.exports= router;