const express = require("express");
const { upload } = require("../config/multer");
const { addNewDepartment, getDepartmentDetails } = require("../controller/department.controller");
const router = express.Router();

router.post("/addNewDepartment",upload.any(),addNewDepartment)
router.post("/getDepartmentDetails",getDepartmentDetails)


module.exports= router;