import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      max: 5,
      min: 1,
      required: [true, "Please provide rating"],
    },
    title: {
      type: String,
      required: [true, "Please provide review title"],
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, "Please provide review comment"],
    },
  },
  {
    timestamps: true,
  }
);

// each user can review only once on each product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// static methods called on schema not on instance
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    {
      $match: {
        product: productId,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//  runs on each document after saving into the db
ReviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

//  runs on each document after removing from the db
ReviewSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

export default mongoose.model("Review", ReviewSchema);
