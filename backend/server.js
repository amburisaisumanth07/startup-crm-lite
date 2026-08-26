import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';

// Load environment variables before anything else
dotenv.config();

// Determine if this file is being executed directly (e.g. `node server.js`) or imported in tests
const isMainModule = process.argv[1] && (
  fileURLToPath(import.meta.url) === process.argv[1] ||
  process.argv[1].endsWith('server.js')
);

// ----------------------------------------------------
// Process-Level Safety Net (must be first)
// ----------------------------------------------------
/**
 * Catch any unhandled promise rejection that slips through try/catch blocks.
 * In production on Render, an unhandled rejection crashes the container and
 * triggers a restart with diagnostic logs.
 */
if (isMainModule) {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED PROMISE REJECTION — shutting down.', { reason, promise });
    process.exit(1);
  });

  /**
   * Catch synchronous exceptions thrown outside of any error boundary.
   * These are almost always programming bugs; log them clearly and exit.
   */
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION — shutting down.', err);
    process.exit(1);
  });
}

/**
 * 4. Environment validation on startup:
 * Validate that all required environment variables are present on startup.
 * Exits the process with status code 1 if any required variables are missing.
 */
function checkRequiredEnvVars() {
  // PORT is intentionally excluded: Render injects it automatically.
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

// Run environment validation before database connection when executed directly
if (isMainModule) {
  checkRequiredEnvVars();
}

// Import Database Connection
import { connectDB } from './config/database.js';

// Import Middleware
import { errorHandler } from './middleware/errorHandler.js';

// Import our Express 5-compatible inline MongoDB sanitizer.
// NOTE: express-mongo-sanitize@2.2.0 accesses the internal `req._body` property
// that was removed in Express 5, causing it to silently do nothing. Our custom
// middleware replicates the same sanitization without any Express internals.
import { mongoSanitize } from './middleware/mongoSanitize.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';

// ----------------------------------------------------
// Express App Initialization
// ----------------------------------------------------
const app = express();

// ----------------------------------------------------
// Trust Proxy — REQUIRED for Render
// ----------------------------------------------------
/**
 * Render (and most cloud platforms) sit behind a load balancer / reverse proxy.
 * Without this setting:
 *   - express-rate-limit sees the same proxy IP for every client, applying
 *     the rate limit to ALL users simultaneously instead of per-client.
 *   - req.ip returns the proxy's IP, not the real client IP.
 *
 * '1' means trust the first proxy in the X-Forwarded-For chain (Render's LB).
 */
app.set('trust proxy', 1);

// ----------------------------------------------------
// Database Initialization
// ----------------------------------------------------
// Connect after app is initialized so event emitters are ready.
if (isMainModule) {
  connectDB();
}

// ----------------------------------------------------
// Middleware Setup
// ----------------------------------------------------

// helmet: sets various security HTTP headers with crossOriginResourcePolicy configured for cross-origin API access
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

/**
 * 6. Request logging:
 * Production: 'short' format — avoids logging full query strings which may
 *   contain PII (e.g. ?search=john@company.com) in Render's log stream.
 * Development: 'dev' format — concise, colorized output for local debugging.
 */
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('short'));
} else if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

/**
 * 3. CORS — Production-ready configuration:
 *
 * Allowed origins are resolved dynamically from environment variables.
 * In development, all localhost and 127.0.0.1 origins on any port are permitted.
 * In production, origins listed in FRONTEND_URL are accepted.
 * Requests with no Origin header (Postman, curl, server-to-server, mobile apps) are always allowed.
 *
 * Required env var on Render:
 *   FRONTEND_URL — your deployed Vercel frontend URL (e.g. https://startup-crm-lite-drab.vercel.app)
 */
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Parse allowed origins from FRONTEND_URL (supports comma-separated list, trims whitespace, strips trailing slashes)
const getAllowedOrigins = () => {
  if (!process.env.FRONTEND_URL) return [];
  return process.env.FRONTEND_URL
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''))
    .filter(Boolean);
};

// Regex to match any localhost / 127.0.0.1 origin regardless of port (development only)
const LOCALHOST_ORIGIN_RE = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, server-to-server, mobile apps, health checks)
    if (!origin) return callback(null, true);

    // In development: allow all localhost and 127.0.0.1 origins
    if (!IS_PRODUCTION && LOCALHOST_ORIGIN_RE.test(origin)) {
      return callback(null, true);
    }

    // In production or when FRONTEND_URL is defined: check allowed origins list
    const allowed = getAllowedOrigins();
    if (allowed.includes(origin.replace(/\/+$/, ''))) {
      return callback(null, true);
    }

    // Disallow origin gracefully without throwing an unhandled Error (which triggers 500 error handler)
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply CORS middleware
app.use(cors(corsOptions));

/**
 * 1. Rate Limiting:
 * General rate limit: 100 requests per 15 minutes per IP.
 * Auth rate limit (stricter): 10 requests per 15 minutes for /api/auth routes.
 *
 * FIX: message must be a JSON object, not a plain string.
 *   express-rate-limit calls res.send(message). In Express 5, sending a plain
 *   string sets Content-Type to text/html. The Vite frontend expects
 *   application/json and throws a JSON parse error on the plain string.
 *
 * FIX: standardHeaders: 'draft-8' is the current IETF standard (RateLimit-*).
 *   legacyHeaders: false drops the deprecated X-RateLimit-* headers.
 */
const rateLimitDefaults = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  standardHeaders: 'draft-8',
  legacyHeaders: false,
};

const generalLimiter = rateLimit({
  ...rateLimitDefaults,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  ...rateLimitDefaults,
  max: 10,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

if (process.env.NODE_ENV !== 'test') {
  app.use('/api/', generalLimiter);
  app.use('/api/auth/', authLimiter);
}

// express.json: parses incoming JSON payloads with a payload limit (10kb) to prevent DoS
app.use(express.json({ limit: '10kb' }));

// express.urlencoded: parses incoming URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

/**
 * 2. MongoDB Injection Protection:
 * Sanitizes req.body, req.query, and req.params to prevent Operator Injection attacks.
 * Uses our custom Express 5-compatible implementation (see middleware/mongoSanitize.js).
 */
app.use(mongoSanitize());

// ----------------------------------------------------
// Route Registration
// ----------------------------------------------------

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// ----------------------------------------------------
// 404 Catch-All Route
// ----------------------------------------------------
/**
 * Must be registered AFTER all valid routes and BEFORE the error handler.
 * Without this, Express 5 returns its default HTML "Cannot GET /path" response,
 * which the Vite frontend's JSON.parse will throw on.
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ----------------------------------------------------
// Global Error Handler (must be last middleware)
// ----------------------------------------------------
app.use(errorHandler);

// ----------------------------------------------------
// Server Startup and Graceful Shutdown
// ----------------------------------------------------
import mongoose from 'mongoose';

const PORT = process.env.PORT || 5000;
const MODE = process.env.NODE_ENV || 'development';

let server = null;

if (isMainModule) {
  server = app.listen(PORT, () => {
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

    setTimeout(() => {
      console.error('Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000).unref();
  };

  // Listen for termination signals from OS/orchestrator
  process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
}

export { app, server };
export default app;
