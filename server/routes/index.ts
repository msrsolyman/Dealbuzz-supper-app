import express from 'express';
import { register, registerUser, login, getMe, updateMe, updatePassword, refreshToken, logout, generate2FA, verify2FA, disable2FA } from '../controllers/authController.ts';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController.ts';
import { authenticate } from '../middlewares/authMiddleware.ts';
import { authorize } from '../middlewares/roleMiddleware.ts';
import { auditLog } from '../middlewares/auditMiddleware.ts';

import Tenant from '../models/Tenant.ts';
import User from '../models/User.ts';
import Product from '../models/Product.ts';
import Service from '../models/Service.ts';
import Invoice from '../models/Invoice.ts';
import InventoryTransaction from '../models/InventoryTransaction.ts';
import Account from '../models/Account.ts';
import AccountingTransaction from '../models/AccountingTransaction.ts';
import AuditLog from '../models/AuditLog.ts';
import Warehouse from '../models/Warehouse.ts';
import Customer from '../models/Customer.ts';
import Review from '../models/Review.ts';
import Vendor from '../models/Vendor.ts';
import PurchaseOrder from '../models/PurchaseOrder.ts';
import Attendance from '../models/Attendance.ts';
import Leave from '../models/Leave.ts';
import Payroll from '../models/Payroll.ts';
import Expense from '../models/Expense.ts';
import Quotation from '../models/Quotation.ts';
import Return from '../models/Return.ts';
import Coupon from '../models/Coupon.ts';
import ManufacturingOrder from '../models/ManufacturingOrder.ts';
import SalesTarget from '../models/SalesTarget.ts';
import Campaign from '../models/Campaign.ts';
import Offer from '../models/Offer.ts';

import Ticket from '../models/Ticket.ts';
import Task from '../models/Task.ts';

import { cacheMiddleware, clearCache } from '../middleware/cache.ts';

import { getDashboardAnalytics } from '../controllers/analyticsController.ts';
import { getNotifications, markAsRead } from '../controllers/notificationController.ts';
import { sendOrderAlert, sendStockAlert, sendPaymentAlert } from '../services/notificationService.ts';

const router = express.Router();

router.get('/analytics/dashboard', authenticate, getDashboardAnalytics);
router.get('/notifications', authenticate, getNotifications);
router.put('/notifications/:id/read', authenticate, markAsRead);

// --- Custom auth-related routes ---
// Move sellers under authenticate
router.get('/sellers', authenticate, cacheMiddleware(300), async (req: any, res: any) => {
  try {
    const sellers = await (User as any).find({ 
      tenantId: req.tenantId, 
      role: { $in: ['product_seller', 'service_seller', 'reseller'] },
      isDeleted: false 
    }).select('-password').lean();
    res.json({ data: sellers });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.put('/sellers/:id', authenticate, auditLog('User'), async (req: any, res: any) => {
  try {
    const q = { _id: req.params.id, tenantId: req.tenantId };
    const doc = await (User as any).findOneAndUpdate(q, req.body, { new: true }).select('-password');
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

router.post('/auth/register', register);
router.post('/auth/register-user', registerUser);
router.post('/auth/login', auditLog('Users'), login);
router.post('/auth/refresh', refreshToken);
router.post('/auth/logout', logout);
router.get('/auth/me', authenticate, getMe);
router.put('/auth/me', authenticate, auditLog('User'), updateMe);
router.put('/auth/password', authenticate, auditLog('User'), updatePassword);
router.get('/auth/2fa/generate', authenticate, generate2FA);
router.post('/auth/2fa/verify', authenticate, verify2FA);
router.post('/auth/2fa/disable', authenticate, disable2FA);

// Add Google OAuth
const getRedirectUri = (req: any) => {
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${proto}://${host}/api/auth/google/callback`;
};

router.get('/auth/google/url', (req: any, res: any) => {
  const redirectUri = getRedirectUri(req);
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email profile',
  });
  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  res.json({ url });
});

router.get('/auth/google/callback', async (req: any, res: any) => {
  try {
    const { code } = req.query;
    const redirectUri = getRedirectUri(req);
    
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.send('Google OAuth not configured properly.');
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }).toString() // Use .toString()
    });
    
    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return res.send(`<script>alert("OAuth Error: ${tokenData.error}"); window.close();</script>`);
    }
    
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();
    
    let user = await (User as any).findOne({ email: userData.email });
    if (!user) {
       let primaryTenant = await Tenant.findOne();
       if (!primaryTenant) {
         primaryTenant = await Tenant.create({ name: 'DealBuzz Default Tenant' });
       }
       user = await (User as any).create({
         tenantId: primaryTenant._id,
         name: userData.name,
         email: userData.email,
         password: Math.random().toString(36).slice(-8),
         role: 'customer',
         approvalStatus: 'approved'
       });
    }
    
    const jwt = await import('jsonwebtoken');
    const token = jwt.default.sign(
      { id: user._id, tenantId: user.tenantId, role: user.role }, 
      process.env.JWT_SECRET || 'supersecret'
    );
    
    res.send(`
      <html>
        <body>
          <script>
            try {
              // Always write to localStorage in case opener postMessage fails
              localStorage.setItem('token', '${token}');
              localStorage.setItem('user', JSON.stringify(${JSON.stringify(user)}));
              
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: '${token}', user: ${JSON.stringify(user)} }, '*');
              }
              
              window.close();
              
              // Fallback if window doesn't close
              setTimeout(() => { window.location.href = '/'; }, 2000);
            } catch (err) {
               document.write("Error: " + err.message);
               // Still try to redirect as fallback
               setTimeout(() => { window.location.href = '/'; }, 2000);
            }
          </script>
          <p>Authentication successful. You can close this window now.</p>
        </body>
      </html>
    `);
  } catch (err: any) {
    res.send('Server Error: ' + err.message);
  }
});

import { GoogleGenAI } from '@google/genai';

router.post('/ai/generate-description', async (req: any, res: any) => {
  try {
    const { name, category, brand, features } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API Key is not configured on the server.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are an expert copywriter. Generate compelling marketing copy for a product based on the following attributes:
Product Name: ${name || 'Unknown'}
Category: ${category || 'General'}
Brand: ${brand || 'White Label'}
Features: ${features || 'N/A'}

Please provide:
1. A concise, catchy "Short Description" (2-3 sentences max)
2. A comprehensive "Full Description" focusing on benefits and value
3. A list of 3 "Top Benefits"
4. SEO "Meta Title"
5. SEO "Meta Description" (under 160 characters)

Format the exact response in strict JSON:
{
  "shortDescription": "...",
  "description": "...",
  "benefits": ["benefit 1", "benefit 2", "benefit 3"],
  "metaTitle": "...",
  "metaDescription": "..."
}

Do not include any markdown formatting or ticks. Just output valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json'
      }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('AI Gen Error:', error);
    res.status(500).json({ error: 'Failed to generate content.' });
  }
});

router.post('/ai/chat', async (req: any, res: any) => {
  try {
    const { messages, userMessage, catalogContext } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API Key is not configured on the server.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const systemInstruction = `You are a helpful and expert AI assistant for Dealbuzz, a premium storefront.
Your goal is to understand the customer's problem or needs and recommend appropriate products or services from our catalog.
Be concise, friendly, and persuasive. If we don't have something that completely solves their problem, suggest the closest alternative.

Here is our current catalog:
${catalogContext}`;

    const chatContents = messages.map((m: any) => ({
        role: m.role,
        parts: [{ text: m.content }]
    }));
    chatContents.push({ role: 'user', parts: [{ text: userMessage }]});

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: chatContents,
      config: {
        systemInstruction,
      }
    });

    res.json({ text: response.text || "Sorry, I couldn't find a good answer." });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Apologies, I encountered an issue while trying to help you. Please try again later.' });
  }
});

router.post('/ai/seller-chat', authenticate, async (req: any, res: any) => {
  try {
    const { messages, userMessage } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API Key is not configured on the server.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const systemInstruction = `You are an expert AI Business Advisor for Dealbuzz merchants.
Your goal is to guide sellers and resellers on how to improve their business, increase sales, write better product descriptions, handle inventory, or resolve customer issues.
Provide professional, accurate, and actionable advice tailored to e-commerce and retail success. Keep answers concise but highly valuable.`;

    const chatContents = messages.map((m: any) => ({
        role: m.role,
        parts: [{ text: m.content }]
    }));
    chatContents.push({ role: 'user', parts: [{ text: userMessage }]});

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: chatContents,
      config: {
        systemInstruction,
      }
    });

    res.json({ text: response.text || "Sorry, I couldn't generate advice right now." });
  } catch (error: any) {
    console.error('AI Seller Chat Error:', error);
    res.status(500).json({ error: 'Apologies, I encountered an issue while generating advice.' });
  }
});

// Middleware to use for all protected routes
router.use(authenticate);

// Helper for standard CRUD generator
const generateCrud = (model: any, collectionName: string) => {
  const r = express.Router();
  r.use(auditLog(collectionName));
  
  r.get('/', cacheMiddleware(120), async (req: any, res: any) => {
    try {
      const { page = 1, limit = 10, search, ...filters } = req.query;
      const query: any = { tenantId: req.tenantId, ...filters };
      if (['product_seller', 'service_seller', 'reseller'].includes(req.user?.role) && model.schema.paths.sellerId) {
         query.sellerId = req.user._id;
      }
      if (model.schema.paths.isDeleted) query.isDeleted = false;
      if (search && model.schema.paths.name) query.name = { $regex: search, $options: 'i' };
      
      let queryBuilder = (model as any).find(query).lean();
      
      // Auto-populate some useful fields if they exist on the model
      if (model.schema.paths.customerId && model.modelName === 'Review') {
        queryBuilder = queryBuilder.populate('customerId', 'name email');
      }

      const items = await queryBuilder
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .sort({ createdAt: -1 });
      const total = await (model as any).countDocuments(query);
      res.json({ data: items, total, page: Number(page) });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  r.post('/', async (req: any, res: any) => {
    try {
      const data = { ...req.body, tenantId: req.tenantId };
      if (!data.sellerId && model.schema.paths.sellerId) {
         data.sellerId = req.user._id;
      }
      const doc = await model.create(data);
      res.status(201).json(doc);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  r.put('/:id', async (req: any, res: any) => {
    try {
      const q: any = { _id: req.params.id, tenantId: req.tenantId };
      if (['product_seller', 'service_seller', 'reseller'].includes(req.user?.role) && model.schema.paths.sellerId) {
         q.sellerId = req.user._id;
      }
      const doc = await model.findOneAndUpdate(q, req.body, { new: true });
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json(doc);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  r.delete('/:id', async (req: any, res: any) => {
    try {
      const q: any = { _id: req.params.id, tenantId: req.tenantId };
      if (['product_seller', 'service_seller', 'reseller'].includes(req.user?.role) && model.schema.paths.sellerId) {
         q.sellerId = req.user._id;
      }
      let doc;
      if (model.schema.paths.isDeleted) {
        doc = await (model as any).findOneAndUpdate(q, { isDeleted: true }, { new: true });
      } else {
        doc = await (model as any).findOneAndDelete(q);
      }
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Deleted' });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  return r;
};

// --- Standard Modules ---
router.get('/products', getProducts as any);
router.post('/products', auditLog('Product'), createProduct as any);
router.put('/products/:id', auditLog('Product'), updateProduct as any);
router.delete('/products/:id', auditLog('Product'), deleteProduct as any);

router.use('/services', generateCrud(Service, 'Service'));
router.use('/accounts', generateCrud(Account, 'Account'));
router.use('/accounting-transactions', generateCrud(AccountingTransaction, 'AccountingTransaction'));
router.use('/warehouses', generateCrud(Warehouse, 'Warehouse'));
router.use('/customers', generateCrud(Customer, 'Customer'));
router.use('/reviews', generateCrud(Review, 'Review'));
router.use('/vendors', generateCrud(Vendor, 'Vendor'));
router.post('/purchase-orders/:id/receive', authenticate, auditLog('PurchaseOrder'), async (req: any, res: any) => {
  try {
    const po = await (PurchaseOrder as any).findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!po) return res.status(404).json({ error: 'Not found' });
    if (po.status === 'RECEIVED') return res.status(400).json({ error: 'Already received' });

    for (const item of po.items) {
      if (po.warehouseId) {
        // Find product, add to warehouseStock
        const prod = await (Product as any).findById(item.productId);
        if (prod) {
          const wStock = prod.warehouseStock.find((w: any) => w.warehouseId.toString() === po.warehouseId.toString());
          if (wStock) wStock.stockCount += item.quantity;
          else prod.warehouseStock.push({ warehouseId: po.warehouseId, stockCount: item.quantity });
          prod.stockCount += item.quantity;
          await prod.save();
        }
      } else {
        await (Product as any).findByIdAndUpdate(item.productId, { $inc: { stockCount: item.quantity } });
      }
    }
    po.status = 'RECEIVED';
    await po.save();
    res.json(po);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.use('/purchase-orders', generateCrud(PurchaseOrder, 'PurchaseOrder'));
router.use('/attendances', generateCrud(Attendance, 'Attendance'));
router.use('/leaves', generateCrud(Leave, 'Leave'));
router.use('/payrolls', generateCrud(Payroll, 'Payroll'));
router.use('/expenses', generateCrud(Expense, 'Expense'));
router.use('/quotations', generateCrud(Quotation, 'Quotation'));

router.post('/returns/:id/complete', authenticate, auditLog('Return'), async (req: any, res: any) => {
  try {
     const returnDoc = await (Return as any).findOne({ _id: req.params.id, tenantId: req.tenantId });
     if (!returnDoc) return res.status(404).json({error: 'Not found'});
     if (returnDoc.status === 'COMPLETED') return res.status(400).json({error: 'Already completed'});
     
     // Stock adjustment
     for (const item of returnDoc.items) {
        if (item.condition === 'GOOD') {
           await (Product as any).findByIdAndUpdate(item.productId, { $inc: { stockCount: item.quantity } });
        } else {
           await (Product as any).findByIdAndUpdate(item.productId, { $inc: { damagedStock: item.quantity } });
        }
     }
     
     returnDoc.status = 'COMPLETED';
     await returnDoc.save();
     res.json(returnDoc);
  } catch (e: any) {
     res.status(500).json({ error: e.message });
  }
});

router.use('/returns', generateCrud(Return, 'Return'));
router.use('/coupons', generateCrud(Coupon, 'Coupon'));
router.use('/manufacturing-orders', generateCrud(ManufacturingOrder, 'ManufacturingOrder'));
router.use('/campaigns', generateCrud(Campaign, 'Campaign'));
router.use('/offers', generateCrud(Offer, 'Offer'));

router.use('/sales-targets', generateCrud(SalesTarget, 'SalesTarget'));
router.use('/tickets', generateCrud(Ticket, 'Ticket'));
router.use('/tasks', generateCrud(Task, 'Task'));

// --- Invoice with special logic ---
const invoiceRouter = express.Router();
invoiceRouter.use(auditLog('Invoice'));
invoiceRouter.get('/', cacheMiddleware(120), async (req: any, res: any) => {
  try {
    const query: any = { tenantId: req.tenantId, isDeleted: false };
    if (req.user?.role === 'customer') {
      query.customerId = req.user._id;
    } else if (['product_seller', 'service_seller', 'reseller'].includes(req.user?.role)) {
       query.sellerId = req.user._id;
    }
    const invoices = await (Invoice as any).find(query).populate('customerId').lean();
    res.json({ data: invoices });
  } catch (e: any) { 
    console.error("INV ERROR:", e);
    res.status(500).json({ error: e.message }); 
  }
});
invoiceRouter.post('/', async (req: any, res: any) => {
  try {
    const mongoose = (await import('mongoose')).default;
    const items = req.body.items?.map((item: any) => ({
      ...item,
      itemId: item.itemId || new mongoose.Types.ObjectId()
    })) || [];
    
    let sellerId = req.body.sellerId;
    if (['product_seller', 'service_seller', 'reseller'].includes(req.user?.role)) {
       sellerId = req.user._id;
    }

    const doc = await Invoice.create({ ...req.body, items, tenantId: req.tenantId, sellerId });
    
    // Deduct stock for products
    for (const item of items) {
      if (item.itemType === 'Product') {
        const product = await (Product as any).findOne({ _id: item.itemId, tenantId: req.tenantId });
        if (product) {
          product.stockCount -= item.quantity;
          
          // Optionally from a default warehouse if req.body.warehouseId is sent
          if (req.body.warehouseId && product.warehouseStock) {
            const whStock = product.warehouseStock.find((w: any) => w.warehouseId.toString() === req.body.warehouseId);
            if (whStock) {
              whStock.stockCount -= item.quantity;
            }
          }
          await product.save();

          if (product.stockCount < 10) {
            await sendStockAlert(req.tenantId.toString(), product.name, product.stockCount);
          }
          
          // Add inventory transaction record
          await (InventoryTransaction as any).create({
            tenantId: req.tenantId,
            productId: item.itemId,
            warehouseId: req.body.warehouseId || undefined,
            type: 'OUT',
            quantity: item.quantity,
            unitCost: item.rate,
            totalCost: item.quantity * item.rate,
            costingMethod: 'FIFO',
            referenceId: doc._id.toString()
          });
        }
      }
    }
    
    // Order alert
    await sendOrderAlert(req.tenantId.toString(), doc._id.toString(), doc.totalAmount || doc.subtotal, sellerId?.toString() || req.user._id.toString());

    res.status(201).json(doc);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});
invoiceRouter.put('/:id', async (req: any, res: any) => {
  try {
    const oldDoc = await (Invoice as any).findOne({ _id: req.params.id, tenantId: req.tenantId });
    const doc = await (Invoice as any).findOneAndUpdate({ _id: req.params.id, tenantId: req.tenantId }, req.body, { new: true }).populate('customerId');
    
    if (oldDoc && doc.status === 'PAID' && oldDoc.status !== 'PAID') {
      const customerName = doc.customerId?.name || 'Customer';
      await sendPaymentAlert(req.tenantId.toString(), customerName, doc.totalAmount || doc.subtotal);
    }
    
    res.json(doc);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});
router.use('/invoices', invoiceRouter);

// --- Inventory with Stock update ---
const inventoryRouter = express.Router();
inventoryRouter.use(auditLog('InventoryTransaction'));
inventoryRouter.get('/', cacheMiddleware(60), async (req: any, res: any) => {
  try {
    const tx = await (InventoryTransaction as any).find({ tenantId: req.tenantId }).populate('productId').lean();
    res.json({ data: tx });
  } catch (e: any) { 
    console.error("INV_TX ERROR:", e);
    res.status(500).json({ error: e.message }); 
  }
});
inventoryRouter.post('/', async (req: any, res: any) => {
  try {
    const { productId, type, quantity, unitCost, costingMethod } = req.body;
    const totalCost = quantity * unitCost;

    const doc = await (InventoryTransaction as any).create({
      ...req.body, tenantId: req.tenantId, totalCost
    });

    // Update Product Stock Count
    const product = await (Product as any).findOne({ _id: productId, tenantId: req.tenantId });
    if (product) {
      if (type === 'IN') {
        product.stockCount += quantity;
      } else if (type === 'OUT') {
        product.stockCount -= quantity;
      }
      
      // Update specific warehouse stock if provided
      if (req.body.warehouseId) {
        if (!product.warehouseStock) product.warehouseStock = [];
        const whStock = product.warehouseStock.find((w: any) => w.warehouseId.toString() === req.body.warehouseId);
        if (whStock) {
          if (type === 'IN') whStock.stockCount += quantity;
          else if (type === 'OUT') whStock.stockCount -= quantity;
        } else {
          product.warehouseStock.push({
            warehouseId: req.body.warehouseId,
            stockCount: type === 'IN' ? quantity : -quantity
          });
        }
      }

      await product.save();

      if (type === 'OUT' && product.stockCount < 10) {
        await sendStockAlert(req.tenantId.toString(), product.name, product.stockCount);
      }
    }

    res.status(201).json(doc);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});
router.use('/inventory', inventoryRouter);

// --- Users (Tenant specific) ---
router.use('/users', authorize(['super_admin', 'admin']), generateCrud(User, 'User'));

// --- Audit Logs ---
router.get('/audit-logs', async (req: any, res: any) => {
  try {
    const logs = await (AuditLog as any).find({ tenantId: req.tenantId }).sort({ createdAt: -1 }).limit(100);
    res.json({ data: logs });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- Super Admin Routes ---
router.get('/admin/tenants', authorize(['super_admin']), async (req: any, res: any) => {
  const tenants = await Tenant.find();
  res.json({ data: tenants });
});

export default router;
