import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import passport from 'passport';
import { configurePassport } from './config/passport';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import facilityRoutes from './routes/facility.routes';
import fundingSourceRoutes from './routes/fundingSource.routes';
import projectRoutes from './routes/project.routes';
import budgetRoutes from './routes/budget.routes';
import budgetLineRoutes from './routes/budgetLine.routes';
import costEventRoutes from './routes/costEvent.routes';
import vendorRoutes from './routes/vendor.routes';
import commentRoutes from './routes/comment.routes';
import issueRoutes from './routes/issue.routes';
import reportRoutes from './routes/report.routes';
import auditRoutes from './routes/audit.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport configuration
configurePassport(passport);
app.use(passport.initialize());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/funding-sources', fundingSourceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api', budgetLineRoutes); // Handles both /budgets/:id/budget-lines and /budget-lines/:id
app.use('/api/cost-events', costEventRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Data mode: ${process.env.VITE_DATA_MODE || 'demo'}`);
});

export default app;
