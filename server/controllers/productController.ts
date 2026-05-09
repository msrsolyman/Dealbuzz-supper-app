import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import Product from '../models/Product.js';

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search, sellerId } = req.query;
    const query: any = { tenantId: req.tenantId, isDeleted: false };
    
    if (['product_seller', 'service_seller', 'reseller'].includes(req.user?.role as string)) {
       query.sellerId = req.user?._id;
    } else if (sellerId) {
       query.sellerId = sellerId;
    }

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
    let sku = req.body.sku;
    if (!sku) {
      sku = 'PRD-' + Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 5).toUpperCase();
    }
    const productData = { ...req.body, sku, tenantId: req.tenantId };
    
    // Automatically assign sellerId if created by a seller and not explicitly provided
    if (!productData.sellerId && req.user && ['product_seller', 'service_seller', 'reseller'].includes(req.user.role)) {
      productData.sellerId = req.user._id;
    }
    
    // Force sellerId to current user if they are a seller, to prevent impersonation
    if (req.user && ['product_seller', 'service_seller', 'reseller'].includes(req.user.role)) {
      productData.sellerId = req.user._id;
    }

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const q: any = { _id: req.params.id, tenantId: req.tenantId, isDeleted: false };
    if (req.user && ['product_seller', 'service_seller', 'reseller'].includes(req.user.role)) {
       q.sellerId = req.user._id;
    }
    const product = await (Product as any).findOneAndUpdate(
      q,
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
    const q: any = { _id: req.params.id, tenantId: req.tenantId };
    if (req.user && ['product_seller', 'service_seller', 'reseller'].includes(req.user.role)) {
       q.sellerId = req.user._id;
    }
    const product = await (Product as any).findOneAndUpdate(
      q,
      { isDeleted: true },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
