// Must be set before any imports to bypass network SSL interception
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoute.js';
import userRoutes from './routes/userRoute.js';
import schemeRoutes from './routes/schemeRoute.js';
import chatRoutes from './routes/chatRoute.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/schemes', schemeRoutes);
app.use('/chat', chatRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
