const express = require("express");
const { getEmployeeWithId, getAllEmployee, deleteEmployee, addEmployee, updateEmp, getSeniorEmpcodesByDesignation, bulkUploadUsers, getSeniorEmployees } = require("../controller/employee.controller");
const { upload } = require("../config/multer");
const router = express.Router();

router.get("/getEmpWithId/:id", getEmployeeWithId)
router.get("/getAllEmployee", getAllEmployee)
router.delete("/deleteEmployee/:id", deleteEmployee)
router.post("/getSeniorEmpcodesByDesignation", getSeniorEmpcodesByDesignation)
router.post("/getSeniorEmployees", getSeniorEmployees)
router.post("/addEmp", addEmployee)
router.put("/updateEmp", updateEmp)
router.post("/bulkUpload",upload.single("file"),bulkUploadUsers)

module.exports= router;
