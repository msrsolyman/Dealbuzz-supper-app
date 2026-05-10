import { Request, Response } from 'express';
import Invoice from '../models/Invoice.ts';
import Product from '../models/Product.ts';
import Customer from '../models/Customer.ts';
import InventoryTransaction from '../models/InventoryTransaction.ts';
import AuditLog from '../models/AuditLog.ts';

export const getDashboardAnalytics = async (req: any, res: Response) => {
  try {
    const tenantId = req.tenantId;

    // Dates for recent analytics (approx 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Sales/Revenue
    const invoices = await (Invoice as any).find({ tenantId, isDeleted: false });
    const totalRevenue = invoices.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);
    const recentInvoices = invoices.filter((inv: any) => inv.createdAt >= thirtyDaysAgo);
    const recentRevenue = recentInvoices.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);

    // Sales over time (last 30 days grouped by day)
    const salesOverTime: any[] = [];
    const revenueMap = new Map();
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        revenueMap.set(dateStr, 0);
    }
    recentInvoices.forEach((inv: any) => {
        const dateStr = inv.createdAt.toISOString().split('T')[0];
        if (revenueMap.has(dateStr)) {
            revenueMap.set(dateStr, revenueMap.get(dateStr) + (inv.totalAmount || 0));
        }
    });

    revenueMap.forEach((revenue, date) => {
        salesOverTime.push({ date, revenue });
    });

    // Top Products
    const products = await (Product as any).find({ tenantId, isDeleted: false });
    const totalProducts = products.length;
    // Just a placeholder calculation: sum of stock * price
    const inventoryValuation = products.reduce((sum: number, p: any) => sum + (p.stockCount * (p.price || 0)), 0);

    // Try finding top 5 selling products from invoices
    const productSales = new Map();
    invoices.forEach((inv: any) => {
        inv.items.forEach((item: any) => {
            if(item.itemType === 'Product') {
                const current = productSales.get(item.itemId?.toString()) || 0;
                productSales.set(item.itemId?.toString(), current + item.quantity);
            }
        });
    });

    const topSellingProductIds = [...productSales.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);
    
    const topProducts = products.filter((p: any) => topSellingProductIds.includes(p._id.toString())).map((p: any) => ({
        name: p.name,
        sold: productSales.get(p._id.toString()) || 0,
        currentStock: p.stockCount
    }));

    // Customer Growth
    const totalCustomers = await (Customer as any).countDocuments({ tenantId, isDeleted: false });
    const recentCustomers = await (Customer as any).countDocuments({ tenantId, isDeleted: false, createdAt: { $gte: thirtyDaysAgo } });

    // Recent Activity (User activity tracking)
    const recentActivity = await (AuditLog as any).find({ tenantId }).sort({ createdAt: -1 }).limit(10).populate('userId', 'name role email');

    res.json({
      summary: {
        totalRevenue,
        recentRevenue,
        totalProducts,
        inventoryValuation,
        totalCustomers,
        recentCustomers
      },
      salesOverTime,
      topProducts,
      recentActivity
    });
  } catch (error: any) {
    console.error("Analytics Error:", error);
    res.status(500).json({ error: error.message });
  }
};
