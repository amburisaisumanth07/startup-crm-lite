/**
 * @fileoverview authService.js — Authentication API calls for the CRM.
 *
 * All functions use the shared `api` Axios instance (which automatically
 * attaches the JWT Bearer token and handles 401/network errors globally).
 *
 * Functions return `response.data` directly so callers receive the unwrapped
 * payload rather than the raw Axios response envelope.
 *
 * Expected backend routes:
 *   POST   /api/auth/register  → { token, user }
 *   POST   /api/auth/login     → { token, user }
 *   GET    /api/auth/me        → { user }
 *   PUT    /api/auth/me        → { user }
 */

import api from './api';

/** localStorage key used to persist the JWT. Must match api.js and AuthContext. */
const TOKEN_KEY = 'crm-token';

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Registers a new user account.
 *
 * On success the backend returns a JWT and the newly-created user object.
 * AuthContext is responsible for storing the token; this function just
 * delivers the raw server response.
 *
 * @param {string} name     - The user's display name
 * @param {string} email    - The user's email address (used as login credential)
 * @param {string} password - Plain-text password (hashed server-side)
 * @returns {Promise<{ token: string, user: object }>}
 *
 * @throws Will throw if the API returns an error (e.g. 400 email already taken).
 */
export async function register(name, email, password) {
  const response = await api.post('/api/auth/register', { name, email, password });
  return response.data;
}

/**
 * Authenticates an existing user with email + password credentials.
 *
 * On success the backend returns a JWT and the user profile object.
 * AuthContext calls this function and then stores the returned token.
 *
 * @param {string} email    - The user's registered email address
 * @param {string} password - The user's plain-text password
 * @returns {Promise<{ token: string, user: object }>}
 *
 * @throws Will throw if the API returns 401 (wrong credentials) or 400.
 */
export async function login(email, password) {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
}

/**
 * Logs the user out by removing the JWT from localStorage.
 *
 * The Express backend is stateless (JWT-based), so there is no server-side
 * session to invalidate — simply discarding the token client-side is sufficient.
 *
 * @returns {void}
 */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Fetches the currently authenticated user's profile.
 *
 * Used by AuthContext on mount to restore the user session when the page
 * is refreshed (the token is still in localStorage but React state is lost).
 *
 * @returns {Promise<{ user: object }>}
 *
 * @throws Will throw if the token is invalid (the api.js interceptor will
 *   redirect to /login automatically in that case).
 */
export async function getProfile() {
  const response = await api.get('/api/auth/me');
  return response.data;
}

/**
 * Updates the currently authenticated user's profile data.
 *
 * @param {{ name?: string, email?: string, password?: string }} data
 *   - Partial profile object. Only send fields you want to update.
 * @returns {Promise<{ user: object }>}
 *
 * @throws Will throw if validation fails or the user is not authenticated.
 */
export async function updateProfile(data) {
  const response = await api.put('/api/auth/me', data);
  return response.data;
}

