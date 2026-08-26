import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Set test environment variables before importing app
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_unit_tests_12345';
process.env.FRONTEND_URL = 'https://startup-crm-lite-drab.vercel.app,http://localhost:3000';

import { app } from '../server.js';
import { protect } from '../middleware/auth.js';

describe('CORS, Preflight & Authentication Test Suite', () => {
  let server;
  let baseUrl;

  before(async () => {
    // Start test server on ephemeral port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  // ─── 1. Health Check ───────────────────────────────────────────────────────
  test('GET /api/health returns 200 OK and valid JSON', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'OK');
  });

  // ─── 2. CORS Production Origin ─────────────────────────────────────────────
  test('GET /api/health allows configured production Vercel origin', async () => {
    const origin = 'https://startup-crm-lite-drab.vercel.app';
    const res = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: origin },
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), origin);
    assert.equal(res.headers.get('access-control-allow-credentials'), 'true');
  });

  // ─── 3. CORS Localhost Origin ──────────────────────────────────────────────
  test('GET /api/health allows configured development origin', async () => {
    const origin = 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: origin },
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), origin);
  });

  // ─── 4. CORS Rejected Origin ───────────────────────────────────────────────
  test('GET /api/health does NOT set CORS headers for unauthorized origin', async () => {
    const origin = 'https://unauthorized-malicious-site.com';
    const res = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: origin },
    });
    // Origin is not allowed, so access-control-allow-origin must not be returned
    assert.equal(res.headers.get('access-control-allow-origin'), null);
    // Server must respond cleanly without throwing an unhandled 500
    assert.equal(res.status, 200);
  });

  // ─── 5. OPTIONS Preflight Request ──────────────────────────────────────────
  test('OPTIONS /api/auth/login responds with 200/204 and correct CORS preflight headers', async () => {
    const origin = 'https://startup-crm-lite-drab.vercel.app';
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
      },
    });

    assert.ok(res.status === 200 || res.status === 204);
    assert.equal(res.headers.get('access-control-allow-origin'), origin);
    assert.equal(res.headers.get('access-control-allow-credentials'), 'true');

    const allowMethods = res.headers.get('access-control-allow-methods') || '';
    assert.ok(allowMethods.includes('POST'), `Expected POST in ${allowMethods}`);

    const allowHeaders = res.headers.get('access-control-allow-headers') || '';
    assert.ok(
      allowHeaders.toLowerCase().includes('authorization') ||
      allowHeaders.toLowerCase().includes('content-type') ||
      allowHeaders.includes('*'),
      `Expected Authorization/Content-Type in ${allowHeaders}`
    );
  });

  // ─── 6. Public Login Validation (No Token Required) ────────────────────────
  test('POST /api/auth/login is public and returns 400 validation error when empty', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://startup-crm-lite-drab.vercel.app',
      },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(body.errors && body.errors.length > 0);
  });

  // ─── 7. Protected Endpoint Rejects Missing JWT ─────────────────────────────
  test('GET /api/leads returns 401 when Authorization header is missing', async () => {
    const res = await fetch(`${baseUrl}/api/leads`, {
      headers: {
        Origin: 'https://startup-crm-lite-drab.vercel.app',
      },
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.message, 'No token provided, access denied');
  });

  // ─── 8. Protected Endpoint Rejects Invalid JWT ─────────────────────────────
  test('GET /api/leads returns 401 when JWT token is invalid', async () => {
    const res = await fetch(`${baseUrl}/api/leads`, {
      headers: {
        Authorization: 'Bearer invalid.malformed.token',
        Origin: 'https://startup-crm-lite-drab.vercel.app',
      },
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.message, 'Token is invalid');
  });

  // ─── 9. Protected Endpoint Rejects Expired JWT ─────────────────────────────
  test('GET /api/leads returns 401 when JWT token is expired', async () => {
    // Generate an expired token
    const expiredToken = jwt.sign(
      { id: '507f1f77bcf86cd799439011' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' }
    );

    const res = await fetch(`${baseUrl}/api/leads`, {
      headers: {
        Authorization: `Bearer ${expiredToken}`,
        Origin: 'https://startup-crm-lite-drab.vercel.app',
      },
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.message, 'Token has expired, please login again');
  });

  // ─── 10. JWT Middleware Unit Verification (Success & User Attachment) ───────
  test('protect middleware accepts valid token and attaches user to req.user', async () => {
    const originalFindById = User.findById;
    try {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Admin',
        email: 'admin@startupcrm.com',
        role: 'Admin',
      };
      User.findById = () => ({
        select: () => Promise.resolve(mockUser),
      });

      const validToken = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET);
      const mockReq = {
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      };
      const mockRes = {};
      let nextCalled = false;
      const mockNext = (err) => {
        if (!err) nextCalled = true;
      };

      await protect(mockReq, mockRes, mockNext);

      assert.equal(nextCalled, true);
      assert.deepEqual(mockReq.user, mockUser);
    } finally {
      User.findById = originalFindById;
    }
  });

  // ─── 11. JWT Middleware User Not Found ──────────────────────────────────────
  test('protect middleware returns 401 when user no longer exists in DB', async () => {
    const originalFindById = User.findById;
    try {
      User.findById = () => ({
        select: () => Promise.resolve(null),
      });

      const validToken = jwt.sign({ id: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET);
      const mockReq = {
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      };
      let responseStatus = null;
      let responseJson = null;
      const mockRes = {
        status(code) {
          responseStatus = code;
          return {
            json(payload) {
              responseJson = payload;
            },
          };
        },
      };
      let nextCalled = false;
      const mockNext = () => { nextCalled = true; };

      await protect(mockReq, mockRes, mockNext);

      assert.equal(nextCalled, false);
      assert.equal(responseStatus, 401);
      assert.equal(responseJson.success, false);
      assert.equal(responseJson.message, 'User belonging to this token no longer exists');
    } finally {
      User.findById = originalFindById;
    }
  });
});
