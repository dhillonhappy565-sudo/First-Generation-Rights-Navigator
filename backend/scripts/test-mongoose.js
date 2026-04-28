import mongoose from 'mongoose';
import Scheme from '../models/Scheme.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const res = await Scheme.find({}).limit(1).lean();
    console.log("LEAN RESULT:", res);
    
    const res2 = await Scheme.find({}).limit(1);
    console.log("MONGOOSE RESULT:", res2);
    process.exit(0);
});
