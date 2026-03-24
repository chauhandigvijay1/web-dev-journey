import { configureCloudinary } from "../config/cloudinary.js";

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

export async function uploadToCloudinary(buffer, mimetype = "application/octet-stream") {
  return uploadBufferToCloudinary(buffer, mimetype, {
    folder: "jobpilot/resumes",
    resource_type: "raw",
    use_filename: true,
    unique_filename: true,
  });
}

export async function uploadImageToCloudinary(buffer, mimetype = "image/png") {
  return uploadBufferToCloudinary(buffer, mimetype, {
    folder: "jobpilot/profile-pics",
    resource_type: "image",
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  });
}
