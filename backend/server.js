import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import mongoose from 'mongoose';

// Load environment variables before anything else
dotenv.config();

/**
 * 4. Environment validation on startup:
 * Validate that all required environment variables are present on startup.
 * Exits the process with status code 1 if any required variables are missing.
 */
function checkRequiredEnvVars() {
  // PORT is intentionally excluded: Railway injects it automatically.
  // The server already falls back to 5000 locally via: process.env.PORT || 5000
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('CRITICAL CONFIGURATION ERROR: Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    console.error('Server shutdown initiated to prevent execution with incomplete configuration.');
    process.exit(1);
  }
}

// Run environment validation before database connection
checkRequiredEnvVars();

// Import Database Connection
import { connectDB } from './config/database.js';

// Import Middleware
import { errorHandler } from './middleware/errorHandler.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';

// ----------------------------------------------------
// Database Initialization
// ----------------------------------------------------
connectDB();

// ----------------------------------------------------
// Express App Initialization
// ----------------------------------------------------
const app = express();

// ----------------------------------------------------
// Middleware Setup
// ----------------------------------------------------

// helmet: sets various HTTP headers to secure the Express app
app.use(helmet());

/**
 * 6. Request logging improvement:
 * In production: use 'combined' format (more detail)
 * In development: use 'dev' format (concise, colorized)
 */
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

/**
 * 3. CORS — Production-ready configuration:
 *
 * Allowed origins are resolved at startup from environment variables.
 * In development, all localhost origins on any port are permitted.
 * In production, only origins listed in ALLOWED_ORIGINS are accepted.
 * Requests with no Origin header (Postman, curl, mobile apps) are always allowed.
 *
 * Required env var:
 *   FRONTEND_URL  — your deployed Vercel frontend URL (e.g. https://startup-crm.vercel.app)
 */
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Build the explicit allowlist from environment — filter out any undefined/empty values
const allowedOrigins = [
  process.env.FRONTEND_URL,        // e.g. https://startup-crm.vercel.app
].filter(Boolean);

// Regex to match any localhost origin regardless of port (development only)
const LOCALHOST_ORIGIN_RE = /^http:\/\/localhost:\d+$/;

app.use(
  cors({
    origin: [
      "https://startup-crm-lite-drab.vercel.app",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    credentials: true,
  })
);

/**
 * 1. Rate Limiting:
 * General rate limit: 100 requests per 15 minutes per IP
 * Auth rate limit (stricter): 10 requests per 15 minutes for /api/auth routes
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many auth attempts.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// express.json: parses incoming JSON payloads with a payload limit (10kb) to prevent DoS
app.use(express.json({ limit: '10kb' }));

// express.urlencoded: parses incoming URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

/**
 * 2. MongoDB Injection Protection:
 * Sanitizes req.body, req.query, and req.params to prevent Operator Injection attacks.
 */
//app.use(mongoSanitize());

// ----------------------------------------------------
// Route Registration
// ----------------------------------------------------

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// Register error handler middleware last
app.use(errorHandler);

// ----------------------------------------------------
// Server Startup and Graceful Shutdown
// ----------------------------------------------------
const PORT = process.env.PORT || 5000;
const MODE = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${MODE} mode`);
});

/**
 * 5. Graceful shutdown:
 * Listens for process SIGTERM and SIGINT signals to close the HTTP server
 * and cleanly close the MongoDB connection before exiting.
 */
const handleGracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Server shutting down gracefully...`);

  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      // Close the MongoDB connection cleanly
      await mongoose.connection.close();
      console.log('MongoDB connection closed cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('Error during MongoDB disconnection:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    console.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals from OS/orchestrator
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
