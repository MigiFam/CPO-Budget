// Vercel serverless function handler for Express app
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import passport from 'passport';
import { configurePassport } from '../apps/api/src/config/passport';
import { errorHandler } from '../apps/api/src/middleware/errorHandler';
import { notFoundHandler } from '../apps/api/src/middleware/notFoundHandler';

// Routes
import authRoutes from '../apps/api/src/routes/auth.routes';
import userRoutes from '../apps/api/src/routes/user.routes';
import facilityRoutes from '../apps/api/src/routes/facility.routes';
import fundingSourceRoutes from '../apps/api/src/routes/fundingSource.routes';
import projectRoutes from '../apps/api/src/routes/project.routes';
import budgetRoutes from '../apps/api/src/routes/budget.routes';
import budgetLineRoutes from '../apps/api/src/routes/budgetLine.routes';
import costEventRoutes from '../apps/api/src/routes/costEvent.routes';
import vendorRoutes from '../apps/api/src/routes/vendor.routes';
import commentRoutes from '../apps/api/src/routes/comment.routes';
import issueRoutes from '../apps/api/src/routes/issue.routes';
import reportRoutes from '../apps/api/src/routes/report.routes';
import auditRoutes from '../apps/api/src/routes/audit.routes';
import adminRoutes from '../apps/api/src/routes/admin.routes';

dotenv.config();

const app = express();

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
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/funding-sources', fundingSourceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api', budgetLineRoutes);
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

// Export for Vercel
export default app;
