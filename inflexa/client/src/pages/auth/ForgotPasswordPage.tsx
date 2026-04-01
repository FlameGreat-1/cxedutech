import { useState } from 'react';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {!emailSent && (
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
            <p className="mt-1 text-sm text-gray-600">No worries, we'll help you reset it</p>
          </div>
        )}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <ForgotPasswordForm onSuccess={() => setEmailSent(true)} />
        </div>
      </div>
    </div>
  );
}
