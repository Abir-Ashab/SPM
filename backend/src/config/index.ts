import dotenv from "dotenv";
dotenv.config();

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT || 3000,
  db_url: process.env.MONGODB_URI,
  salt_round: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET || 'fallback-access-secret-key',
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || '7d',
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key',
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
};
