import multer from "multer";

const storage = multer.memoryStorage();

const allowedMime = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function checkMagicBytes(buffer, mime) {
  if (!buffer || buffer.length < 8) return false;
  const header = buffer.slice(0, 8).toString("hex").toLowerCase();
  if (mime === "application/pdf") return header.startsWith("25504446");
  if (mime === "application/msword") return header.startsWith("d0cf11e0") || header.startsWith("504b34");
  if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return header.startsWith("504b34");
  if (mime?.startsWith("image/")) {
    return (
      header.startsWith("ffd8ffe0") || header.startsWith("ffd8ffe1") ||
      header.startsWith("ffd8ffe2") || header.startsWith("89504e47") ||
      header.startsWith("52494646") || header.startsWith("0000001c66747970")
    );
  }
  return false;
}

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

const originalResumeUpload = multerResume.single("resume");
multerResume.single = (field) => (req, res, next) => {
  originalResumeUpload(req, res, (err) => {
    if (err) return next(err);
    if (req.file && !checkMagicBytes(req.file.buffer, req.file.mimetype)) {
      req.file = undefined;
      return res.status(400).json({ success: false, message: "File content does not match the expected format" });
    }
    next();
  });
};

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

const originalImageUpload = multerImage.single("image");
multerImage.single = (field) => (req, res, next) => {
  originalImageUpload(req, res, (err) => {
    if (err) return next(err);
    if (req.file && !checkMagicBytes(req.file.buffer, req.file.mimetype)) {
      req.file = undefined;
      return res.status(400).json({ success: false, message: "File content does not match the expected format" });
    }
    next();
  });
};

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
