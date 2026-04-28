import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Scheme from '../models/Scheme.js';

dotenv.config({ path: '../.env' }); // Adjust if run from inside backend root vs scripts dir

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rights-navigator');
        console.log('MongoDB connected for seeding');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const schemes = [
    {
        scheme_name: 'PM Kisan Samman Nidhi',
        level: 'Central',
        state: 'All',
        category: 'Agriculture',
        tags: ['farmer', 'kisan', 'agriculture', 'income', 'land'],
        eligibility: {
            occupation: ['Farmer'],
            income: { max: 1000000 }
        },
        documents: ['Aadhaar Card', 'Land Record details', 'Bank Account details'],
        benefits: 'Provides an income support of ₹6,000 per year in three equal installments to all land holding farmer families.',
        steps: ['Visit the official PM-KISAN portal', 'Click on New Farmer Registration', 'Enter Aadhaar number and fill details']
    },
    {
        scheme_name: 'Ayushman Bharat Yojana (PM-JAY)',
        level: 'Central',
        state: 'All',
        category: 'Healthcare',
        tags: ['health', 'hospital', 'insurance', 'bpl', 'medical'],
        eligibility: {
            bpl: true
        },
        documents: ['Aadhaar Card', 'Ration Card', 'Mobile Number'],
        benefits: 'Provides health cover of ₹5 lakhs per family per year for secondary and tertiary care hospitalization.',
        steps: ['Visit nearest CSC centre or hospital', 'Verify identity via Aadhaar', 'Get your Ayushman card generated']
    },
    {
        scheme_name: 'Haryana Kanya Kosh',
        level: 'State',
        state: 'Haryana',
        category: 'Education & Women',
        tags: ['girl', 'daughter', 'education', 'women'],
        eligibility: {
            gender: 'Female',
            income: { max: 200000 }
        },
        documents: ['Aadhaar Card', 'Birth Certificate of girl child', 'Income Proof'],
        benefits: 'Financial assistance for the birth and education of girl children belonging to BPL families in Haryana.',
        steps: ['Register at Anganwadi centre', 'Submit required documents verified by Sarpanch']
    },
    {
        scheme_name: 'Post Matric Scholarship for Minorities',
        level: 'Central',
        state: 'All',
        category: 'Education',
        tags: ['student', 'education', 'scholarship', 'minority', 'college'],
        eligibility: {
            occupation: ['Student'],
            income: { max: 200000 }
        },
        documents: ['Previous Year Marksheet', 'Income Certificate', 'Aadhaar Card', 'Fee Receipt'],
        benefits: 'Financial assistance to meritorious students belonging to minority communities to pursue higher education.',
        steps: ['Register on National Scholarship Portal (NSP)', 'Complete the application', 'Submit to institute for verification']
    }
];

const seedData = async () => {
    await connectDB();
    try {
        await Scheme.deleteMany(); // Clear existing
        console.log('Cleared existing schemes...');
        
        await Scheme.insertMany(schemes);
        console.log('Successfully seeded government schemes.');
        
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedData();
