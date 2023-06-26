import Review from "../models/Review.js";
import Product from "../models/Product.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import checkPermissions from "../utils/checkPermissions.js";
import { isValidObjectId } from "mongoose";

// @desc            Create Review
// @route           POST  /api/v1/reviews
// @access          Private
const createReview = async (req, res) => {
  // 1) get all data form req.body
  const { product: productId } = req.body;

  // 2) check product exists or not
  const isValidProduct = await Product.findById(productId);

  // 3) if not throw 400
  if (!isValidProduct) {
    throw new NotFoundError("Invalid Product ID");
  }

  // 4) attach user
  req.body.user = req.user.userId;

  // 5) check pproduct already reviewed
  const alreadyReviewed = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });

  // 6) if yes, throw 400
  if (alreadyReviewed) {
    throw new BadRequestError("Already reviewed this product");
  }

  // 7) create review
  const review = await Review.create(req.body);

  // 8) send response
  res.status(201).json({
    status: "success",
    data: {
      review,
    },
  });
};

// @desc            Get All Reviews
// @route           GET  /api/v1/reviews
// @access          Private

const getAllReviews = async (req, res) => {
  // 1) find all the  reviews
  const reviews = await Review.find({})
    .populate("product", "name company price")
    .populate("user", "email");

  // 2) send the response
  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
};

// @desc            Get Single Review
// @route           GET  /api/v1/reviews/:id
// @access          Private
const getSingleReview = async (req, res) => {
  // 1) get id from req.params
  const { id: reviewId } = req.params;

  if (!isValidObjectId(reviewId)) {
    throw new BadRequestError("Invalid Product ID");
  }

  // 2) check review exists or not
  const review = await Review.findOne({ _id: reviewId }).populate(
    "product",
    "name company price"
  );

  // 3) if not, send 404
  if (!review) {
    throw new NotFoundError("Review not Found");
  }

  // 4) send response
  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
};

// @desc            Update Review
// @route           PATCH  /api/v1/reviews/:id
// @access          Private
const updateReview = async (req, res) => {
  // 1) get id from req.params
  const { id: reviewId } = req.params;

  // 2) get req.body data
  const { rating, title, comment } = req.body;

  if (!isValidObjectId(reviewId)) {
    throw new BadRequestError("Invalid Product ID");
  }

  // 3) check review exists or not
  const review = await Review.findOne({ _id: reviewId });

  // 4) if not, send 404
  if (!review) {
    throw new NotFoundError("Review not Found");
  }

  checkPermissions(req.user, review.user);

  // 5) update review
  review.rating = rating;
  review.title = title;
  review.comment = comment;

  // 6) save to db
  await review.save();

  // 7) send the response
  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
};

// @desc            Delete Review
// @route           DELETE  /api/v1/reviews/:id
// @access          Private
const deleteReview = async (req, res) => {
  // 1) get id from req.params
  const { id: reviewId } = req.params;

  if (!isValidObjectId(reviewId)) {
    throw new BadRequestError("Invalid Product ID");
  }

  // 2) check review exists or not
  const review = await Review.findOne({ _id: reviewId });

  // 3) if not, send 404
  if (!review) {
    throw new NotFoundError("Review not Found");
  }

  // 4) check permissions
  checkPermissions(req.user, review.user);

  // 5) remove review
  await review.remove();

  // 6) send response
  res.status(204).send("Review Deleted");
};

export {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
};
