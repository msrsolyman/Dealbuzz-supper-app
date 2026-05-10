import type {  Request, Response  } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.ts';
import Tenant from '../models/Tenant.ts';
import type { AuthRequest } from '../middlewares/authMiddleware.ts';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export const register = async (req: Request, res: Response) => {
  try {
    const { tenantName, userName, email, password } = req.body;

    const existingUser = await (User as any).findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });

    // Create Tenant
    const tenant = await Tenant.create({ name: tenantName });

    // Create Admin User
    const user = await User.create({
      tenantId: tenant._id,
      name: userName,
      email,
      password, // User model pre-save hook handles hashing
      role: 'super_admin' // First user is the super_admin of the platform
    });

    res.status(201).json({ message: 'Tenant and Admin created successfully' });
  } catch (error: any) {
    if (error.name === 'MongooseError' || error.message.includes('buffering') || error.message.toLowerCase().includes('mongo')) {
      return res.status(500).json({ error: 'Database connection failed. Please ensure your MONGODB_URI is correct and you replaced <password> with your actual database password.', details: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await (User as any).findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });

    // Validate role
    const validRoles = ['customer', 'product_seller', 'service_seller', 'reseller'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role for registration' });
    }

    // Find the primary tenant (just the first one for now, as it's a single platform in many cases)
    let primaryTenant = await Tenant.findOne();
    if (!primaryTenant) {
      // Auto-create a default tenant if none exists to avoid initialization errors
      primaryTenant = await Tenant.create({ name: 'DealBuzz Default Tenant' });
    }

    const user = await User.create({
      tenantId: primaryTenant._id,
      name,
      email,
      password, // Pre-save hook hashes
      role,
      approvalStatus: role === 'customer' ? 'approved' : 'pending'
    });

    res.status(201).json({ message: 'Registration successful' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await ((User as any).findOne({ email }) as any).select('+password +loginAttempts +lockUntil +refreshTokens');

    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (user.status === 'locked' || (user.lockUntil && user.lockUntil > new Date())) {
      return res.status(401).json({ error: 'Account is temporarily locked due to multiple failed login attempts.' });
    }

    if (user.status === 'inactive') return res.status(401).json({ error: 'User is inactive' });
    if (['product_seller', 'service_seller', 'reseller'].includes(user.role) && user.approvalStatus !== 'approved') {
      return res.status(401).json({ error: `Your account is currently ${user.approvalStatus}. Please wait for super admin approval.` });
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
        user.status = 'locked';
      }
      await user.save();
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    if (user.status === 'locked') user.status = 'active';
    user.lastLogin = new Date();
    
    // Generate Tokens
    const token = jwt.sign(
      { id: user._id, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '15m' } // Make access token short-lived
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
      { expiresIn: '7d' }
    );

    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(refreshToken);
    // Keep max 5 refresh tokens to prevent unbounded array growth
    if (user.refreshTokens.length > 5) {
       user.refreshTokens.shift();
    }
    
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ 
      token, 
      user: { 
        id: user._id, name: user.name, email: user.email, 
        role: user.role, tenantId: user.tenantId, 
        allowedFeatures: user.allowedFeatures, 
        approvalStatus: user.approvalStatus 
      } 
    });
  } catch (error: any) {
    if (error.name === 'MongooseError' || error.message.includes('buffering') || error.message.toLowerCase().includes('mongo')) {
      return res.status(500).json({ error: 'Database connection failed. Please ensure your MONGODB_URI is correct.', details: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'Refresh token required' });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');
    const user = await ((User as any).findById(decoded.id) as any).select('+refreshTokens');
    
    if (!user || !user.refreshTokens?.includes(token)) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '15m' }
    );

    res.json({ token: newAccessToken });
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (token) {
     try {
       const decoded: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');
       await (User as any).findByIdAndUpdate(decoded.id, { $pull: { refreshTokens: token } });
     } catch(e) {
       // ignore verification errors on logout
     }
  }
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await (User as any).findById(req.user?._id).select('-password');
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, profilePicture, coverPhoto, bio, companyName, companyDescription, address, phone, website, coverColor } = req.body;
    const user = await (User as any).findById(req.user?._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (profilePicture) user.profilePicture = profilePicture;
    if (coverPhoto) user.coverPhoto = coverPhoto;
    if (bio) user.bio = bio;
    if (companyName !== undefined) user.companyName = companyName;
    if (companyDescription !== undefined) user.companyDescription = companyDescription;
    if (address !== undefined) user.address = address;
    if (phone !== undefined) user.phone = phone;
    if (website !== undefined) user.website = website;
    if (coverColor !== undefined) user.coverColor = coverColor;

    await user.save();
    
    // Return all fields
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    const user = await (User as any).findById(req.user?._id).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password!);
    if (!isMatch) return res.status(400).json({ error: 'Invalid current password' });

    user.password = newPassword; // User model pre-save hook handles hashing
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const generate2FA = async (req: AuthRequest, res: Response) => {
  try {
    const user = await ((User as any).findById(req.user?._id) as any).select('+twoFactorSecret');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const secret = speakeasy.generateSecret({ name: `DealBuzz (${user.email})` });
    user.twoFactorSecret = secret.base32;
    await user.save();

    const dataUrl = await qrcode.toDataURL(secret.otpauth_url!);
    res.json({ secret: secret.base32, qrCode: dataUrl });
  } catch(error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const verify2FA = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;
    const user = await ((User as any).findById(req.user?._id) as any).select('+twoFactorSecret');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (verified) {
      user.isTwoFactorEnabled = true;
      await user.save();
      res.json({ message: '2FA enabled successfully' });
    } else {
      res.status(400).json({ error: 'Invalid token' });
    }
  } catch(error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const disable2FA = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;
    const user = await ((User as any).findById(req.user?._id) as any).select('+twoFactorSecret');
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Only check if it was enabled to be safe
    if (!user.isTwoFactorEnabled) {
      return res.status(400).json({ error: '2FA is not enabled' });
    }
    
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.json({ message: '2FA disabled successfully' });
  } catch(error: any) {
    res.status(500).json({ error: error.message });
  }
};
