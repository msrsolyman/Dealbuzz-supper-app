import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';

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
      role: 'admin' // First user is the admin of the tenant
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
    const primaryTenant = await Tenant.findOne();
    if (!primaryTenant) {
      return res.status(400).json({ error: 'Platform not initialized. Please contact support.' });
    }

    const user = await User.create({
      tenantId: primaryTenant._id,
      name,
      email,
      password, // Pre-save hook hashes
      role
    });

    res.status(201).json({ message: 'Registration successful' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await (User as any).findOne({ email }).select('+password');

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.status === 'inactive') return res.status(401).json({ error: 'User is inactive' });
    if (['product_seller', 'service_seller', 'reseller'].includes(user.role) && user.approvalStatus !== 'approved') {
      return res.status(401).json({ error: `Your account is currently ${user.approvalStatus}. Please wait for super admin approval.` });
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId, allowedFeatures: user.allowedFeatures, approvalStatus: user.approvalStatus } });
  } catch (error: any) {
    if (error.name === 'MongooseError' || error.message.includes('buffering') || error.message.toLowerCase().includes('mongo')) {
      return res.status(500).json({ error: 'Database connection failed. Please ensure your MONGODB_URI is correct and you replaced <password> with your actual database password.', details: error.message });
    }
    res.status(500).json({ error: error.message });
  }
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
