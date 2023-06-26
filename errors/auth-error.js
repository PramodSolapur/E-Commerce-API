import CustomError from "./custom-error.js";

class UnauthError extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
}

export default UnauthError;
