const express = require("express");
const { getDoctorList, getAllDoctors, updateDoctor, deleteDoctor, doctorCSVUpsert } = require("../controller/doctor.controller");
const { memUpload } = require("../config/multer");
const router = express.Router();

router.post("/getDoctorList",getDoctorList)
router.get("/getAllDoctors",getAllDoctors)
router.put("/updateDoctor",updateDoctor)
router.delete("/deleteDoctor/:id",deleteDoctor)
router.post("/doctorCSVUpsert",memUpload.single("file"),doctorCSVUpsert)



module.exports= router;