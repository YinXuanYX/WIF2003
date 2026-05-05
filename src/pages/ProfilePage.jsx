// ============================================================
// ProfilePage — PRD §Module 1: Profile Control
// Displays user info, change password form, and account
// management actions (deactivate/delete).
// ============================================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
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

  // ── Update Profile Form ──
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

  // ── Change Password Form ──
  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

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

  // ── Deactivate Account ──
  const deactivateMutation = useMutation({
    mutationFn: mockDeactivateAccount,
    onSuccess: async () => {
      await mockLogout();
      clearUser();
      navigate('/login');
    },
  });

  // ── Delete Account ──
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
      <div className="mb-4">
        <h1 className="h4 fw-bold mb-1">Profile Settings</h1>
        <p className="text-muted small">Manage your account information and security</p>
      </div>

      {/* ── User Info Card ── */}
      <div className="card glass-card mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                 style={{
                   width: '56px', height: '56px', fontSize: '1.5rem',
                   background: 'linear-gradient(135deg, var(--bs-primary), #60a5fa)',
                   color: '#fff',
                 }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h5 className="fw-bold mb-0">{user.name}</h5>
              <small className="text-muted">{user.email}</small>
            </div>
          </div>
          <div className="d-flex gap-3 small text-muted">
            <span>📅 Member since {memberSince}</span>
            <span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'} bg-opacity-10 ${user.isActive ? 'text-success' : 'text-danger'}`}>
              {user.isActive ? '● Active' : '● Deactivated'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Update Profile ── */}
      <div className="card glass-card mb-4">
        <div className="card-body">
          <h6 className="fw-bold mb-3">✏️ Update Profile</h6>

          {profileMsg && <div className="alert alert-success py-2 small">{profileMsg}</div>}
          {profileError && <div className="alert alert-danger py-2 small">{profileError}</div>}

          <form onSubmit={profileForm.handleSubmit((data) => updateProfileMutation.mutate(data))} noValidate>
            <div className="mb-3">
              <label htmlFor="profile-name" className="form-label small fw-semibold">Name</label>
              <input id="profile-name" type="text"
                className={`form-control ${profileForm.formState.errors.name ? 'is-invalid' : ''}`}
                {...profileForm.register('name')} />
              {profileForm.formState.errors.name && (
                <div className="invalid-feedback">{profileForm.formState.errors.name.message}</div>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="profile-email" className="form-label small fw-semibold">Email</label>
              <input id="profile-email" type="email"
                className={`form-control ${profileForm.formState.errors.email ? 'is-invalid' : ''}`}
                {...profileForm.register('email')} />
              {profileForm.formState.errors.email && (
                <div className="invalid-feedback">{profileForm.formState.errors.email.message}</div>
              )}
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

      {/* ── Change Password ── */}
      <div className="card glass-card mb-4">
        <div className="card-body">
          <h6 className="fw-bold mb-3">🔒 Change Password</h6>

          {passwordMsg && <div className="alert alert-success py-2 small">{passwordMsg}</div>}
          {passwordError && <div className="alert alert-danger py-2 small">{passwordError}</div>}

          <form onSubmit={passwordForm.handleSubmit((data) => changePasswordMutation.mutate(data))} noValidate>
            <div className="mb-3">
              <label htmlFor="current-password" className="form-label small fw-semibold">Current Password</label>
              <input id="current-password" type="password"
                className={`form-control ${passwordForm.formState.errors.currentPassword ? 'is-invalid' : ''}`}
                {...passwordForm.register('currentPassword')} />
              {passwordForm.formState.errors.currentPassword && (
                <div className="invalid-feedback">{passwordForm.formState.errors.currentPassword.message}</div>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="new-password" className="form-label small fw-semibold">New Password</label>
              <input id="new-password" type="password"
                className={`form-control ${passwordForm.formState.errors.newPassword ? 'is-invalid' : ''}`}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                {...passwordForm.register('newPassword')} />
              {passwordForm.formState.errors.newPassword && (
                <div className="invalid-feedback">{passwordForm.formState.errors.newPassword.message}</div>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="confirm-new-password" className="form-label small fw-semibold">Confirm New Password</label>
              <input id="confirm-new-password" type="password"
                className={`form-control ${passwordForm.formState.errors.confirmNewPassword ? 'is-invalid' : ''}`}
                {...passwordForm.register('confirmNewPassword')} />
              {passwordForm.formState.errors.confirmNewPassword && (
                <div className="invalid-feedback">{passwordForm.formState.errors.confirmNewPassword.message}</div>
              )}
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="card glass-card mb-4 border-danger border-opacity-25">
        <div className="card-body">
          <h6 className="fw-bold mb-3 text-danger">⚠️ Danger Zone</h6>

          <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
            <div>
              <p className="fw-semibold mb-0 small">Deactivate Account</p>
              <p className="text-muted small mb-0">Temporarily disable your account. Your data is preserved.</p>
            </div>
            <button className="btn btn-outline-warning btn-sm" onClick={() => deactivateMutation.mutate()}
              disabled={deactivateMutation.isPending}>
              {deactivateMutation.isPending ? 'Deactivating...' : 'Deactivate'}
            </button>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <div>
              <p className="fw-semibold mb-0 small">Delete Account</p>
              <p className="text-muted small mb-0">Permanently remove your account and all associated data.</p>
            </div>
            {!showDeleteConfirm ? (
              <button className="btn btn-outline-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>
                Delete
              </button>
            ) : (
              <div className="d-flex gap-2">
                <button className="btn btn-danger btn-sm" onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}>
                  {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowDeleteConfirm(false)}>
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
