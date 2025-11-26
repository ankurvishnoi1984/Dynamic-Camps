const express = require("express");
const { insertDesignations, getDesignationsDeptWise } = require("../controller/designation.controller");
const router = express.Router();

router.post("/insertDesignations",insertDesignations)
router.post("/getDesignationsDeptWise",getDesignationsDeptWise)


module.exports= router;