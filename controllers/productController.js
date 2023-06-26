import path, { dirname } from "path";
import { fileURLToPath } from "url";
import Product from "../models/Product.js";
import { NotFoundError, BadRequestError } from "../errors/index.js";
import { isValidObjectId } from "mongoose";

// @desc            Create Product
// @route           POST  /api/v1/products
// @access          Private (admin)
const createProduct = async (req, res) => {
  // 1) attach user to product
  req.body.user = req.user.userId;

  // 2) create a product
  const product = await Product.create(req.body);

  // 3) send the response
  res.status(201).json({
    status: "success",
    data: {
      product,
    },
  });
};

// @desc            Get All Products
// @route           GET  /api/v1/products
// @access          Public
const getAllProducts = async (req, res) => {
  // 1) get all the product
  const products = await Product.find({});

  // 2) send the response
  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
};

// @desc            Get Single Product
// @route           GET  /api/v1/products/:id
// @access          Public
const getSingleProduct = async (req, res) => {
  //   1) get product id
  const id = req.params.id;

  //   2) check it is valid mongoose object id or not
  if (!isValidObjectId(id)) {
    throw new BadRequestError("Invalid Product ID");
  }

  //   3) get the product by ID --> refer product model
  const product = await Product.findById(id).populate("reviews");

  //   4) if not, send 404
  if (!product) {
    throw new NotFoundError("Product not Found!");
  }

  // 5) send response with product
  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
};

// @desc            Update Product
// @route           PATCH  /api/v1/products/:id
// @access          Private (admin)
const updateProduct = async (req, res) => {
  //   1) get product id
  const id = req.params.id;

  //   2) check it is valid mongoose object id or not
  if (!isValidObjectId(id)) {
    throw new BadRequestError("Invalid Product ID");
  }

  //   3) update product
  const product = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  // 5) send response with product
  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
};

// @desc            Delete Product
// @route           DELETE  /api/v1/products/:id
// @access          Private (admin)
const deleteProduct = async (req, res) => {
  //   1) get product id
  const id = req.params.id;

  //   2) check it is valid mongoose object id or not
  if (!isValidObjectId(id)) {
    throw new BadRequestError("Invalid Product ID");
  }

  //   3) get the product
  const product = await Product.findOne({ _id: id });

  if (!product) {
    throw new NotFoundError("Product not found!");
  }
  // 4) remove product
  await product.remove();

  // 5) send response
  res.status(204).send("Product removed");
};

// @desc            Upload Product Image
// @route           POST  /api/v1/products/upload-image
// @access          Private (admin)
const __dirname = fileURLToPath(dirname(import.meta.url));

const uploadImage = async (req, res) => {
  // 1) check image is uploaded or not
  if (!req.files) {
    throw new BadRequestError("No file uploaded!");
  }

  //   2) get uploaded image object by a key
  const productImage = req.files.image; // image is a key while uploading image on postman

  //   3) check for the mimetype
  if (!productImage.mimetype.startsWith("image")) {
    throw new BadRequestError("Please upload image");
  }

  //   4) set max image size
  const maxSize = 1024 * 1024 * 2;

  //   5) check image is smaller than defined size
  if (productImage.size > maxSize) {
    throw new BadRequestError("Please upload image smaller than 2MB");
  }

  //   6) define a path where u wan to upload images
  const imagePath = path.join(
    __dirname,
    "../public/uploads/",
    `${productImage.name}`
  );

  //   7) move it to that path
  await productImage.mv(imagePath);

  //   8) send the response
  res.status(200).json({
    image: `/uploads/${productImage.name}`,
  });
};

export {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
