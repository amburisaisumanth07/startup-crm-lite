import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

// Load environment variables before anything else
dotenv.config();

// ----------------------------------------------------
// Process-Level Safety Net (must be first)
// ----------------------------------------------------
/**
 * Catch any unhandled promise rejection that slips through try/catch blocks.
 * In production on Railway, an unhandled rejection crashes the container and
 * triggers a silent restart loop with no diagnostic log.
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED PROMISE REJECTION — shutting down.', { reason, promise });
  // Exit so Railway restarts the container (which is the correct behavior)
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
// Trust Proxy — REQUIRED for Railway
// ----------------------------------------------------
/**
 * Railway (and most cloud platforms) sit behind a load balancer / reverse proxy.
 * Without this setting:
 *   - express-rate-limit sees the same proxy IP for every client, applying
 *     the rate limit to ALL users simultaneously instead of per-client.
 *   - req.ip returns the proxy's IP, not the real client IP.
 *
 * '1' means trust the first proxy in the X-Forwarded-For chain (Railway's LB).
 */
app.set('trust proxy', 1);

// ----------------------------------------------------
// Database Initialization
// ----------------------------------------------------
// Connect after app is initialized so event emitters are ready.
connectDB();

// ----------------------------------------------------
// Middleware Setup
// ----------------------------------------------------

// helmet: sets various security HTTP headers
app.use(helmet());

/**
 * 6. Request logging:
 * Production: 'short' format — avoids logging full query strings which may
 *   contain PII (e.g. ?search=john@company.com) in Railway's log stream.
 * Development: 'dev' format — concise, colorized output for local debugging.
 */
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('short'));
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
 *
 * IMPORTANT: Trailing slashes are stripped from FRONTEND_URL because browser
 *   Origin headers never include a trailing slash. Without stripping, the
 *   allowedOrigins.includes(origin) check would always fail in production.
 */
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Strip any trailing slash from FRONTEND_URL before adding to allowlist.
// Browser Origin headers: "https://startup-crm.vercel.app" (no trailing slash).
const allowedOrigins = [
  process.env.FRONTEND_URL?.replace(/\/$/, ''), // Strip trailing slash
].filter(Boolean);

// Regex to match any localhost origin regardless of port (development only)
const LOCALHOST_ORIGIN_RE = /^http:\/\/localhost:\d+$/;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, server-to-server, mobile apps)
      if (!origin) return callback(null, true);

      // In development: allow all localhost origins
      if (!IS_PRODUCTION && LOCALHOST_ORIGIN_RE.test(origin)) {
        return callback(null, true);
      }

      // In production: only allow explicitly configured origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Reject all other origins
      return callback(new Error(`CORS: origin '${origin}' is not allowed`));
    },
    credentials: true,
  })
);

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

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

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
const PORT = process.env.PORT || 5000;
const MODE = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${MODE} mode`);
});

/**
 * 5. Graceful shutdown:
 * Listens for process SIGTERM and SIGINT signals to close the HTTP server
 * and cleanly close the MongoDB connection before exiting.
 *
 * FIX: The force-shutdown setTimeout is now .unref()-ed.
 *   Without .unref(), the timer holds the Node.js event loop open for 10 seconds
 *   after server.close() finishes. Railway sees the process is still alive and
 *   eventually sends SIGKILL, logging a deployment error. With .unref(), the
 *   timer doesn't block exit — it only fires if the process is still running
 *   when 10 seconds elapse (i.e., graceful shutdown hung).
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

  // Force shutdown after 10 seconds if graceful shutdown hangs.
  // .unref() prevents this timer from keeping the event loop alive
  // if the server has already shut down cleanly.
  setTimeout(() => {
    console.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000).unref();
};

// Listen for termination signals from OS/orchestrator
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
