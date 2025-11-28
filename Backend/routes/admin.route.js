const express = require("express");
const { createAdminIfMissing } = require("../controller/admin.controller");
const router = express.Router();

router.post("/createAdminIfMissing",createAdminIfMissing)


module.exports= router;