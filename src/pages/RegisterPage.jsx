import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema } from '../validations/authSchemas';
import { authApi } from '../utils/api';
import useAuthStore from '../stores/authStore';
import AuthLayout from '../components/auth/AuthLayout';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';

export default function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  // Watch password field for strength meter
  const passwordValue = useWatch({ control, name: 'password' });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
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
    const { confirmPassword, ...payload } = data;
    registerMutation.mutate(payload);
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start planning your financial future">
      {/* Server Error */}
      {serverError && (
        <div className="auth-alert" role="alert">
          <i className="bi bi-exclamation-circle-fill" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Name */}
        <div className="auth-input-group" style={{ animationDelay: '0.1s' }}>
          <label htmlFor="register-name" className="auth-input-label">
            Full Name
          </label>
          <div className="auth-input-wrapper">
            <i className="bi bi-person auth-input-icon" />
            <input
              id="register-name"
              type="text"
              className={`auth-input ${errors.name ? 'is-invalid' : ''}`}
              placeholder="John Doe"
              autoComplete="name"
              autoFocus
              {...formRegister('name')}
            />
          </div>
          {errors.name && (
            <div className="auth-input-error">
              <i className="bi bi-exclamation-circle" />
              <span>{errors.name.message}</span>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="auth-input-group" style={{ animationDelay: '0.15s' }}>
          <label htmlFor="register-email" className="auth-input-label">
            Email address
          </label>
          <div className="auth-input-wrapper">
            <i className="bi bi-envelope auth-input-icon" />
            <input
              id="register-email"
              type="email"
              className={`auth-input ${errors.email ? 'is-invalid' : ''}`}
              placeholder="you@example.com"
              autoComplete="email"
              {...formRegister('email')}
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
        <div className="auth-input-group" style={{ animationDelay: '0.2s' }}>
          <label htmlFor="register-password" className="auth-input-label">
            Password
          </label>
          <div className="auth-input-wrapper">
            <i className="bi bi-lock auth-input-icon" />
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              className={`auth-input auth-input--has-toggle ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              autoComplete="new-password"
              {...formRegister('password')}
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
          <PasswordStrengthMeter password={passwordValue} />
        </div>

        {/* Confirm Password */}
        <div className="auth-input-group" style={{ animationDelay: '0.25s' }}>
          <label htmlFor="register-confirm" className="auth-input-label">
            Confirm Password
          </label>
          <div className="auth-input-wrapper">
            <i className="bi bi-shield-lock auth-input-icon" />
            <input
              id="register-confirm"
              type={showConfirm ? 'text' : 'password'}
              className={`auth-input auth-input--has-toggle ${errors.confirmPassword ? 'is-invalid' : ''}`}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              {...formRegister('confirmPassword')}
            />
            <button
              type="button"
              className="auth-input-toggle"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              <i className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'}`} />
            </button>
          </div>
          {errors.confirmPassword && (
            <div className="auth-input-error">
              <i className="bi bi-exclamation-circle" />
              <span>{errors.confirmPassword.message}</span>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="auth-btn"
          disabled={registerMutation.isPending}
          style={{ animationDelay: '0.3s' }}
        >
          {registerMutation.isPending ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="auth-footer">
        Already have an account?{' '}
        <Link to="/login">Sign in</Link>
      </div>
    </AuthLayout>
  );
}
