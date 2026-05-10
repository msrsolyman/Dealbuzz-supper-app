import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import { connectDB } from './server/utils/db.ts';
import apiRoutes from './server/routes/index.ts';
import Invoice from './server/models/Invoice.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Connect to Database
  await connectDB();

  // Simulated Auto-reminder Cron Job (runs every minute in dev)
  setInterval(async () => {
    try {
       const today = new Date();
       const pdInvoices = await Invoice.find({ 
         status: { $ne: 'PAID' }, 
         dueDate: { $lt: today }, 
         isDeleted: false 
       } as any).populate('customerId');
       
       if (pdInvoices.length > 0) {
         console.log(`[Auto-Reminder] Found ${pdInvoices.length} due invoices. Sending SMS/Email to customers...`);
         for(const inv of pdInvoices) {
            const customer: any = inv.customerId;
            if (customer) {
               // Pseudo send-sms
               console.log(` -> SMS Sent to ${customer.phone || customer.email} for Invoice ${inv.invoiceNumber} (Amount: ${inv.total})`);
            }
         }
       }
    } catch (e) {
      //
    }
  }, 60 * 1000);

  // API Routes
  app.use('/api', apiRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For Express v4, use '*'
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
