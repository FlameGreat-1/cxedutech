import { Outlet } from 'react-router-dom';
import Header from './Header';
import FilterBar from './FilterBar';
import Footer from './Footer';
import ToastContainer from '@/components/common/Toast';
import CookieConsentBanner from '@/components/common/CookieConsentBanner';

export default function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <FilterBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
      {/* Cookie consent banner sits above everything else */}
      <CookieConsentBanner />
    </div>
  );
}
