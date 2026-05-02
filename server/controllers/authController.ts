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

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Admin User
    const user = await User.create({
      tenantId: tenant._id,
      name: userName,
      email,
      password: hashedPassword,
      role: 'admin' // First user is the admin of the tenant
    });

    res.status(201).json({ message: 'Tenant and Admin created successfully' });
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

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    res.json({ user: req.user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
