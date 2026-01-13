const express = require("express");
const {  updatePosterDoctor, AddPoster, getPosterByDoctorId, downloadPoster, getCategoryByDept, getSubCategoryByDept, AddPosterV2, addDoctor, getAllDoctorsByEmp } = require("../controller/poster.controller");
const { profileUpload } = require("../config/multer");
const router = express.Router();

router.post("/getAllPosterDoctorsByEmp", getAllDoctorsByEmp)
router.post("/getPosterByDoctorId", getPosterByDoctorId)
router.get(
  "/download-poster/:filename",
  downloadPoster
);

router.post("/getCategory", getCategoryByDept)
router.post("/getSubCategory", getSubCategoryByDept)
router.post("/updatePosterDoctor", profileUpload.single("image"), updatePosterDoctor)
router.post("/addPosterDoctor", profileUpload.single("image"), addDoctor)
router.post("/addPoster",AddPoster)
router.post("/addPosterV2",AddPosterV2)


module.exports = router;