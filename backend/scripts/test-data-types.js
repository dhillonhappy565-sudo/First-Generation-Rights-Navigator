import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const db = mongoose.connection.db;
    const schemes = await db.collection('schemes').find({}).toArray();
    let hasStringDocuments = false;
    let hasStringOccupation = false;
    let hasStringTags = false;

    for (let s of schemes) {
        if (s.documents && !Array.isArray(s.documents)) {
           console.log(`Scheme ${s.scheme_name} has invalid documents:`, typeof s.documents);
           hasStringDocuments = true;
        }
        if (s.eligibility?.occupation && !Array.isArray(s.eligibility.occupation)) {
           console.log(`Scheme ${s.scheme_name} has invalid occupation:`, typeof s.eligibility.occupation);
           hasStringOccupation = true;
        }
        if (s.tags && !Array.isArray(s.tags)) {
           console.log(`Scheme ${s.scheme_name} has invalid tags:`, typeof s.tags);
           hasStringTags = true;
        }
    }
    
    console.log("Check complete. hasStringDocuments:", hasStringDocuments, "hasStringOccupation:", hasStringOccupation);
    process.exit(0);
});
