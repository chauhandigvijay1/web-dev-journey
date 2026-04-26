import { configureCloudinary } from "../config/cloudinary.js";

function normalizeFileName(fileName, fallback) {
  const raw = String(fileName || "").trim();
  const sanitized = raw.replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return sanitized || fallback;
}

async function uploadBufferToCloudinary(buffer, mimetype, options) {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary is not configured");
  }
  const cloudinary = configureCloudinary();
  const dataUri = `data:${mimetype};base64,${buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, options);
  return result.secure_url;
}

export async function uploadToCloudinary(buffer, mimetype = "application/octet-stream", fileName = "") {
  return uploadBufferToCloudinary(buffer, mimetype, {
    folder: "jobpilot/resumes",
    resource_type: "raw",
    use_filename: true,
    unique_filename: true,
    filename_override: normalizeFileName(fileName, "resume"),
  });
}

export async function uploadImageToCloudinary(buffer, mimetype = "image/png", fileName = "") {
  return uploadBufferToCloudinary(buffer, mimetype, {
    folder: "jobpilot/profile-pics",
    resource_type: "image",
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    filename_override: normalizeFileName(fileName, "profile-image"),
  });
}
