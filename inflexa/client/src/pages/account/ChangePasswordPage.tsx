import { useState, type FormEvent } from 'react';
import { useToast } from '@/hooks/useToast';
import { changePassword } from '@/api/user.api';
import { extractErrorMessage } from '@/api/client';
import { validatePassword } from '@/utils/validators';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

export default function ChangePasswordPage() {
  const { addToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: Record<string, string> = {};

    if (!currentPassword) e.currentPassword = 'Current password is required.';

    const pwResult = validatePassword(newPassword);
    if (!newPassword) {
      e.newPassword = 'New password is required.';
    } else if (!pwResult.valid) {
      e.newPassword = pwResult.errors[0];
    }

    if (newPassword !== confirmPassword) {
      e.confirmPassword = 'Passwords do not match.';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    setApiError('');

    if (!validate()) return;

    setLoading(true);
    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword });
      addToast('success', 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    } catch (err) {
      setApiError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Change Password</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {apiError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-700">{apiError}</p>
            </div>
          )}

          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={errors.currentPassword}
            autoComplete="current-password"
          />

          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={errors.newPassword}
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            autoComplete="new-password"
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
