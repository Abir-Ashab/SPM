import bcryptjs from "bcryptjs";
import config from "../config";
import { USER_STATUS, TUser } from "../interfaces/user.interface";
import User from "../models/user.model";

class UserRepository {
  
  async create(userData: TUser) {
    const hashedPassword = await bcryptjs.hash(userData.password, Number(config.salt_round));
    
    const userToCreate = {
      ...userData,
      password: hashedPassword,
      status: userData.status || USER_STATUS.ACTIVE
    };

    const newUser = new User(userToCreate);
    const savedUser = await newUser.save();
    
    // Return user without password
    const userObject = savedUser.toObject();
    const { password, ...userWithoutPassword } = userObject;
    return userWithoutPassword;
  }

  async findById(id: string) {
    return await User.findById(id).select('-password');
  }

  async findByEmail(email: string, includePassword = false) {
    const query = User.findOne({ email });
    
    if (!includePassword) {
      query.select('-password');
    }
    
    return await query;
  }

  async findByEmailWithPassword(email: string) {
    return await User.findOne({ email }).select('+password');
  }

  async updateById(id: string, updateData: Record<string, any>) {
    if (updateData.password) {
      updateData.password = await bcryptjs.hash(updateData.password, Number(config.salt_round));
      updateData.passwordChangedAt = new Date();
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, select: '-password' }
    );

    return updatedUser;
  }

  async updatePassword(id: string, newPassword: string) {
    const hashedPassword = await bcryptjs.hash(newPassword, Number(config.salt_round));
    
    return await this.updateById(id, {
      password: hashedPassword,
      passwordChangedAt: new Date()
    });
  }

  async findTravelers() {
    return await User.find()
      .select('name email status createdAt updatedAt');
  }

  async findUsers() {
    return await User.find().select('-password');
  }

  async deleteById(id: string) {
    const result = await User.findByIdAndDelete(id);
    return result ? 1 : 0; // Return 1 if deleted, 0 if not found
  }

  async wasPasswordChangedAfter(userId: string, timestamp: string | Date) {
    const user = await User.findById(userId).select('passwordChangedAt');

    if (!user || !user.passwordChangedAt) {
      return false;
    }

    return new Date(user.passwordChangedAt) > new Date(timestamp);
  }
}

export const userModel = new UserRepository();