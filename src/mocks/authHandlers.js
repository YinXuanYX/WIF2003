// ============================================================
// Mock Auth API Handlers
// Simulates POST /api/auth/login, POST /api/auth/register,
// GET /api/auth/me, and POST /api/auth/logout.
//
// Uses a module-scoped `currentSession` variable to mimic
// the HttpOnly cookie. All response shapes match the real
// backend contract so Phase 2 requires only swapping the
// data source in hooks/mutations — zero component changes.
// ============================================================

import { mockUsers } from './users';

// Simulates the HttpOnly cookie (server-side session)
let currentSession = null;

/**
 * Strips passwordHash before returning user data to the client.
 * Mirrors what the real backend does before sending the response.
 */
function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────
export function mockLogin({ email, password }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        return reject({ status: 401, message: 'Invalid email or password' });
      }

      if (!user.isActive) {
        return reject({ status: 403, message: 'Account has been deactivated' });
      }

      // In mock mode, accept any non-empty password
      if (!password) {
        return reject({ status: 401, message: 'Invalid email or password' });
      }

      currentSession = user._id;
      resolve({ user: sanitizeUser(user) });
    }, 400); // simulate network latency
  });
}

// ─────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────
export function mockRegister({ name, email, password }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check if email already exists
      const exists = mockUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (exists) {
        return reject({ status: 400, message: 'Email already registered' });
      }

      // Create new user (in-memory only — lost on refresh)
      const newUser = {
        _id: `mock_${Date.now()}`,
        name,
        email: email.toLowerCase(),
        passwordHash: `hashed_${password}`,
        isActive: true,
        riskProfile: {
          profile: null,
          allocation: { bonds: 0, equities: 0, cash: 0 },
          score: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUsers.push(newUser);
      currentSession = newUser._id;
      resolve({ user: sanitizeUser(newUser) });
    }, 500); // simulate network latency
  });
}

// ─────────────────────────────────────────────────────────────
// GET /api/auth/me  (Session Rehydration)
// PRD §Module 1: Validates the HttpOnly cookie and checks
// isActive before returning user data. Returns 401 if no
// session or account is deactivated.
// ─────────────────────────────────────────────────────────────
export function mockGetMe() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!currentSession) {
        return reject({ status: 401, message: 'Not authenticated' });
      }

      const user = mockUsers.find((u) => u._id === currentSession);

      if (!user || !user.isActive) {
        currentSession = null;
        return reject({ status: 401, message: 'Session expired or account deactivated' });
      }

      resolve({ user: sanitizeUser(user) });
    }, 200); // simulate network latency
  });
}

// ─────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────────
export function mockLogout() {
  return new Promise((resolve) => {
    setTimeout(() => {
      currentSession = null;
      resolve({ message: 'Logged out successfully' });
    }, 150);
  });
}

// ─────────────────────────────────────────────────────────────
// PUT /api/auth/profile  (Update profile info)
// ─────────────────────────────────────────────────────────────
export function mockUpdateProfile({ name, email }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!currentSession) {
        return reject({ status: 401, message: 'Not authenticated' });
      }

      const user = mockUsers.find((u) => u._id === currentSession);
      if (!user) return reject({ status: 404, message: 'User not found' });

      // Check if new email conflicts with another user
      if (email && email.toLowerCase() !== user.email) {
        const conflict = mockUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u._id !== currentSession
        );
        if (conflict) {
          return reject({ status: 400, message: 'Email already in use' });
        }
      }

      if (name) user.name = name;
      if (email) user.email = email.toLowerCase();
      user.updatedAt = new Date().toISOString();

      resolve({ user: sanitizeUser(user) });
    }, 300);
  });
}

// ─────────────────────────────────────────────────────────────
// PUT /api/auth/password  (Change password)
// ─────────────────────────────────────────────────────────────
export function mockChangePassword({ currentPassword, newPassword }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!currentSession) {
        return reject({ status: 401, message: 'Not authenticated' });
      }

      // In mock mode, just accept any non-empty current password
      if (!currentPassword || !newPassword) {
        return reject({ status: 400, message: 'Both passwords are required' });
      }

      const user = mockUsers.find((u) => u._id === currentSession);
      if (!user) return reject({ status: 404, message: 'User not found' });

      user.passwordHash = `hashed_${newPassword}`;
      user.updatedAt = new Date().toISOString();

      resolve({ message: 'Password updated successfully' });
    }, 300);
  });
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/auth/deactivate  (Set isActive = false)
// PRD §Module 1: Temporary deactivation, does NOT delete data.
// ─────────────────────────────────────────────────────────────
export function mockDeactivateAccount() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!currentSession) {
        return reject({ status: 401, message: 'Not authenticated' });
      }

      const user = mockUsers.find((u) => u._id === currentSession);
      if (!user) return reject({ status: 404, message: 'User not found' });

      user.isActive = false;
      currentSession = null;

      resolve({ message: 'Account deactivated successfully' });
    }, 300);
  });
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/auth/account  (Permanent deletion + cascade)
// PRD §Module 1: Executes cascade delete of Goals & CashFlow.
// ─────────────────────────────────────────────────────────────
export function mockDeleteAccount() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!currentSession) {
        return reject({ status: 401, message: 'Not authenticated' });
      }

      const index = mockUsers.findIndex((u) => u._id === currentSession);
      if (index === -1) return reject({ status: 404, message: 'User not found' });

      // Simulate cascade delete (Goals.deleteMany + CashFlow.deleteOne)
      mockUsers.splice(index, 1);
      currentSession = null;

      resolve({ message: 'Account and all associated data permanently deleted' });
    }, 400);
  });
}
