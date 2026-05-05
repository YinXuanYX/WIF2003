// ============================================================
// LoginPage — PRD §Module 1
// Uses react-hook-form + Zod for validation.
// Calls mockLogin via useMutation, syncs result to Zustand.
// Phase 2: swap mockLogin with fetch('/api/auth/login', ...).
// ============================================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema } from '../validations/authSchemas';
import { mockLogin } from '../mocks/authHandlers';
import useAuthStore from '../stores/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const loginMutation = useMutation({
    mutationFn: mockLogin, // Phase 2: replace with real fetch
    onSuccess: (data) => {
      setUser(data.user);
      // Populate the auth/me query cache so rehydration doesn't re-fetch
      queryClient.setQueryData(['auth', 'me'], data);
      navigate('/dashboard');
    },
    onError: (err) => {
      setServerError(err.message || 'Login failed. Please try again.');
    },
  });

  const onSubmit = (data) => {
    setServerError('');
    loginMutation.mutate(data);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
         style={{ background: 'var(--bs-body-bg)' }}>
      <div className="w-100" style={{ maxWidth: '420px', padding: '0 1rem' }}>

        {/* Brand */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
               style={{
                 width: '48px', height: '48px',
                 background: 'linear-gradient(135deg, var(--bs-primary), #60a5fa)',
               }}>
            <span style={{ fontSize: '1.5rem' }}>💰</span>
          </div>
          <h1 className="h4 fw-bold mb-1">Welcome back</h1>
          <p className="text-muted small">Sign in to your Financial Planner account</p>
        </div>

        {/* Card */}
        <div className="card glass-card border-0 shadow-sm">
          <div className="card-body p-4">

            {/* Server Error Alert */}
            {serverError && (
              <div className="alert alert-danger d-flex align-items-center py-2 px-3 mb-3" role="alert">
                <span className="me-2">⚠️</span>
                <small>{serverError}</small>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Email */}
              <div className="mb-3">
                <label htmlFor="login-email" className="form-label small fw-semibold">
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email.message}</div>
                )}
              </div>

              {/* Password */}
              <div className="mb-4">
                <label htmlFor="login-password" className="form-label small fw-semibold">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register('password')}
                />
                {errors.password && (
                  <div className="invalid-feedback">{errors.password.message}</div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary w-100 fw-semibold"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Register link */}
        <p className="text-center text-muted small mt-3">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="fw-semibold text-decoration-none">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
