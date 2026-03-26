const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { config } = require('@/config/environment');
const { errorHandler } = require('@/middleware/errorHandler');
const authRoutes = require('@/routes/auth');
const materialRoutes = require('@/routes/materials');
const productionRoutes = require('@/routes/production');
const inventoryRoutes = require('@/routes/inventory');
const utilityRoutes = require('@/routes/utilities');
const employeeRoutes = require('@/routes/employees');
const salesRoutes = require('@/routes/sales');
const purchaseRoutes = require('@/routes/purchases');
const financialRoutes = require('@/routes/financial');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.nodeEnv === 'production' ? 300 : 10000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  })
);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/utilities', utilityRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/financial', financialRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
