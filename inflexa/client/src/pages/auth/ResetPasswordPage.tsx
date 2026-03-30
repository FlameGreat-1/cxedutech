import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="mt-1 text-sm text-gray-600">Choose a new secure password</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
