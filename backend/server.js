const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paystackRoutes = require('./routes/paystackRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');

dotenv.config();

// Initialize DB connection
connectDB();

const app = express();

// Security Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 300, // limit each IP to 300 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

// Body Parsers & Data Sanitization
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(xss());

// Primary Health & Anti-Sleep Ping Routes
app.get('/', (req, res) => {
  res.json({
    name: 'J&J Vintage Enterprise API',
    status: 'Operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'J&J Vintage Backend Server is Active', timestamp: new Date().toISOString() });
});
app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/paystack', paystackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[J&J Vintage Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);

  // Self-Ping Heartbeat every 10 minutes to keep Render backend awake 24/7
  setInterval(async () => {
    try {
      const axios = require('axios');
      await axios.get('https://jj-vintage-backend.onrender.com/api/ping');
      console.log('[Heartbeat] Self-ping active to prevent Render sleep.');
    } catch (e) {}
  }, 10 * 60 * 1000);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const ALT_PORT = Number(PORT) + 1;
    console.warn(`[Port ${PORT} in use] Switching to fallback port ${ALT_PORT}...`);
    app.listen(ALT_PORT, () => {
      console.log(`[J&J Vintage Server] Running on fallback port ${ALT_PORT}`);
    });
  }
});

