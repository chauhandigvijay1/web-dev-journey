import multer from "multer";

const storage = multer.memoryStorage();

const allowedMime = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const multerResume = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (allowedMime.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("INVALID_RESUME_TYPE"));
    }
  },
});

export function uploadResumeMemory(req, res, next) {
  multerResume.single("resume")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File too large" });
      }
      if (err.message === "INVALID_RESUME_TYPE") {
        return res.status(400).json({ success: false, message: "Only PDF or Word files are allowed" });
      }
      return res.status(400).json({ success: false, message: "Upload error" });
    }
    next();
  });
}

const allowedImageMime = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

const multerImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (allowedImageMime.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("INVALID_IMAGE_TYPE"));
    }
  },
});

export function uploadImageMemory(req, res, next) {
  multerImage.single("image")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File too large" });
      }
      if (err.message === "INVALID_IMAGE_TYPE") {
        return res
          .status(400)
          .json({ success: false, message: "Only JPG, PNG, WEBP, or AVIF images are allowed" });
      }
      return res.status(400).json({ success: false, message: "Upload error" });
    }
    next();
  });
}
