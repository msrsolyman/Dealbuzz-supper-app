import type { Request, Response } from 'express';
import SalesTarget from '../models/SalesTarget.ts';

export const getSalesTargets = async (req: any, res: Response) => {
  try {
    const { userId, month, year } = req.query;
    const query: any = { tenantId: req.tenantId };
    if (userId) query.userId = userId;
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);

    const targets = await (SalesTarget as any).find(query).populate('userId', 'name email').lean();
    res.json({ data: targets });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createSalesTarget = async (req: any, res: Response) => {
  try {
    const { userId, month, year, targetAmount } = req.body;
    
    // Check if target already exists for this user/month/year
    const existing = await (SalesTarget as any).findOne({
      tenantId: req.tenantId,
      userId,
      month,
      year
    });

    if (existing) {
      return res.status(400).json({ error: 'Sales target already exists for this period.' });
    }

    const target = await (SalesTarget as any).create({
      ...req.body,
      tenantId: req.tenantId
    });
    res.status(201).json(target);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateSalesTarget = async (req: any, res: Response) => {
  try {
    const target = await (SalesTarget as any).findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true }
    );
    if (!target) return res.status(404).json({ error: 'Sales target not found.' });
    res.json(target);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteSalesTarget = async (req: any, res: Response) => {
  try {
    const target = await (SalesTarget as any).findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId
    });
    if (!target) return res.status(404).json({ error: 'Sales target not found.' });
    res.json({ message: 'Sales target deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
