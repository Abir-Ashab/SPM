import { z } from "zod";
import { USER_STATUS } from "../interfaces/user.interface";

const createAdminValidations = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
    status: z.nativeEnum(USER_STATUS).default(USER_STATUS.ACTIVE),
  }),
});

const updateUserValidation = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").optional(),
    status: z.nativeEnum(USER_STATUS).optional(),
  }),
});

const updateUserProfileValidation = z.object({
  body: z.object({
    name: z.string().optional(),
    profile_picture: z.string().optional(),
  }),
});

const changePasswordValidation = z.object({
  body: z.object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(6, "New password must be at least 6 characters"),
  }),
});

export const UserValidations = {
  createAdminValidations,
  updateUserValidation,
  updateUserProfileValidation,
  changePasswordValidation,
};
