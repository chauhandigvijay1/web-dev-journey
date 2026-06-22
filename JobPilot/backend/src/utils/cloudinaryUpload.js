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
  
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
    
    // Convert buffer to stream and pipe to Cloudinary
    stream.end(buffer);
  });
}

export async function uploadToCloudinary(buffer, mimetype = "application/octet-stream", fileName = "") {
  const url = await uploadBufferToCloudinary(buffer, mimetype, {
    folder: "jobpilot/resumes",
    resource_type: "auto", // "raw" often returns 401 on public access by default, "auto" resolves it
    use_filename: true,
    unique_filename: true,
    filename_override: normalizeFileName(fileName, "resume"),
  });
  
  // Cloudinary restricts direct public PDF delivery without signed URLs.
  // Converting the extension to .jpg forces Cloudinary to rasterize the first page and deliver it publicly (200 OK).
  return url.replace(/\.pdf$/i, '.jpg');
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
