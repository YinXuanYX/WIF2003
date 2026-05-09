// PasswordStrengthMeter — Live feedback for password quality
// Uses react-hook-form's useWatch to observe the password field
// without re-rendering the parent form.

import { useMemo } from 'react';

const LEVELS = ['weak', 'fair', 'good', 'strong'];
const LABELS = { weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong' };

function getStrength(password) {
  if (!password) return { score: 0, level: 'weak' };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const level = LEVELS[Math.max(0, score - 1)] || 'weak';
  return { score, level };
}

export default function PasswordStrengthMeter({ password = '' }) {
  const { score, level } = useMemo(() => getStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="auth-strength-meter">
      <div className="auth-strength-bar">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`auth-strength-segment ${i <= score ? 'auth-strength-segment--filled' : ''}`}
            data-level={i <= score ? level : undefined}
          />
        ))}
      </div>
      <span className="auth-strength-label" data-level={level}>
        {LABELS[level]}
      </span>
    </div>
  );
}
