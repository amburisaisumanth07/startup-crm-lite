/**
 * @fileoverview AuthContext.jsx — Global authentication state management.
 *
 * Provides the authenticated user object, token, and loading state to the
 * entire component tree via React Context + a custom `useAuth` hook.
 *
 * Session Persistence Strategy:
 *  - On every page mount, checks localStorage for an existing 'crm-token'.
 *  - If a token is found, calls `getProfile()` to re-hydrate the user object
 *    from the server (validates that the token is still valid).
 *  - If the profile call fails (e.g. expired token), the interceptor in api.js
 *    clears localStorage and redirects to /login.
 *
 * Usage:
 *   // Wrap your app (inside main.jsx or App.jsx):
 *   <AuthProvider><App /></AuthProvider>
 *
 *   // Consume in any component:
 *   const { user, login, logout, isLoading } = useAuth();
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import * as authService from '../services/authService';

/** localStorage key — must match api.js and authService.js */
const TOKEN_KEY = 'crm-token';

// ─── Context Definition ───────────────────────────────────────────────────────

/**
 * @typedef {Object} AuthContextValue
 * @property {object|null}  user      - Authenticated user object, or null when logged out
 * @property {string|null}  token     - JWT string, or null when not authenticated
 * @property {boolean}      isLoading - True while the initial session restore is in progress
 * @property {Function}     login     - (email, password) => Promise<void>
 * @property {Function}     register  - (name, email, password) => Promise<void>
 * @property {Function}     logout    - () => void
 */

/** @type {React.Context<AuthContextValue|undefined>} */
const AuthContext = createContext(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * AuthProvider wraps the application and supplies authentication state.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {React.JSX.Element}
 */
export function AuthProvider({ children }) {
  /** @type {[object|null, Function]} */
  const [user, setUser] = useState(null);

  /** @type {[string|null, Function]} */
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  /**
   * True while restoring a previously-saved session on initial mount.
   * Keeps the app from briefly flashing the login page before the profile
   * check has resolved.
   * @type {[boolean, Function]}
   */
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // ─── Session Restore on Mount ──────────────────────────────────────────────

  /**
   * On first render, check if there is a stored token and, if so,
   * re-hydrate the user profile from the server.
   *
   * This handles the "refresh the page while logged in" scenario — React
   * state is lost on refresh, but the token persists in localStorage.
   */
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (!storedToken) {
      // No token stored — user is definitely not authenticated.
      setIsLoading(false);
      return;
    }

    // Token exists — verify it's still valid by fetching the profile.
    // The api.js interceptor will handle a 401 (expired/invalid token)
    // by clearing localStorage and redirecting to /login automatically.
    authService
      .getProfile()
      .then((data) => {
        // data may be { user: {...} } or the user object directly,
        // depending on backend response shape. Support both patterns.
        setUser(data.user ?? data);
        setToken(storedToken);
      })
      .catch((error) => {
        // Profile fetch failed. Only clear localStorage if it's a 401/403 auth error.
        // For network errors or 500s, preserve the token so the user session isn't wiped.
        const isAuthError = error.response && (error.response.status === 401 || error.response.status === 403);
        if (isAuthError) {
          setUser(null);
          setToken(null);
          localStorage.removeItem(TOKEN_KEY);
        } else {
          setUser(null);
          // Keep the token and stored token intact so it doesn't log the user out
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Empty deps: run once on mount only.

  // ─── Auth Actions ──────────────────────────────────────────────────────────

  /**
   * Authenticates a user with email + password.
   *
   * On success:
   *  - Persists the JWT to localStorage.
   *  - Saves the token and user object to React state.
   *  - Navigates to the dashboard.
   *
   * On failure:
   *  - Re-throws the error so the Login page can display the error message.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<void>}
   * @throws {Error} When credentials are invalid or the server returns an error
   */
  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);

    // Persist token to localStorage first so the request interceptor can
    // attach it immediately if any subsequent requests fire synchronously.
    localStorage.setItem(TOKEN_KEY, data.token);

    // Update React state
    setToken(data.token);
    setUser(data.user);

    toast.success(`Welcome back, ${data.user?.name || 'there'}! 👋`);
    navigate('/');
  }, [navigate]);

  /**
   * Registers a new user account.
   *
   * On success behaves identically to `login` — saves the token and navigates
   * to the dashboard so the user can start using the CRM immediately.
   *
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @returns {Promise<void>}
   * @throws {Error} When registration fails (e.g. email already taken)
   */
  const register = useCallback(async (name, email, password) => {
    const data = await authService.register(name, email, password);

    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);

    toast.success(`Account created! Welcome, ${data.user?.name || 'there'}! 🎉`);
    navigate('/');
  }, [navigate]);

  /**
   * Logs the current user out.
   *
   * Clears the token from localStorage (server is stateless — no server call
   * needed), resets React state, and navigates to the login page.
   *
   * @returns {void}
   */
  const logout = useCallback(() => {
    authService.logout(); // Removes token from localStorage
    setUser(null);
    setToken(null);
    toast.success('You have been signed out.');
    navigate('/login');
  }, [navigate]);

  // ─── Context Value ─────────────────────────────────────────────────────────

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Custom Hook ──────────────────────────────────────────────────────────────

/**
 * Custom hook to consume the AuthContext.
 *
 * Must be called inside a component tree wrapped by `<AuthProvider>`.
 * Throws a descriptive error when called outside the provider boundary.
 *
 * @returns {AuthContextValue}
 * @throws {Error} When called outside of an `<AuthProvider>` component tree
 *
 * @example
 * function Header() {
 *   const { user, logout } = useAuth();
 *   return <button onClick={logout}>Sign out {user.name}</button>;
 * }
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      '[useAuth] This hook must be called inside an <AuthProvider>. ' +
      'Wrap your application with <AuthProvider> to fix this error.'
    );
  }
  return context;
}

export { AuthContext };
