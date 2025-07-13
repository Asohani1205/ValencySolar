import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';
import { loginSchema, registerSchema, updateUserSchema, type User, type LoginData, type RegisterData, type UpdateUserData } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  role: string;
}

export class AuthService {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Compare password with hash
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate JWT token
  static generateToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  // Register new user
  static async register(data: RegisterData): Promise<AuthResult> {
    try {
      // Validate input
      const validatedData = registerSchema.parse(data);

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return { success: false, message: 'Username already exists' };
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail?.(validatedData.email);
      if (existingEmail) {
        return { success: false, message: 'Email already exists' };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(validatedData.password);

      // Create user
      const user = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        pincode: validatedData.pincode || null,
      });

      // Generate token
      const token = this.generateToken(user);

      return {
        success: true,
        user,
        token,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  }

  // Login user
  static async login(data: LoginData): Promise<AuthResult> {
    try {
      // Validate input
      const validatedData = loginSchema.parse(data);

      // Find user
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Check if user is active
      if (!user.isActive) {
        return { success: false, message: 'Account is deactivated' };
      }

      // Verify password
      const isValidPassword = await this.comparePassword(validatedData.password, user.password);
      if (!isValidPassword) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });

      // Generate token
      const token = this.generateToken(user);

      return {
        success: true,
        user,
        token,
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  }

  // Get current user from token
  static async getCurrentUser(token: string): Promise<User | null> {
    try {
      const payload = this.verifyToken(token);
      if (!payload) {
        return null;
      }

      const user = await storage.getUser(payload.userId);
      if (!user || !user.isActive) {
        return null;
      }

      return user;
    } catch (error) {
      return null;
    }
  }

  // Update user profile
  static async updateProfile(userId: number, data: UpdateUserData): Promise<AuthResult> {
    try {
      const validatedData = updateUserSchema.parse(data);
      const updatedUser = await storage.updateUser(userId, validatedData);
      
      if (!updatedUser) {
        return { success: false, message: 'User not found' };
      }

      return {
        success: true,
        user: updatedUser,
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: 'Profile update failed' };
    }
  }

  // Change password
  static async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<AuthResult> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Verify current password
      const isValidPassword = await this.comparePassword(currentPassword, user.password);
      if (!isValidPassword) {
        return { success: false, message: 'Current password is incorrect' };
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password
      const updatedUser = await storage.updateUser(userId, { password: hashedPassword });
      
      return {
        success: true,
        user: updatedUser,
      };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, message: 'Password change failed' };
    }
  }
} 