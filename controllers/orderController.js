import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import checkPermissions from "../utils/checkPermissions.js";

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "someRandomValue";
  return { client_secret, amount };
};

// @desc            Create Order
// @route           POST  /api/v1/orders
// @access          Private
const createOrder = async (req, res) => {
  // get data from req.body
  const { items: cartItems, tax, shippingFee } = req.body;

  //  check for cart items
  if (!cartItems || cartItems.length === 0) {
    throw new BadRequestError("No Cart Items Provided");
  }

  // check for tax and shippping fee
  if (!tax || !shippingFee) {
    throw new BadRequestError("Please provide tax and shipping fee");
  }

  //   define variables
  let orderItems = [];
  let subtotal = 0;

  // iterate through cartItems
  for (const item of cartItems) {
    // check for the product

    const dbProduct = await Product.findOne({ _id: item.product });
    // if not , send 404
    if (!dbProduct) {
      throw new NotFoundError("Product not found");
    }

    const { name, price, image, _id } = dbProduct;

    // create single order item
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };

    // add item to orderItems arr
    orderItems = [...orderItems, singleOrderItem];

    // calculate subtotal
    subtotal += price * item.amount;
  }

  //   calculate total
  const total = tax + shippingFee + subtotal;

  //   get clinet secret
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });

  //   create oder and pass all the data
  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  //   send the response
  res.status(201).json({
    status: "success",
    data: {
      order,
      clientSecret: order.clientSecret,
    },
  });
};

// @desc            Get All Orders
// @route           GET  /api/v1/orders
// @access          Private(admin)
const getAllOrders = async (req, res) => {
  // find all orders
  const orders = await Order.find({});

  // send response
  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
};

// @desc            Get Single Order
// @route           GET  /api/v1/orders/:id
// @access          Private
const getSingleOrder = async (req, res) => {
  // get order id from params
  const { id: orderId } = req.params;

  //   find order by id
  const order = await Order.findOne({ _id: orderId });

  //   check order exists
  if (!order) {
    throw new NotFoundError("order not found");
  }

  checkPermissions(req.user, order.user);

  // send response
  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
};

// @desc            Current User Orders
// @route           GET  /api/v1/orders/showAllMyOrders
// @access          Private
const getCurrentUserOrders = async (req, res) => {
  // get current user
  const { userId } = req.user;

  // get all orders
  const orders = await Order.findOne({ user: userId });

  // send response
  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
};

// @desc            Update Order
// @route           PATCH  /api/v1/orders/:id
// @access          Private
const updateOrder = async (req, res) => {
  // get order id from params
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;

  //   find order by id
  const order = await Order.findOne({ _id: orderId });

  //   check order exists
  if (!order) {
    throw new NotFoundError("order not found");
  }

  checkPermissions(req.user, order.user);

  order.paymentId = paymentIntentId;
  order.status = "paid";
  await order.save();

  // send response
  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
};

export {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
