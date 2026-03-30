import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-600">Sign in to your Inflexa account</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
