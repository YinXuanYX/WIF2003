// ProfilePage
// Glass-style cards with reusable form components.
// Displays user info, change password, and account management.

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { changePasswordSchema, updateProfileSchema } from '../validations/authSchemas';
import {
  mockUpdateProfile,
  mockChangePassword,
  mockDeactivateAccount,
  mockDeleteAccount,
  mockLogout,
} from '../mocks/authHandlers';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // 
  const profileForm = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  });

  const updateProfileMutation = useMutation({
    mutationFn: mockUpdateProfile,
    onSuccess: (data) => {
      setUser(data.user);
      setProfileMsg('Profile updated successfully');
      setProfileError('');
    },
    onError: (err) => {
      setProfileError(err.message || 'Update failed');
      setProfileMsg('');
    },
  });

  // 
  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  const newPasswordValue = useWatch({ control: passwordForm.control, name: 'newPassword' });

  const changePasswordMutation = useMutation({
    mutationFn: mockChangePassword,
    onSuccess: () => {
      setPasswordMsg('Password changed successfully');
      setPasswordError('');
      passwordForm.reset();
    },
    onError: (err) => {
      setPasswordError(err.message || 'Password change failed');
      setPasswordMsg('');
    },
  });

  // 
  const deactivateMutation = useMutation({
    mutationFn: mockDeactivateAccount,
    onSuccess: async () => {
      await mockLogout();
      clearUser();
      navigate('/login');
    },
  });

  // 
  const deleteMutation = useMutation({
    mutationFn: mockDeleteAccount,
    onSuccess: () => {
      clearUser();
      navigate('/login');
    },
  });

  if (!user) return null;

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="container-fluid" style={{ maxWidth: '720px' }}>
      {/* Page Header */}
      <div className="mb-4 animate-fade-in-up">
        <h1 className="h4 fw-bold mb-1">Profile Settings</h1>
        <p className="text-muted small mb-0">Manage your account information and security</p>
      </div>

      {/*  */}
      <div className="glass-card mb-4 animate-fade-in-up" style={{ '--animation-order': 0 }}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center mb-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                 style={{
                   width: '56px', height: '56px', fontSize: '1.375rem', fontWeight: 600,
                   background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                   color: '#fff',
                 }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h5 className="fw-bold mb-0">{user.name}</h5>
              <small className="text-muted">{user.email}</small>
            </div>
          </div>
          <div className="d-flex gap-3 small text-muted flex-wrap">
            <span className="d-flex align-items-center gap-1">
              <i className="bi bi-calendar3" />
              Member since {memberSince}
            </span>
            <span className={`badge rounded-pill ${user.isActive ? 'bg-success' : 'bg-danger'} bg-opacity-10 ${user.isActive ? 'text-success' : 'text-danger'}`}>
              {user.isActive ? '● Active' : '● Deactivated'}
            </span>
          </div>
        </div>
      </div>

      {/*  */}
      <div className="glass-card mb-4 animate-fade-in-up" style={{ '--animation-order': 1 }}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="rounded-3 d-flex align-items-center justify-content-center"
                 style={{ width: '32px', height: '32px', background: 'rgba(59, 130, 246, 0.1)' }}>
              <i className="bi bi-pencil-square text-primary" style={{ fontSize: '0.875rem' }} />
            </div>
            <h6 className="fw-bold mb-0">Update Profile</h6>
          </div>

          {profileMsg && (
            <div className="d-flex align-items-center gap-2 p-3 rounded-3 mb-3" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '0.875rem' }} />
              <small className="text-success">{profileMsg}</small>
            </div>
          )}
          {profileError && (
            <div className="d-flex align-items-center gap-2 p-3 rounded-3 mb-3" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
              <i className="bi bi-exclamation-circle-fill text-danger" style={{ fontSize: '0.875rem' }} />
              <small className="text-danger">{profileError}</small>
            </div>
          )}

          <form onSubmit={profileForm.handleSubmit((data) => updateProfileMutation.mutate(data))} noValidate>
            <div className="form-input-group">
              <label htmlFor="profile-name" className="form-input-label">Name</label>
              <div className="form-input-wrapper">
                <i className="bi bi-person form-input-icon" />
                <input id="profile-name" type="text"
                  className={`form-input-field form-input-field--has-icon ${profileForm.formState.errors.name ? 'is-invalid' : ''}`}
                  {...profileForm.register('name')} />
              </div>
              {profileForm.formState.errors.name && (
                <div className="form-input-error">
                  <i className="bi bi-exclamation-circle" />
                  <span>{profileForm.formState.errors.name.message}</span>
                </div>
              )}
            </div>
            <div className="form-input-group">
              <label htmlFor="profile-email" className="form-input-label">Email</label>
              <div className="form-input-wrapper">
                <i className="bi bi-envelope form-input-icon" />
                <input id="profile-email" type="email"
                  className={`form-input-field form-input-field--has-icon ${profileForm.formState.errors.email ? 'is-invalid' : ''}`}
                  {...profileForm.register('email')} />
              </div>
              {profileForm.formState.errors.email && (
                <div className="form-input-error">
                  <i className="bi bi-exclamation-circle" />
                  <span>{profileForm.formState.errors.email.message}</span>
                </div>
              )}
            </div>
            <button type="submit" className="form-btn" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

      {/*  */}
      <div className="glass-card mb-4 animate-fade-in-up" style={{ '--animation-order': 2 }}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="rounded-3 d-flex align-items-center justify-content-center"
                 style={{ width: '32px', height: '32px', background: 'rgba(139, 92, 246, 0.1)' }}>
              <i className="bi bi-shield-lock" style={{ fontSize: '0.875rem', color: '#8b5cf6' }} />
            </div>
            <h6 className="fw-bold mb-0">Change Password</h6>
          </div>

          {passwordMsg && (
            <div className="d-flex align-items-center gap-2 p-3 rounded-3 mb-3" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '0.875rem' }} />
              <small className="text-success">{passwordMsg}</small>
            </div>
          )}
          {passwordError && (
            <div className="d-flex align-items-center gap-2 p-3 rounded-3 mb-3" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
              <i className="bi bi-exclamation-circle-fill text-danger" style={{ fontSize: '0.875rem' }} />
              <small className="text-danger">{passwordError}</small>
            </div>
          )}

          <form onSubmit={passwordForm.handleSubmit((data) => changePasswordMutation.mutate(data))} noValidate>
            {/* Current Password */}
            <div className="form-input-group">
              <label htmlFor="current-password" className="form-input-label">Current Password</label>
              <div className="form-input-wrapper">
                <i className="bi bi-lock form-input-icon" />
                <input id="current-password" type={showCurrentPw ? 'text' : 'password'}
                  className={`form-input-field form-input-field--has-icon form-input-field--has-toggle ${passwordForm.formState.errors.currentPassword ? 'is-invalid' : ''}`}
                  {...passwordForm.register('currentPassword')} />
                <button type="button" className="form-input-toggle" onClick={() => setShowCurrentPw(v => !v)} tabIndex={-1}>
                  <i className={`bi ${showCurrentPw ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
              {passwordForm.formState.errors.currentPassword && (
                <div className="form-input-error">
                  <i className="bi bi-exclamation-circle" />
                  <span>{passwordForm.formState.errors.currentPassword.message}</span>
                </div>
              )}
            </div>

            {/* New Password */}
            <div className="form-input-group">
              <label htmlFor="new-password" className="form-input-label">New Password</label>
              <div className="form-input-wrapper">
                <i className="bi bi-lock form-input-icon" />
                <input id="new-password" type={showNewPw ? 'text' : 'password'}
                  className={`form-input-field form-input-field--has-icon form-input-field--has-toggle ${passwordForm.formState.errors.newPassword ? 'is-invalid' : ''}`}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  {...passwordForm.register('newPassword')} />
                <button type="button" className="form-input-toggle" onClick={() => setShowNewPw(v => !v)} tabIndex={-1}>
                  <i className={`bi ${showNewPw ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <div className="form-input-error">
                  <i className="bi bi-exclamation-circle" />
                  <span>{passwordForm.formState.errors.newPassword.message}</span>
                </div>
              )}
              <PasswordStrengthMeter password={newPasswordValue} />
            </div>

            {/* Confirm New Password */}
            <div className="form-input-group">
              <label htmlFor="confirm-new-password" className="form-input-label">Confirm New Password</label>
              <div className="form-input-wrapper">
                <i className="bi bi-shield-lock form-input-icon" />
                <input id="confirm-new-password" type={showConfirmPw ? 'text' : 'password'}
                  className={`form-input-field form-input-field--has-icon form-input-field--has-toggle ${passwordForm.formState.errors.confirmNewPassword ? 'is-invalid' : ''}`}
                  {...passwordForm.register('confirmNewPassword')} />
                <button type="button" className="form-input-toggle" onClick={() => setShowConfirmPw(v => !v)} tabIndex={-1}>
                  <i className={`bi ${showConfirmPw ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
              {passwordForm.formState.errors.confirmNewPassword && (
                <div className="form-input-error">
                  <i className="bi bi-exclamation-circle" />
                  <span>{passwordForm.formState.errors.confirmNewPassword.message}</span>
                </div>
              )}
            </div>

            <button type="submit" className="form-btn" disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  Updating...
                </>
              ) : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/*  */}
      <div className="glass-card mb-4 animate-fade-in-up" style={{ '--animation-order': 3, border: '1px solid rgba(239, 68, 68, 0.15)' }}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="rounded-3 d-flex align-items-center justify-content-center"
                 style={{ width: '32px', height: '32px', background: 'rgba(239, 68, 68, 0.1)' }}>
              <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '0.875rem' }} />
            </div>
            <h6 className="fw-bold mb-0 text-danger">Danger Zone</h6>
          </div>

          {/* Deactivate */}
          <div className="d-flex justify-content-between align-items-center mb-3 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <p className="fw-semibold mb-0 small">Deactivate Account</p>
              <p className="text-muted small mb-0">Temporarily disable your account. Data is preserved.</p>
            </div>
            <button className="form-btn form-btn--outline" type="button"
              onClick={() => deactivateMutation.mutate()} disabled={deactivateMutation.isPending}
              style={{ whiteSpace: 'nowrap', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b' }}>
              {deactivateMutation.isPending ? 'Deactivating...' : 'Deactivate'}
            </button>
          </div>

          {/* Delete */}
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <p className="fw-semibold mb-0 small">Delete Account</p>
              <p className="text-muted small mb-0">Permanently remove your account and all data.</p>
            </div>
            {!showDeleteConfirm ? (
              <button className="form-btn form-btn--outline" type="button"
                onClick={() => setShowDeleteConfirm(true)}
                style={{ whiteSpace: 'nowrap', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
                Delete
              </button>
            ) : (
              <div className="d-flex gap-2">
                <button className="form-btn form-btn--danger" type="button"
                  onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}
                  style={{ whiteSpace: 'nowrap', padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
                  {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button className="form-btn form-btn--outline" type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{ whiteSpace: 'nowrap', padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
