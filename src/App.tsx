import React, { useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FloatingActions } from './components/FloatingActions';
import { EnquiryDrawer } from './components/EnquiryForm';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { StoryPage } from './pages/StoryPage';
import { ServicesPage } from './pages/ServicesPage';
import { DestinationsPage } from './pages/DestinationsPage';
import { PackagesPage } from './pages/PackagesPage';
import { VisionPage } from './pages/VisionPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { FaqPage } from './pages/FaqPage';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';
import { AdminPage } from './pages/AdminPage';

function detectAdminHash(): boolean {
  if (typeof window === 'undefined') return false;
  const href = window.location.href;
  const rawHash = decodeURIComponent(window.location.hash || '').trim().toLowerCase();
  const cleanHash = rawHash.replace(/\/+$/, '');
  return (
    href.endsWith('#') ||
    href.endsWith('#/') ||
    cleanHash === '#' ||
    cleanHash === '#/' ||
    cleanHash === '#admin' ||
    cleanHash.startsWith('#admin') ||
    cleanHash.startsWith('#/admin') ||
    cleanHash === '#dashboard'
  );
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const cleanHash = decodeURIComponent(hash || '').trim().toLowerCase();
    const isAdminHash =
      cleanHash === '#' ||
      cleanHash === '#/' ||
      cleanHash.startsWith('#admin') ||
      cleanHash.startsWith('#/admin') ||
      cleanHash === '#dashboard';
    if (hash && !isAdminHash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center space-y-4 bg-[#FAF8F3]">
      <p className="text-xs font-semibold text-[#DC2626]">404</p>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#10243B]">
        Page Not Found
      </h1>
      <p className="text-sm text-[#748094] max-w-md">
        The page you requested could not be located. Return to our homepage or browse our travel consultancy services.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 rounded-md bg-[#10243B] text-white text-sm font-semibold hover:bg-[#193B59] transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}

function AppShell() {
  const location = useLocation();
  const [hashAdmin, setHashAdmin] = useState<boolean>(() => detectAdminHash());

  useEffect(() => {
    const syncHash = () => setHashAdmin(detectAdminHash());
    syncHash();
    window.addEventListener('hashchange', syncHash);
    window.addEventListener('popstate', syncHash);
    return () => {
      window.removeEventListener('hashchange', syncHash);
      window.removeEventListener('popstate', syncHash);
    };
  }, [location.pathname, location.hash, location.key]);

  const lowerPath = location.pathname.toLowerCase();
  const isAdminRoute = lowerPath === '/admin' || lowerPath.startsWith('/admin/') || hashAdmin || detectAdminHash();

  if (isAdminRoute) {
    return <AdminPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#10243B]">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/story" element={<StoryPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/vision" element={<VisionPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <FloatingActions />
      <EnquiryDrawer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ScrollToTop />
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  );
}
