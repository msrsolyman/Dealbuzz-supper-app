import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import compression from 'compression';
import { connectDB } from './server/utils/db.ts';
import apiRoutes from './server/routes/index.ts';
import Invoice from './server/models/Invoice.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(cors());
  app.use(compression());
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

  // Set up root endpoint for robots.txt
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://${req.get('host')}/sitemap.xml`);
  });

  // Set up root endpoint for sitemap.xml
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const db = await connectDB();
      res.type('application/xml');
      
      const baseUrl = `https://${req.get('host')}`;
      
      // Usually fetch public entities from DB
      // For a SPA mostly relying on one storefront 
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/register</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/seller-register</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

      res.send(sitemap);
    } catch (e) {
      res.status(500).end();
    }
  });

  // API Routes
  app.use('/api', apiRoutes);

  // API Global Error Handler
  app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      status: err.status || 500,
      timestamp: new Date().toISOString()
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const fs = await import('fs');
    app.use(express.static(distPath, { index: false }));
    
    // For Express v4, use '*'
    app.get('*', (req, res) => {
      let indexHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
      
      const title = 'Dealbuzz | Premium Multivendor Ecosystem';
      const description = 'Discover the ultimate B2B/B2C storefront for exclusive products & services.';
      const ogImage = `https://${req.get('host')}/default-og.jpg`;
      const url = `https://${req.get('host')}${req.originalUrl}`;
      
      // Inject meta tags for SEO SSR
      const metaTags = `
        <title>${title}</title>
        <meta name="description" content="${description}" />
        <link rel="canonical" href="${url}" />
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="${url}" />
        <meta property="og:image" content="${ogImage}" />
        <meta property="og:site_name" content="Dealbuzz" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${title}" />
        <meta name="twitter:description" content="${description}" />
        <meta name="twitter:image" content="${ogImage}" />
      `;
      
      indexHtml = indexHtml.replace('</head>', `${metaTags}</head>`);
      res.send(indexHtml);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
