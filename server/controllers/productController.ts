import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import Product from '../models/Product.js';

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query: any = { tenantId: req.tenantId, isDeleted: false };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const items = await (Product as any).find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });
      
    const total = await (Product as any).countDocuments(query);
    res.json({ data: items, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.create({ ...req.body, tenantId: req.tenantId });
    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await (Product as any).findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await (Product as any).findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { isDeleted: true },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
