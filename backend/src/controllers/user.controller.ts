import { catchAsync } from '../utils/catchAsync.util';
import { UserServices } from "../services/user.services";

const createAdmin = catchAsync(async (req, res) => {
  const result = await UserServices.createAdminIntoDB({ ...req.body});

  res.status(200).json({
    success: true,
    message: "Admin is created successfully!",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req, res) => {
  const user_id = req.user?.id;
  const result = await UserServices.updateUserStatus(user_id, req.body);

  res.status(200).json({
    success: true,
    message: "User updated successfully!",
    data: result,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const user_id = req.user?.id;
  const profile_picture = req.file
  const result = await UserServices.updateUser(user_id, req.body, profile_picture!);

  res.status(200).json({
    success: true,
    message: "User updated successfully!",
    data: result,
  });
});

const getUserProfile = catchAsync(async (req, res) => {
  const user_id  = req.user?.id;
  const result = await UserServices.getUserProfile(user_id);

  res.status(200).json({
    success: true,
    message: "User profile fetched successfully!",
    data: result,
  });
});

const getTravelers = catchAsync(async (req, res) => {
  const result = await UserServices.getTravelers();

  res.status(200).json({
    success: true,
    message: "User profile fetched successfully!",
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const user_id = req.params.id
  await UserServices.deleteUser(user_id);

  res.status(200).json({
    success: true,
    message: "User deleted successfully!",
  });
});

const getAllUser = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUser();

  res.status(200).json({
    success: true,
    message: "all users!",
    data: result,
  });
});

export const userControllers = {
  createAdmin,
  getTravelers,
  updateUser,
  getUserProfile,
  deleteUser,
  getAllUser,
  updateUserStatus
};
