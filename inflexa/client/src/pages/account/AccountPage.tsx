import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function AccountPage() {
  const { user } = useAuth();

  if (!user) return null;

  const memberSince = new Date(user.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">My Account</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <img
            src="/icons/profilePic.png"
            alt={user.username}
            className="w-14 h-14 rounded-full object-cover"
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user.username}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Role</span>
            <p className="font-medium text-gray-900 capitalize">{user.role}</p>
          </div>
          <div>
            <span className="text-gray-500">Member since</span>
            <p className="font-medium text-gray-900">{memberSince}</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/account/orders"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-brand-200 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
              <img src="/icons/order.svg" alt="" className="w-5 h-5 object-contain" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">Order History</h3>
              <p className="text-xs text-gray-500">View your past orders</p>
            </div>
          </div>
        </Link>

        <Link
          to="/account/track-order"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-brand-200 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">Track Order</h3>
              <p className="text-xs text-gray-500">Track your order status</p>
            </div>
          </div>
        </Link>

        <Link
          to="/account/change-password"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-brand-200 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">Change Password</h3>
              <p className="text-xs text-gray-500">Update your password</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
