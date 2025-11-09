import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middleware/errorHandler.js';
import { uploadRoutes } from './routes/uploadRoutes.js';
import { saveRoutes } from './routes/saveRoutes.js';
import { connectDB } from './models/database.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const __dirname = path.resolve();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-production-domain.com']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/id', uploadRoutes);
app.use('/api/id', saveRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📥 Upload endpoint: http://localhost:${PORT}/api/id/upload`);
  console.log(`💾 Save endpoint: http://localhost:${PORT}/api/id/save`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

export default app;