const fs = require('fs');
const files = ['Customer', 'Vendor', 'Quotation', 'PurchaseOrder', 'Return', 'Task', 'Ticket'];

files.forEach(file => {
  const path = `./server/models/${file}.ts`;
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Add to interface
    content = content.replace(/tenantId: mongoose\.Types\.ObjectId;/, 'tenantId: mongoose.Types.ObjectId;\n  sellerId?: mongoose.Types.ObjectId;');
    
    // Add to schema
    content = content.replace(/tenantId:\s*\{\s*type:\s*Schema\.Types\.ObjectId,\s*ref:\s*'Tenant',\s*required:\s*true,\s*index:\s*true\s*\}/, "tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },\n    sellerId: { type: Schema.Types.ObjectId, ref: 'User', index: true }");
    
    fs.writeFileSync(path, content);
  }
});
