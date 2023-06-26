import jwt from "jsonwebtoken";

const createJwt = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET);

  return token;
};

const isTokenValid = (token) => {
  const isVerified = jwt.verify(token, process.env.JWT_SECRET);
  return isVerified;
};

const attachCookiesToResponse = ({ res, user, refreshToken }) => {
  // create jwt by passing payload
  const accessTokenJWT = createJwt({ payload: { user } });
  const refreshTokenJWT = createJwt({ payload: { user, refreshToken } });

  const oneDay = 1000 * 60 * 60 * 24;

  // attach cookie to response
  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    maxAge: 1000 * 60 * 15,
  });

  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });

  //  send the response
  res.status(201).json({
    status: "success",
    data: {
      user,
    },
  });
};

export { createJwt, isTokenValid, attachCookiesToResponse };
