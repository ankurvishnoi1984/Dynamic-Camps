const express = require("express");
const { insertDesignations, getDesignationsDeptWise, updateDesignations } = require("../controller/designation.controller");
const router = express.Router();

router.post("/insertDesignations",insertDesignations)
router.post("/getDesignationsDeptWise",getDesignationsDeptWise)
router.put("/updateDesignations",updateDesignations)


module.exports= router;