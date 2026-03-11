import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validateRequest";
import { userControllers } from "../controllers/user.controller";
import { UserValidations } from "../validations/user.validation";
import { uploadMiddleware } from "../middlewares/upload.middleware";

const router = express.Router();

router.post(
  "/create-admin",
  validateRequest(UserValidations.createAdminValidations),
  authMiddleware(),
  userControllers.createAdmin
);


router.delete(
  "/account",
  authMiddleware(),
  userControllers.deleteUser
);

router.put(
  "/status",
  authMiddleware(),
  userControllers.updateUserStatus
);

router.put(
  "/profile",
  authMiddleware(),
  uploadMiddleware.single('image'), 
  userControllers.updateUser
);


router.get(
  "/profile",
  authMiddleware(),
  userControllers.getUserProfile
);

router.get(
  "/travelers",
  userControllers.getTravelers
);

router.get(
  "/all",
  authMiddleware(),
  userControllers.getAllUser
);

router.delete(
  "/:id",
  authMiddleware(),
  userControllers.deleteUser
)

export const UserRoutes = router;
