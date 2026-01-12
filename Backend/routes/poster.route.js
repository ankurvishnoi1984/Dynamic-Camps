const express = require("express");
const { getAllPosterDoctorsByEmp, getCategory, updatePosterDoctor, addPosterDoctor, AddPoster, getPosterByDoctorId, downloadPoster, getCategoryByDept, getSubCategoryByDept } = require("../controller/poster.controller");
const { profileUpload } = require("../config/multer");
const router = express.Router();

router.post("/getAllPosterDoctorsByEmp", getAllPosterDoctorsByEmp)
router.post("/getPosterByDoctorId", getPosterByDoctorId)
router.get(
  "/download-poster/:filename",
  downloadPoster
);

router.post("/getCategory", getCategoryByDept)
router.post("/getSubCategory", getSubCategoryByDept)
router.post("/updatePosterDoctor", profileUpload.single("image"), updatePosterDoctor)
router.post("/addPosterDoctor", profileUpload.single("image"), addPosterDoctor)
router.post("/addPoster",AddPoster)


module.exports = router;