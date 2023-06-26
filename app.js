// 3-rd party packages
import dotenv from "dotenv";
dotenv.config(); // Invoke dotnev.config() to get access to .env variables
import express from "express";
import "express-async-errors";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import fileUpload from "express-fileupload";
import rateLimiter from "express-rate-limit";
import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";

// connect to mongoDB
import connectDB from "./db/connect.js";
import notFound from "./middlewares/not-found.js";
import errorHandlerMiddleware from "./middlewares/error-handler.js";

// import routes
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import productRouter from "./routes/productRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import orderRouter from "./routes/orderRoutes.js";

// create an app by invoking express
const app = express();

// default middlewares
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(express.json()); // to parse json body into javascript object
app.use(cors()); // to share resources between different domain apps
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(cookieParser(process.env.COOKIE_SECRET)); // to access cookie coming back from the browser, if cookies are signed pass cookie secret and also access cookies by req.signedCookies
app.use(express.static("./public"));
app.use(fileUpload());

// route middlewares
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

// custom middlewares
app.use(notFound); // runs only route does not exist
app.use(errorHandlerMiddleware); // it runs for exsiting routes

// access port variable from .env file , else setup 5000 as default port.
const port = process.env.PORT || 5000;

const DB = process.env.MONGO_URI.replace(
  "password",
  process.env.MONGO_PASSWORD
);

const start = async () => {
  try {
    await connectDB(DB);
    app.listen(port, () => console.log(`Server is listening on port ${port}`));
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
