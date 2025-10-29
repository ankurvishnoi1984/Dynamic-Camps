const express = require("express");
const { getEmployeeWithId, getAllEmployee, deleteEmployee, addEmployee, updateEmp, getSeniorEmpcodesByDesignation } = require("../controller/employee.controller");
const router = express.Router();

router.get("/getEmpWithId/:id", getEmployeeWithId)
router.get("/getAllEmployee", getAllEmployee)
router.delete("/deleteEmployee/:id", deleteEmployee)
router.post("/getSeniorEmpcodesByDesignation", getSeniorEmpcodesByDesignation)
router.post("/addEmp", addEmployee)
router.put("/updateEmp", updateEmp)

module.exports= router;
