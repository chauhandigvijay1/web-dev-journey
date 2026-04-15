const express = require("express");
const { upload, uploadFile, uploadProfileImage } = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, upload.single("file"), uploadFile);
router.post("/profile", protect, upload.single("file"), uploadProfileImage);

module.exports = router;
