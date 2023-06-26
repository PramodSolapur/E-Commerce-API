import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Product Name is Required!"],
      trim: true,
      minlength: [5, "Product Name is between 5 to 50 chars"],
      maxlength: [50, "Product Name is between 5 to 50 chars"],
    },
    price: {
      type: Number,
      required: [true, "Product Price is Required!"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Product Description is Required!"],
      trim: true,
      minlength: [10, "Product Description is between 10 to 1000 chars"],
      maxlength: [1000, "Product Description is between 10 to 1000 chars"],
    },
    image: {
      type: String,
      default: "/uploads/example.png",
    },
    company: {
      type: String,
      required: [true, "Product Company is Required!"],
      enum: {
        values: ["ikea", "marcos", "liddy"],
        message: "{VALUE} is not supported",
      },
    },
    category: {
      type: String,
      required: [true, "Product Category is Required!"],
      enum: ["office", "kitchen", "bedroom"],
    },
    colors: {
      type: [String],
      required: true,
      default: ["#222"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// if you want to get review related to a product, use vrituals because we have not referenced review model to product model.
ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id", // in product model
  foreignField: "product", // in review model
  justOne: false,
  // match: { rating: 5 },
});

// on removing a product, first remove reviews on the product by triggering pre remove hook.

ProductSchema.pre("remove", async function () {
  await this.model("Review").deleteMany({ product: this._id });
});

export default mongoose.model("Product", ProductSchema);
