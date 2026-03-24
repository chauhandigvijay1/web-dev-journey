import { uploadImageToCloudinary, uploadToCloudinary } from "../utils/cloudinaryUpload.js";

export async function uploadResume(req, res) {
  if (!req.file?.buffer) {
    return res.status(400).json({ success: false, message: "Resume file is required" });
  }
  try {
    const url = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    return res.json({ success: true, data: { url } });
  } catch (err) {
    if (err.message === "Cloudinary is not configured") {
      return res.status(500).json({ success: false, message: err.message });
    }
    return res.status(502).json({ success: false, message: "Upload failed" });
  }
}

export async function uploadProfileImage(req, res) {
  if (!req.file?.buffer) {
    return res.status(400).json({ success: false, message: "Image file is required" });
  }
  try {
    const url = await uploadImageToCloudinary(req.file.buffer, req.file.mimetype);
    return res.json({ success: true, data: { url } });
  } catch (err) {
    if (err.message === "Cloudinary is not configured") {
      return res.status(500).json({ success: false, message: err.message });
    }
    return res.status(502).json({ success: false, message: "Upload failed" });
  }
}
