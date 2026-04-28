import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const testDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const schemes = await db.collection('schemes').find({}).limit(1).toArray();
        fs.writeFileSync('test-data-utf8.json', JSON.stringify(schemes[0], null, 2), 'utf8');
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
testDb();
