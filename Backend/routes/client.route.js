const express = require("express");
const { addNewClient } = require("../controller/client.controller");
const router = express.Router();

router.post("/addNewClient",addNewClient)


module.exports= router;