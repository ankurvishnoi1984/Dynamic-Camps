const express = require("express");
const { getBrandsList } = require("../controller/basic.controller");
const router = express.Router();

router.post("/getBrandsList",getBrandsList)


module.exports= router;