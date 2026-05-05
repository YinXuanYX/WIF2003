// ============================================================
// RegisterPage — PRD §Module 1
// Uses react-hook-form + Zod for validation.
// Calls mockRegister via useMutation, auto-logs-in on success.
// Phase 2: swap mockRegister with fetch('/api/auth/register', ...).
// ============================================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema } from '../validations/authSchemas';
import { mockRegister } from '../mocks/authHandlers';
import useAuthStore from '../stores/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const [serverError, setServerError] = useState('');

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const registerMutation = useMutation({
    mutationFn: mockRegister, // Phase 2: replace with real fetch
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['auth', 'me'], data);
      navigate('/dashboard');
    },
    onError: (err) => {
      setServerError(err.message || 'Registration failed. Please try again.');
    },
  });

  const onSubmit = (data) => {
    setServerError('');
    // Don't send confirmPassword to the backend
    const { confirmPassword, ...payload } = data;
    registerMutation.mutate(payload);
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
          <h1 className="h4 fw-bold mb-1">Create your account</h1>
          <p className="text-muted small">Start planning your financial future</p>
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
              {/* Name */}
              <div className="mb-3">
                <label htmlFor="register-name" className="form-label small fw-semibold">
                  Full Name
                </label>
                <input
                  id="register-name"
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="John Doe"
                  autoComplete="name"
                  {...formRegister('name')}
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name.message}</div>
                )}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label htmlFor="register-email" className="form-label small fw-semibold">
                  Email address
                </label>
                <input
                  id="register-email"
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...formRegister('email')}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email.message}</div>
                )}
              </div>

              {/* Password */}
              <div className="mb-3">
                <label htmlFor="register-password" className="form-label small fw-semibold">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  autoComplete="new-password"
                  {...formRegister('password')}
                />
                {errors.password && (
                  <div className="invalid-feedback">{errors.password.message}</div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label htmlFor="register-confirm" className="form-label small fw-semibold">
                  Confirm Password
                </label>
                <input
                  id="register-confirm"
                  type="password"
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  {...formRegister('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback">{errors.confirmPassword.message}</div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary w-100 fw-semibold"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Login link */}
        <p className="text-center text-muted small mt-3">
          Already have an account?{' '}
          <Link to="/login" className="fw-semibold text-decoration-none">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
