import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createJob,
  getJobs,
  getSingleJob,
  updateJob,
  deleteJob,
  deleteAllJobs,
  extractJobFromUrl,
} from "../controllers/job.controller.js";

export const jobRouter = Router();

jobRouter.use(protect);

jobRouter.post("/extract", asyncHandler(extractJobFromUrl));

jobRouter
  .route("/")
  .post(asyncHandler(createJob))
  .get(asyncHandler(getJobs))
  .delete(asyncHandler(deleteAllJobs));

jobRouter
  .route("/:id")
  .get(asyncHandler(getSingleJob))
  .put(asyncHandler(updateJob))
  .delete(asyncHandler(deleteJob));
