const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const streamifier = require("streamifier");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const uploadFile = asyncHandler(async (req, res) => {
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    throw new AppError("Cloudinary is not configured", 500);
  }
  if (!req.file) throw new AppError("File is required", 400);

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "devflow-ai" }, (error, data) => {
      if (error) return reject(error);
      return resolve(data);
    });

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });

  res.json({ success: true, data: { url: result.secure_url, publicId: result.public_id } });
});

const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    throw new AppError("Cloudinary is not configured", 500);
  }
  if (!req.file) throw new AppError("Image file is required", 400);
  if (!req.file.mimetype?.startsWith("image/")) {
    throw new AppError("Only image files are allowed", 400);
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "devflow-ai/profile",
        resource_type: "image",
        transformation: [
          { width: 512, height: 512, crop: "limit" },
          { quality: "auto:eco", fetch_format: "auto" },
        ],
      },
      (error, data) => {
        if (error) return reject(error);
        return resolve(data);
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });

  res.json({ success: true, url: result.secure_url });
});

module.exports = { upload, uploadFile, uploadProfileImage };
