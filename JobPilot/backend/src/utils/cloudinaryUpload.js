import { configureCloudinary } from "../config/cloudinary.js";

function normalizeFileName(fileName, fallback) {
  const raw = String(fileName || "").trim();
  // Strip any document extension. Cloudinary's "Strict PDFs" account setting blocks public
  // delivery (HTTP 401) of raw assets whose public_id ends in ".pdf", so we store resumes
  // under an extensionless public_id while keeping the human-readable name.
  const base = raw.replace(/\.(pdf|docx?|txt)$/i, "");
  const sanitized = base.replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
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
  // Use resource_type "raw" so documents (PDF/DOC/DOCX) are stored and delivered verbatim.
  // The public_id is kept extensionless (see normalizeFileName) so Cloudinary's Strict-PDF
  // delivery guard never trips and the file is publicly downloadable at its secure URL.
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
