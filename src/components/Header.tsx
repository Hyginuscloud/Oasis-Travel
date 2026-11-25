import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, Megaphone, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandMark } from './BrandMark';

const PRIMARY_NAV = [
  { label: 'Services', to: '/services' },
  { label: 'Destinations', to: '/destinations' },
  { label: 'Packages', to: '/packages' },
  { label: 'About Us', to: '/about' },
  { label: 'Our Story', to: '/story' },
  { label: 'Our Vision', to: '/vision' },
  { label: 'Customer Reviews', to: '/reviews', shortLabel: 'Reviews' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact', to: '/contact' },
];

function getDubaiStatus(now: Date): {
  timeShort: string;
  timeFull: string;
  isOpen: boolean;
} {
  try {
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dubai',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dubai',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dubai',
      weekday: 'short',
      hour: 'numeric',
      hour12: false,
    }).formatToParts(now);

    const weekday = parts.find((p) => p.type === 'weekday')?.value || 'Mon';
    const hour24 = Number(parts.find((p) => p.type === 'hour')?.value || 12);
    const isSunday = weekday.toLowerCase().startsWith('sun');
    const isOpen = !isSunday && hour24 >= 8 && hour24 < 20;

    const clock = timeFormatter.format(now);
    const dayDate = dateFormatter.format(now);

    return {
      timeShort: `${clock} GST`,
      timeFull: `${dayDate} · ${clock} GST`,
      isOpen,
    };
  } catch {
    return {
      timeShort: 'Dubai GST',
      timeFull: 'Dubai GST (UTC+4)',
      isOpen: true,
    };
  }
}

export function Header() {
  const { data, openEnquiryDrawer } = useApp();
  const s = data.settings;
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const dubai = getDubaiStatus(now);
  const latestUpdateText = (
    s.latestUpdate ||
    'Now open for UAE Visit, Family, Freelance & Work Visa guidance, Dubai Honeymoon & Holiday Packages from Nigeria & Africa, Hotel Reservations & Airport Taxi Pickup.'
  ).trim();
  const openingHoursText = s.hoursWeekday || 'Mon – Sat: 8:00 AM – 8:00 PM (GST)';

  return (
    <header className="sticky top-0 z-40 bg-[#10243B] text-[#FAF8F3] border-b border-[#C9A45C]/25 shadow-sm">
      {/* Top Horizontal Live Bar: Opening Hours | Latest Update */}
      <div className="bg-[#091829] border-b border-[#C9A45C]/25 text-[#FAF8F3]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-9 sm:h-10 flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs overflow-hidden">
          {/* 1. Opening Time */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 text-[#FF5252] shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline text-[#FAF8F3]/90 whitespace-nowrap font-medium">
              {openingHoursText}
            </span>
            <span className="sm:hidden text-[#FAF8F3]/90 whitespace-nowrap font-medium">
              8AM–8PM
            </span>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${
                dubai.isOpen
                  ? 'bg-[#15803D]/30 text-[#4ADE80] border border-[#4ADE80]/30'
                  : 'bg-[#DC2626]/20 text-[#FF5252] border border-[#DC2626]/40'
              }`}
            >
              {dubai.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>

          <span aria-hidden="true" className="text-[#FF5252]/50 shrink-0">|</span>

          {/* 2. Latest Update (Continuous Horizontal Marquee Ticker) */}
          <div className="flex-1 min-w-[120px] flex items-center gap-2 overflow-hidden">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#C9A45C] text-[#10243B] text-[10px] font-bold uppercase tracking-wider shrink-0">
              <Megaphone className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Latest Update</span>
              <span className="sm:hidden">Update</span>
            </span>
            <button
              type="button"
              onClick={() => openEnquiryDrawer({ subjectLabel: 'Latest Update Enquiry' })}
              aria-label={`Latest Update: ${latestUpdateText}`}
              className="flex-1 min-w-0 overflow-hidden text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF5252] rounded"
            >
              <div className="animate-oasis-marquee gap-12 text-[#FAF8F3]/95 group-hover:text-[#FF5252] transition-colors">
                <span className="whitespace-nowrap font-medium">{latestUpdateText}</span>
                <span className="whitespace-nowrap font-medium" aria-hidden="true">
                  {latestUpdateText}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 min-w-0 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5252] rounded-lg"
        >
          <BrandMark
            logoUrl={s.logoUrl}
            alt={s.shortName || 'Oasis Travel & Tourism'}
            className="w-9 h-9 sm:w-10 sm:h-10 shrink-0"
          />
          <span className="flex flex-col leading-none min-w-0">
            <span className="font-display text-sm sm:text-base font-semibold tracking-tight text-white whitespace-nowrap truncate">
              {s.shortName || 'Oasis Travel & Tourism'}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#FF5252] mt-0.5 whitespace-nowrap">
              {s.logoSubtitle || 'Dubai Consultancy'}
            </span>
          </span>
        </Link>

        {/* Visible Desktop Links (No Hidden Dropdowns) */}
        <nav
          aria-label="Primary Navigation"
          className="hidden xl:flex items-center gap-4 text-[13px] font-medium text-[#FAF8F3]/85"
        >
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`py-1.5 whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                isActive(item.to)
                  ? 'text-[#FF5252] border-[#C9A45C] font-semibold'
                  : 'border-transparent hover:text-[#FF5252] hover:border-[#C9A45C]/50'
              }`}
            >
              {item.shortLabel || item.label}
            </Link>
          ))}
        </nav>

        {/* Primary Action & Mobile Drawer Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => openEnquiryDrawer()}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 rounded-md bg-[#C9A45C] text-[#10243B] text-xs sm:text-sm font-semibold shadow-sm hover:bg-[#E4C98D] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5252]"
          >
            Start Your Journey
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="xl:hidden inline-flex items-center justify-center w-11 h-11 rounded-md border border-white/20 text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Always-Visible Horizontal Feature Strip for Apple iPad, Tablet & Mobile */}
      <nav
        aria-label="Quick Feature Links"
        className="xl:hidden border-t border-white/10 bg-[#0C1C2F] px-4 sm:px-6 overflow-x-auto no-scrollbar"
      >
        <div className="max-w-7xl mx-auto flex items-center gap-5 h-11 text-xs font-medium text-[#FAF8F3]/80">
          {[
            { label: 'About Us', to: '/about' },
            { label: 'Our Story', to: '/story' },
            { label: 'Our Vision', to: '/vision' },
            { label: 'FAQ', to: '/faq' },
            { label: 'Customer Reviews', to: '/reviews' },
            { label: 'Services', to: '/services' },
            { label: 'Destinations', to: '/destinations' },
            { label: 'Packages', to: '/packages' },
            { label: 'Contact', to: '/contact' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`h-full inline-flex items-center whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                isActive(item.to)
                  ? 'text-[#FF5252] border-[#C9A45C] font-semibold'
                  : 'border-transparent hover:text-[#FF5252]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Expandable Full Drawer on Mobile & Tablet */}
      {mobileOpen && (
        <div className="xl:hidden bg-[#10243B] border-t border-white/15 px-4 py-5 space-y-1 max-h-[80vh] overflow-y-auto shadow-2xl">
          {[
            { label: 'Home', to: '/' },
            { label: 'Our Services', to: '/services' },
            { label: 'Destinations', to: '/destinations' },
            { label: 'Holiday Packages', to: '/packages' },
            { label: 'About Us', to: '/about' },
            { label: 'Our Story', to: '/story' },
            { label: 'Our Vision', to: '/vision' },
            { label: 'Customer Reviews', to: '/reviews' },
            { label: 'FAQ', to: '/faq' },
            { label: 'Contact Us', to: '/contact' },
            { label: 'Policies & Disclaimers', to: '/legal' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center px-3.5 min-h-[44px] rounded-md text-sm font-medium transition-colors ${
                isActive(item.to)
                  ? 'bg-white/10 text-[#FF5252] font-semibold'
                  : 'text-[#FAF8F3] hover:bg-white/10 hover:text-[#FF5252]'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-white/15">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                openEnquiryDrawer();
              }}
              className="w-full min-h-[44px] py-3 px-4 rounded-md bg-[#C9A45C] text-[#10243B] font-semibold text-sm text-center cursor-pointer hover:bg-[#E4C98D] transition-colors"
            >
              Start Your Journey
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
