import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserModelEntity } from '../user/user.model.js';
import { AdminModelEntity } from '../admin/admin.model.js';
import { ActivityTracker } from '../activity/activity.model.js';
import { TokenModel } from './token.model.js';

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AuthModel {
  constructor(tokenModel = new TokenModel()) {
    this.tokenModel = tokenModel;
    this.jwtSecret = process.env.JWT_SECRET || 'settlex_super_secure_jwt_secret_key_2026';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  generateNumericOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async seedDefaultUsers() {
    let defaultUsers = [];
    try {
      const filePath = path.resolve(__dirname, '../../data/mock/users.json');
      const rawData = await fs.readFile(filePath, 'utf-8');
      defaultUsers = JSON.parse(rawData);
    } catch {
      defaultUsers = [];
    }

    for (const user of defaultUsers) {
      const exists = await this.findByEmail(user.email);
      if (!exists) {
        try {
          const salt = bcrypt.genSaltSync(10);
          const hashedPassword = bcrypt.hashSync(user.password, salt);
          await UserModelEntity.create({
            ...user,
            password: hashedPassword,
          });
        } catch (error) {
          if (error.code !== 11000) {
            throw error;
          }
        }
      } else {
        exists.isVerified = true;
        exists.role = user.role;
        exists.privileges = user.privileges;
        exists.tier = user.tier;
        exists.isSuspended = false;
        await exists.save();
      }
    }
  }

  async findByEmail(email) {
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    const user = await UserModelEntity.findOne({ email: normalizedEmail });
    if (user) return user;
    return AdminModelEntity.findOne({ email: normalizedEmail });
  }

  async findById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const user = await UserModelEntity.findById(id);
    if (user) return user;

    const admin = await AdminModelEntity.findById(id);
    if (admin) {
      return {
        _id: admin._id,
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role || 'admin',
        isAdmin: true,
        permissions: admin.permissions || [],
        privileges: ['*'],
        tier: 'enterprise',
        isVerified: true,
        isSuspended: !admin.isActive,
        toObject() {
          return {
            _id: admin._id,
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            role: admin.role || 'admin',
            isAdmin: true,
            permissions: admin.permissions || [],
            privileges: ['*'],
            tier: 'enterprise',
            isVerified: true,
            isSuspended: !admin.isActive,
          };
        },
      };
    }
    return null;
  }

  async registerLocal({ name, email, password, role = 'user' }) {
    const existing = await this.findByEmail(email);
    if (existing) {
      if (existing.isVerified) {
        throw new Error('Email already registered');
      }

      if (existing.isSuspended) {
        const error = new Error('Account is suspended. Contact administration.');
        error.isSuspended = true;
        throw error;
      }

      if (name) {
        existing.name = name.trim();
      }
      if (password) {
        const salt = bcrypt.genSaltSync(10);
        existing.password = bcrypt.hashSync(password, salt);
      }
      await existing.save();

      const otp = this.generateNumericOtp();
      await this.tokenModel.createOtp({
        userId: existing._id,
        type: 'VERIFICATION_OTP',
        code: otp,
        expiresInMinutes: 10,
      });

      return {
        user: this.sanitizeUser(existing),
        otp,
        resumed: true,
      };
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const otp = this.generateNumericOtp();

    const user = await UserModelEntity.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'user',
      privileges: ['group:create', 'expense:create', 'settlement:create'],
      tier: 'free',
      isSuspended: false,
      isVerified: false,
      authProvider: 'local',
    });

    ActivityTracker.track({
      action: 'USER_REGISTERED',
      title: 'User registered',
      subtitle: user.email,
      type: 'user',
      performedBy: user._id,
      performedByName: user.name,
      targetId: user._id.toString(),
    });

    await this.tokenModel.createOtp({
      userId: user._id,
      type: 'VERIFICATION_OTP',
      code: otp,
      expiresInMinutes: 10,
    });

    return {
      user: this.sanitizeUser(user),
      otp,
      resumed: false,
    };
  }

  async verifyRegistrationOtp(email, otp) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isSuspended) {
      const error = new Error('Account is suspended. Contact administration.');
      error.isSuspended = true;
      throw error;
    }

    if (user.isVerified) {
      const token = this.generateToken(user);
      return {
        user: this.sanitizeUser(user),
        token,
      };
    }

    try {
      await this.tokenModel.verifyAndConsumeOtp({
        userId: user._id,
        type: 'VERIFICATION_OTP',
        code: otp,
      });
    } catch {
      throw new Error('Invalid verification code');
    }

    user.isVerified = true;
    await user.save();

    const token = this.generateToken(user);
    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async resendRegistrationOtp(email) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isSuspended) {
      throw new Error('Account is suspended. Contact administration.');
    }

    if (user.isVerified) {
      throw new Error('Account is already verified');
    }

    const otp = this.generateNumericOtp();

    await this.tokenModel.createOtp({
      userId: user._id,
      type: 'VERIFICATION_OTP',
      code: otp,
      expiresInMinutes: 10,
    });

    return {
      user: this.sanitizeUser(user),
      otp,
    };
  }

  async authenticateGoogle({ googleId, email, name, avatar = '' }) {
    if (!email || !name) {
      throw new Error('Google authentication requires email and name');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const query = [];
    if (googleId) {
      query.push({ googleId });
    }
    if (normalizedEmail) {
      query.push({ email: normalizedEmail });
    }

    let user = query.length > 0 ? await UserModelEntity.findOne({ $or: query }) : null;

    if (user) {
      if (user.isSuspended) {
        const error = new Error('Account is suspended. Contact administration.');
        error.isSuspended = true;
        throw error;
      }

      if (googleId && !user.googleId) {
        user.googleId = googleId;
      }
      if (avatar && !user.avatar) {
        user.avatar = avatar;
      }
      if (name && (!user.name || user.name === 'User')) {
        user.name = name.trim();
      }
      user.isVerified = true;
      await user.save();
    } else {
      const randomPassword = crypto.randomBytes(24).toString('hex');
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(randomPassword, salt);

      user = await UserModelEntity.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        googleId,
        avatar,
        authProvider: 'google',
        isVerified: true,
        isSuspended: false,
        role: 'user',
        privileges: ['group:create', 'expense:create', 'settlement:create'],
        tier: 'free',
      });
    }

    const token = this.generateToken(user);
    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async authenticate(email, password) {
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    const user = await UserModelEntity.findOne({ email: normalizedEmail });
    if (user) {
      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return null;
      }

      if (user.isSuspended) {
        const error = new Error('Account is suspended. Contact administration.');
        error.isSuspended = true;
        throw error;
      }

      if (!user.isVerified) {
        const error = new Error('Account is not verified. Please verify your email with OTP.');
        error.isUnverified = true;
        error.email = user.email;
        error.user = user;
        throw error;
      }

      const token = this.generateToken(user);
      return {
        user: this.sanitizeUser(user),
        token,
      };
    }

    const admin = await AdminModelEntity.findOne({ email: normalizedEmail });
    if (admin) {
      const isMatch = bcrypt.compareSync(password, admin.password);
      if (!isMatch) {
        return null;
      }

      if (!admin.isActive) {
        const error = new Error('Admin account is deactivated. Contact system administrator.');
        error.isDeactivated = true;
        throw error;
      }

      const adminUser = {
        _id: admin._id.toString(),
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role || 'admin',
        isAdmin: true,
        permissions: admin.permissions || ['*'],
        privileges: ['*'],
        tier: 'enterprise',
        isVerified: true,
        isSuspended: false,
      };

      const token = jwt.sign(
        {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          permissions: adminUser.permissions,
          privileges: adminUser.privileges,
          isAdmin: true,
          isVerified: true,
          isSuspended: false,
          tier: 'enterprise',
        },
        this.jwtSecret,
        { expiresIn: this.jwtExpiresIn }
      );

      return {
        user: adminUser,
        admin: adminUser,
        token,
      };
    }

    return null;
  }

  async requestPasswordReset(email) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('No account found with this email');
    }

    if (user.isSuspended) {
      throw new Error('Account is suspended. Contact administration.');
    }

    const otp = this.generateNumericOtp();

    await this.tokenModel.createOtp({
      userId: user._id,
      type: 'PASSWORD_RESET_OTP',
      code: otp,
      expiresInMinutes: 10,
    });

    return {
      user: this.sanitizeUser(user),
      otp,
    };
  }

  async verifyResetOtp(email, otp) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isSuspended) {
      throw new Error('Account is suspended. Contact administration.');
    }

    try {
      await this.tokenModel.verifyOtp({
        userId: user._id,
        type: 'PASSWORD_RESET_OTP',
        code: otp,
      });
      return true;
    } catch {
      throw new Error('Invalid reset code');
    }
  }

  async resetPassword({ email, otp, newPassword }) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isSuspended) {
      throw new Error('Account is suspended. Contact administration.');
    }

    try {
      await this.tokenModel.verifyAndConsumeOtp({
        userId: user._id,
        type: 'PASSWORD_RESET_OTP',
        code: otp,
      });
    } catch {
      throw new Error('Invalid reset code');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(newPassword, salt);
    user.isVerified = true;
    await user.save();

    const token = this.generateToken(user);
    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user._id ? user._id.toString() : user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        privileges: user.privileges || [],
        tier: user.tier || 'free',
        isSuspended: Boolean(user.isSuspended),
        isVerified: Boolean(user.isVerified),
      },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );
  }

  sanitizeUser(userDoc) {
    if (!userDoc) return null;
    const plain = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
    const { password, __v, ...safeUser } = plain;
    safeUser.id = safeUser._id ? safeUser._id.toString() : safeUser.id;
    return safeUser;
  }

  async getAllUsers() {
    const users = await UserModelEntity.find().select('-password -__v');
    return users.map((u) => {
      const obj = u.toObject();
      obj.id = obj._id.toString();
      return obj;
    });
  }

  async clear() {
    await UserModelEntity.deleteMany({});
  }
}
