import express from "express";
import {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { authenticateUser } from "../middlewares/authentication.js";

const router = express.Router();

router
  .route("/")
  .post(authenticateUser, createReview)
  .get(authenticateUser, getAllReviews);
router
  .route("/:id")
  .get(authenticateUser, getSingleReview)
  .patch(authenticateUser, updateReview)
  .delete(authenticateUser, deleteReview);

export default router;
