import jwt from 'jsonwebtoken';

export const generateTokens = (payload) => ({
  accessToken: jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  }),
  refreshToken: jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
  })
});

export const verifyAccessToken = (token) => 
  jwt.verify(token, process.env.JWT_ACCESS_SECRET);

export const verifyRefreshToken = (token) => 
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);