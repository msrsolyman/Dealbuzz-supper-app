import mongoose from 'mongoose';
import User from './server/models/User.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI as string).then(async () => {
    const user = await User.findOne();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

    console.log('Fetching /api/invoices');
    try {
        const res = await fetch('http://localhost:3000/api/invoices', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('invoices status:', res.status);
        console.log('invoices body:', await res.json());
    } catch(e) { console.error('Inv err', e); }

    console.log('Fetching /api/products');
    try {
        const res = await fetch('http://localhost:3000/api/products', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('products status:', res.status);
        console.log('products body:', await res.json());
    } catch(e) { console.error('Prod err', e); }

    process.exit(0);
});
