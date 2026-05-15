import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema } from '../validations/authSchemas';
import { authApi } from '../utils/api';
import useAuthStore from '../stores/authStore';
import AuthLayout from '../components/auth/AuthLayout';

export default function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setUser(data.user);
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
    <AuthLayout title="Welcome back" subtitle="Sign in to your Financial Planner account">
      {/* Server Error */}
      {serverError && (
        <div className="auth-alert" role="alert">
          <i className="bi bi-exclamation-circle-fill" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Email */}
        <div className="auth-input-group" style={{ '--animation-delay': '0.15s', animationDelay: '0.15s' }}>
          <label htmlFor="login-email" className="auth-input-label">
            Email address
          </label>
          <div className="auth-input-wrapper">
            <i className="bi bi-envelope auth-input-icon" />
            <input
              id="login-email"
              type="email"
              className={`auth-input ${errors.email ? 'is-invalid' : ''}`}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              {...register('email')}
            />
          </div>
          {errors.email && (
            <div className="auth-input-error">
              <i className="bi bi-exclamation-circle" />
              <span>{errors.email.message}</span>
            </div>
          )}
        </div>

        {/* Password */}
        <div className="auth-input-group" style={{ '--animation-delay': '0.2s', animationDelay: '0.2s' }}>
          <label htmlFor="login-password" className="auth-input-label">
            Password
          </label>
          <div className="auth-input-wrapper">
            <i className="bi bi-lock auth-input-icon" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className={`auth-input auth-input--has-toggle ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Enter your password"
              autoComplete="current-password"
              {...register('password')}
            />
            <button
              type="button"
              className="auth-input-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
            </button>
          </div>
          {errors.password && (
            <div className="auth-input-error">
              <i className="bi bi-exclamation-circle" />
              <span>{errors.password.message}</span>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="auth-btn"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="auth-footer">
        Don&apos;t have an account?{' '}
        <Link to="/register">Create one</Link>
      </div>
    </AuthLayout>
  );
}
