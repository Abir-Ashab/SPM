import { isPasswordMatched } from "../utils/auth.util";
import bcryptjs from "bcryptjs";
import { USER_STATUS } from "../interfaces/user.interface";
import { TUser } from "../interfaces/user.interface";
import { TLoginUser } from "../interfaces/auth.interface";
import jwt, { SignOptions } from "jsonwebtoken";
import config from "../config";
import { userModel } from "../repositories/user.repository";
import { NotFoundError } from "../errors/NotFoundError";
import { UnauthorizedError } from "../errors/UnauthorizedError";

const register = async (payload: TUser): Promise<any> => {
  const email = payload.email;
  const user = await userModel.findByEmail(email);
  if (user) {
    throw new Error("User already exists");
  }

  const newUser = await userModel.create(payload);

  return newUser;
};

const login = async (payload: TLoginUser) => {
  const email = payload.email;
  const user = await userModel.findByEmailWithPassword(email);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.status === USER_STATUS.BLOCKED) {
    throw new UnauthorizedError("User is blocked");
  }

  const passwordMatch = await isPasswordMatched(
    payload.password,
    user.password
  );

  if (!passwordMatch) {
    throw new UnauthorizedError("Password not matched");
  }

  const jwtPayload = {
    email: user.email,
    user_id: user.id
  };
  
  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret!, {
    expiresIn: '7d',
  });

  const refreshToken = jwt.sign(jwtPayload, config.jwt_refresh_secret!, {
    expiresIn: '30d',
  });

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string): Promise<{ accessToken: string }> => {
  if (!token) {
    throw new UnauthorizedError("No refresh token provided");
  }

  try {
    const decoded = jwt.verify(token, config.jwt_refresh_secret!);
    const { email } = decoded as { email: string };

    const newAccessToken = jwt.sign({ email }, config.jwt_access_secret!, {
      expiresIn: '7d',
    });

    return { accessToken: newAccessToken };
  } catch (error) {
    throw new UnauthorizedError("Invalid refresh token");
  }
};

export const AuthServices = {
  register,
  login,
  refreshToken,
};
