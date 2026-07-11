/**
 * @fileoverview api.js — Centralised Axios instance for all CRM API calls.
 *
 * This module creates a single, pre-configured axios instance that:
 *  1. Targets the backend base URL read from the Vite environment variable.
 *  2. Automatically injects the JWT Bearer token on every outbound request.
 *  3. Handles 401 Unauthorized responses globally by clearing state + redirecting.
 *  4. Catches network errors and shows a user-friendly toast notification.
 *
 * Usage:
 *   import api from './services/api';
 *   const { data } = await api.get('/api/leads');
 */

import axios from 'axios';
import toast from 'react-hot-toast';

// ─── Constants ───────────────────────────────────────────────────────────────

/** localStorage key used to store the JWT token throughout the app. */
const TOKEN_KEY = 'crm-token';

// ─── Axios Instance ──────────────────────────────────────────────────────────

/**
 * The configured Axios instance.
 *
 * baseURL strategy:
 *  - Development: empty string → relative URLs like `/api/leads` are
 *    intercepted by the Vite dev-server proxy and forwarded to
 *    `http://localhost:5000`. No CORS, no port confusion.
 *  - Production: `VITE_API_URL` env var (e.g. https://api.yourapp.com).
 *
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  // 10-second timeout to prevent requests hanging indefinitely
  timeout: 10000,
});


// ─── Request Interceptor ─────────────────────────────────────────────────────

/**
 * Intercepts every outbound request and attaches the JWT token from
 * localStorage as a Bearer Authorization header when present.
 *
 * This means you never have to manually pass the token in individual service
 * calls — the interceptor handles it transparently for every request.
 */
api.interceptors.request.use(
  (config) => {
    // Read the stored token from localStorage on every request so that
    // the interceptor always uses the most current token value (important
    // after login/logout transitions).
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = 'Bearer ' + token;
    }

    return config;
  },
  (error) => {
    // Propagate request configuration errors (rare, but handle defensively)
    return Promise.reject(error);
  }
);

// ─── Response Interceptor ────────────────────────────────────────────────────

/**
 * Intercepts every response to handle two global error scenarios:
 *
 * 1. **401 Unauthorized** — The token is missing, expired, or invalid.
 *    Action: Clear the stored token and redirect the user to /login so they
 *    can re-authenticate. This prevents the app from getting stuck in a
 *    broken authenticated state.
 *
 * 2. **Network error (no response)** — The backend is unreachable (server
 *    down, DNS failure, CORS block before response, etc.).
 *    Action: Show a persistent toast so the user knows the problem is
 *    connectivity, not the app itself.
 */
api.interceptors.response.use(
  // Pass successful responses straight through — no transformation needed.
  (response) => response,

  (error) => {
    if (error.response) {
      // ── Server responded with an error status code ────────────────────────
      const { status } = error.response;

      if (status === 401) {
        // Token is invalid or expired — clear it and force re-login.
        // We avoid using the AuthContext here to prevent circular imports;
        // direct localStorage manipulation is intentional.
        localStorage.removeItem(TOKEN_KEY);

        // Only redirect if we're not already on the login page to prevent
        // an infinite redirect loop.
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      // All other error statuses (400, 403, 404, 422, 500, etc.) are
      // propagated to the calling service so it can handle them contextually.
    } else if (error.request) {
      // ── Request was made but no response received ─────────────────────────
      // This covers: server down, network offline, DNS failure, CORS preflight fail.
      toast.error('Cannot connect to server. Check your connection.', {
        id: 'network-error', // Deduplicate: only one network-error toast at a time
        duration: 5000,
      });
    }

    // Always propagate the error so individual service calls can still
    // catch and handle it (e.g., show field-level validation errors).
    return Promise.reject(error);
  }
);

export default api;
