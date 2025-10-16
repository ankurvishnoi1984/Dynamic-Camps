const path = require("path");
const multer = require("multer");

// ================= Multer Base Config =================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniquePrefix + "-" + file.originalname);
  },
});

// accept multiple files with field name "file"
const upload = multer({ storage });

module.exports = { upload };
