import { uploadImageToCloudinary, uploadToCloudinary } from "../utils/cloudinaryUpload.js";

export async function uploadResume(req, res) {
  if (!req.file?.buffer) {
    return res.status(400).json({ success: false, message: "Resume file is required" });
  }
  try {
    const url = await uploadToCloudinary(req.file.buffer, req.file.mimetype, req.file.originalname);
    return res.json({ success: true, data: { url } });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ success: false, message: "File upload is not available" });
    }
    return res.status(502).json({ success: false, message: "Upload failed" });
  }
}

export async function uploadProfileImage(req, res) {
  if (!req.file?.buffer) {
    return res.status(400).json({ success: false, message: "Image file is required" });
  }
  try {
    const url = await uploadImageToCloudinary(req.file.buffer, req.file.mimetype, req.file.originalname);
    return res.json({ success: true, data: { url } });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ success: false, message: "File upload is not available" });
    }
    return res.status(502).json({ success: false, message: "Upload failed" });
  }
}
