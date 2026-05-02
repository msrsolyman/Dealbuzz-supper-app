import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { auditLog } from '../middlewares/auditMiddleware.js';

import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Service from '../models/Service.js';
import Invoice from '../models/Invoice.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import Account from '../models/Account.js';
import AccountingTransaction from '../models/AccountingTransaction.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// --- Auth Routes ---
router.post('/auth/register', register);
router.post('/auth/login', auditLog('Users'), login);
router.get('/auth/me', authenticate, getMe);

// Middleware to use for all protected routes
router.use(authenticate);

// Helper for standard CRUD generator
const generateCrud = (model: any, collectionName: string) => {
  const r = express.Router();
  r.use(auditLog(collectionName));
  
  r.get('/', async (req: any, res: any) => {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const query: any = { tenantId: req.tenantId };
      if (model.schema.paths.isDeleted) query.isDeleted = false;
      if (search && model.schema.paths.name) query.name = { $regex: search, $options: 'i' };
      
      const items = await (model as any).find(query)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .sort({ createdAt: -1 });
      const total = await (model as any).countDocuments(query);
      res.json({ data: items, total, page: Number(page) });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  r.post('/', async (req: any, res: any) => {
    try {
      const doc = await model.create({ ...req.body, tenantId: req.tenantId });
      res.status(201).json(doc);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  r.put('/:id', async (req: any, res: any) => {
    try {
      const q = { _id: req.params.id, tenantId: req.tenantId };
      const doc = await model.findOneAndUpdate(q, req.body, { new: true });
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json(doc);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  r.delete('/:id', async (req: any, res: any) => {
    try {
      const q = { _id: req.params.id, tenantId: req.tenantId };
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
router.use('/products', auditLog('Product'), getProducts as any); // using the specific one or replacing
router.get('/products', getProducts as any);
router.post('/products', auditLog('Product'), createProduct as any);
router.put('/products/:id', auditLog('Product'), updateProduct as any);
router.delete('/products/:id', auditLog('Product'), deleteProduct as any);

router.use('/services', generateCrud(Service, 'Service'));
router.use('/accounts', generateCrud(Account, 'Account'));
router.use('/accounting-transactions', generateCrud(AccountingTransaction, 'AccountingTransaction'));

// --- Invoice with special logic ---
const invoiceRouter = express.Router();
invoiceRouter.use(auditLog('Invoice'));
invoiceRouter.get('/', async (req: any, res: any) => {
  try {
    const invoices = await (Invoice as any).find({ tenantId: req.tenantId, isDeleted: false }).populate('customerId');
    res.json({ data: invoices });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
invoiceRouter.post('/', async (req: any, res: any) => {
  try {
    const doc = await Invoice.create({ ...req.body, tenantId: req.tenantId });
    res.status(201).json(doc);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});
invoiceRouter.put('/:id', async (req: any, res: any) => {
  try {
    const doc = await (Invoice as any).findOneAndUpdate({ _id: req.params.id, tenantId: req.tenantId }, req.body, { new: true });
    res.json(doc);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});
router.use('/invoices', invoiceRouter);

// --- Inventory with Stock update ---
const inventoryRouter = express.Router();
inventoryRouter.use(auditLog('InventoryTransaction'));
inventoryRouter.get('/', async (req: any, res: any) => {
  try {
    const tx = await (InventoryTransaction as any).find({ tenantId: req.tenantId }).populate('productId');
    res.json({ data: tx });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
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
      if (type === 'IN') product.stockCount += quantity;
      else if (type === 'OUT') product.stockCount -= quantity;
      await product.save();
    }

    res.status(201).json(doc);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});
router.use('/inventory', inventoryRouter);

// --- Users (Tenant specific) ---
router.use('/users', generateCrud(User, 'User'));

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
