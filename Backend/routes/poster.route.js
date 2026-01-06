const express = require("express");
const { getAllPosterDoctorsByEmp, getCategory, updatePosterDoctor, addPosterDoctor, AddPoster } = require("../controller/poster.controller");
const { profileUpload } = require("../config/multer");
const router = express.Router();

router.post("/getAllPosterDoctorsByEmp", getAllPosterDoctorsByEmp)
router.post("/getCategory", getCategory)
router.patch("/updatePosterDoctor/:id", profileUpload.single("image"), updatePosterDoctor)
router.post("/addPosterDoctor", profileUpload.single("image"), addPosterDoctor)
router.post("/addPoster",AddPoster)


module.exports = router;