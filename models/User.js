import mongoose from "mongoose";
import validator from "validator"; // to validate fields
import bcrypt from "bcryptjs"; // to hash and validate password

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User name is Required!"],
    minlength: [3, "user name between 3 to 50 characters"],
    maxlength: [50, "user name between 3 to 50 characters"],
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Email is Required!"],
    validate: {
      validator: validator.isEmail,
      message: "Provide Valid email ID",
    },
  },
  password: {
    type: String,
    required: [true, "Password is Required!"],
    minlength: [6, "password between 6 to 12 characters"],
    trim: true,
    select: false,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  verificationToken: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verified: {
    type: Date,
  },
  passwordToken: { type: String },
  passwordTokenExpirationDate: { type: Date },
});

// runs on each document before saving into the db
UserSchema.pre("save", async function () {
  // console.log(this.modifiedPaths());
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//  runs on every document
UserSchema.methods.comparePassword = async function (enteredPassword) {
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  return isMatch;
};

export default mongoose.model("User", UserSchema);
