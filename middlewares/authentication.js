import { UnauthError, ForbiddenError } from "../errors/index.js";
import Token from "../models/Token.js";
import { isTokenValid } from "../utils/jwt.js";
import { attachCookiesToResponse } from "../utils/jwt.js";

const authenticateUser = async (req, res, next) => {
  const { refreshToken, accessToken } = req.signedCookies;

  try {
    if (accessToken) {
      const payload = isTokenValid(accessToken);
      req.user = payload.user;
      return next();
    }
    const payload = isTokenValid(refreshToken);

    const existingToken = await Token.findOne({
      refreshToken: payload.refreshToken,
      user: payload.user.userId,
    });

    if (!existingToken || !existingToken?.isValid) {
      throw new UnauthError("Authentication Failed!");
    }

    attachCookiesToResponse({
      res,
      user: payload.user,
      refreshToken: existingToken.refreshToken,
    });
    req.user = payload.user;
    next();
  } catch (error) {
    throw new UnauthError("Authentication Failed!");
  }
};

const authorizePermissions = (...roles) => {
  //  return callback function if u want to pass arguments to middleware in routes
  return (req, res, next) => {
    if (req.user?.role && roles.includes(req.user.role)) {
      next();
    } else {
      throw new ForbiddenError("Unauthorized to access this route");
    }
  };
};

export { authenticateUser, authorizePermissions };
