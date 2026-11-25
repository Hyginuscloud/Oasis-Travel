import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandMark } from './BrandMark';

function FacebookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M13.5 22v-8h2.7l.4-3H13.5V9.1c0-.87.24-1.46 1.5-1.46h1.6V4.96c-.28-.04-1.24-.12-2.36-.12-2.34 0-3.94 1.43-3.94 4.05V11H7.6v3h2.7v8h3.2Z" />
    </svg>
  );
}

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.81a8.18 8.18 0 0 0 4.76 1.52V6.88a4.85 4.85 0 0 1-1-.19Z" />
    </svg>
  );
}

function YouTubeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M21.58 7.19a2.75 2.75 0 0 0-1.94-1.95C17.93 4.78 12 4.78 12 4.78s-5.93 0-7.64.46A2.75 2.75 0 0 0 2.42 7.19 28.6 28.6 0 0 0 2 12a28.6 28.6 0 0 0 .42 4.81 2.75 2.75 0 0 0 1.94 1.95c1.71.46 7.64.46 7.64.46s5.93 0 7.64-.46a2.75 2.75 0 0 0 1.94-1.95A28.6 28.6 0 0 0 22 12a28.6 28.6 0 0 0-.42-4.81ZM10 15.2V8.8L15.6 12 10 15.2Z" />
    </svg>
  );
}

export function Footer() {
  const { data, openEnquiryDrawer } = useApp();
  const s = data.settings;
  const waNumber = (s.whatsappNumber || '971525509694').replace(/[^0-9]/g, '');
  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    'Hello Oasis Travel and Tourism Consultancy Dubai, I would like to chat with your team.'
  )}`;

  return (
    <footer className="bg-[#10243B] text-[#FAF8F3] border-t border-[#C9A45C]/30 pb-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <BrandMark
                logoUrl={s.logoUrl}
                alt={s.shortName || 'Oasis Travel & Tourism'}
                className="w-10 h-10 shrink-0"
              />
              <span className="flex flex-col leading-none">
                <span className="font-display text-base sm:text-lg font-semibold text-white">
                  {s.shortName || 'Oasis Travel & Tourism'}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FF5252] mt-1">
                  {s.logoSubtitle || 'Dubai Consultancy'}
                </span>
              </span>
            </Link>

            <p className="text-sm text-[#FAF8F3]/75 leading-relaxed">
              {s.footerBlurb ||
                `${s.businessName || 'Oasis Travel and Tourism Consultancy Dubai'} connects African and international travellers with curated Dubai holidays, honeymoons, accommodation, business travel, and transparent advisory.`}
            </p>

            {/* Calm, direct contact details */}
            <div className="space-y-2.5 pt-1 text-sm text-[#FAF8F3]/85">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span>{s.location || 'Dubai, United Arab Emirates'}</span>
              </div>

              <a
                href={`tel:${s.phoneRaw || '+971525509694'}`}
                className="flex items-center gap-2.5 text-white font-medium"
              >
                <Phone className="w-4 h-4 text-[#DC2626] shrink-0" />
                <span className="tabular-nums">{s.phoneDisplay || '+971 52 550 9694'}</span>
              </a>

              <a
                href={`mailto:${s.email || 'Oasistravel46@gmail.com'}`}
                className="flex items-center gap-2.5 text-white font-medium break-all"
              >
                <Mail className="w-4 h-4 text-[#DC2626] shrink-0" />
                <span>{s.email || 'Oasistravel46@gmail.com'}</span>
              </a>

              <div className="flex items-start gap-2.5 text-xs text-[#FAF8F3]/70 pt-0.5">
                <Clock className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <div>
                  <p>{s.hoursWeekday || 'Monday – Saturday: 8:00 AM – 8:00 PM'}</p>
                  <p className="text-[#FAF8F3]/55">{s.hoursSunday || 'Sunday: Closed'}</p>
                </div>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="pt-2 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#FF5252]">
                Follow Oasis
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                {s.facebookUrl && (
                  <a
                    href={s.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Oasis on Facebook"
                    title="Facebook"
                    className="w-10 h-10 rounded-lg bg-white/10 border border-white/15 text-white flex items-center justify-center hover:bg-[#C9A45C] hover:text-[#10243B] hover:border-[#C9A45C] transition-colors"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                )}
                {s.instagramUrl && (
                  <a
                    href={s.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Oasis on Instagram"
                    title="Instagram"
                    className="w-10 h-10 rounded-lg bg-white/10 border border-white/15 text-white flex items-center justify-center hover:bg-[#C9A45C] hover:text-[#10243B] hover:border-[#C9A45C] transition-colors"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                )}
                {s.tiktokUrl && (
                  <a
                    href={s.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Oasis on TikTok"
                    title="TikTok"
                    className="w-10 h-10 rounded-lg bg-white/10 border border-white/15 text-white flex items-center justify-center hover:bg-[#C9A45C] hover:text-[#10243B] hover:border-[#C9A45C] transition-colors"
                  >
                    <TikTokIcon className="w-4 h-4" />
                  </a>
                )}
                {s.youtubeUrl && (
                  <a
                    href={s.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Oasis on YouTube"
                    title="YouTube"
                    className="w-10 h-10 rounded-lg bg-white/10 border border-white/15 text-white flex items-center justify-center hover:bg-[#C9A45C] hover:text-[#10243B] hover:border-[#C9A45C] transition-colors"
                  >
                    <YouTubeIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Travel Links */}
          <div>
            <h3 className="font-display text-base font-semibold text-[#FF5252] mb-4">
              Travel &amp; Packages
            </h3>
            <ul className="space-y-2.5 text-sm text-[#FAF8F3]/80">
              <li><Link to="/" className="hover:text-[#FF5252] transition-colors">Homepage</Link></li>
              <li><Link to="/services" className="hover:text-[#FF5252] transition-colors">Our Services</Link></li>
              <li><Link to="/destinations" className="hover:text-[#FF5252] transition-colors">Destinations</Link></li>
              <li><Link to="/packages" className="hover:text-[#FF5252] transition-colors">Holiday Packages</Link></li>
              <li><Link to="/contact" className="hover:text-[#FF5252] transition-colors">Contact &amp; Enquiry</Link></li>
            </ul>
          </div>

          {/* Always-Visible Consultancy Links */}
          <div>
            <h3 className="font-display text-base font-semibold text-[#FF5252] mb-4">
              Consultancy Features
            </h3>
            <ul className="space-y-2.5 text-sm text-[#FAF8F3]/80">
              <li><Link to="/about" className="hover:text-[#FF5252] transition-colors">About Us</Link></li>
              <li><Link to="/story" className="hover:text-[#FF5252] transition-colors">Our Story</Link></li>
              <li><Link to="/vision" className="hover:text-[#FF5252] transition-colors">Our Vision</Link></li>
              <li><Link to="/reviews" className="hover:text-[#FF5252] transition-colors">Customer Reviews</Link></li>
              <li><Link to="/faq" className="hover:text-[#FF5252] transition-colors">Frequently Asked Questions</Link></li>
            </ul>
          </div>

          {/* Legal & Prominent WhatsApp Desk */}
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-base font-semibold text-[#FF5252] mb-4">
                Compliance &amp; Policies
              </h3>
              <ul className="space-y-2.5 text-sm text-[#FAF8F3]/80">
                <li><Link to="/legal#disclaimer" className="hover:text-[#FF5252] transition-colors">Regulatory Disclaimer</Link></li>
                <li><Link to="/legal#privacy" className="hover:text-[#FF5252] transition-colors">Privacy Policy</Link></li>
                <li><Link to="/legal#terms" className="hover:text-[#FF5252] transition-colors">Terms &amp; Conditions</Link></li>
                <li><Link to="/legal#refunds" className="hover:text-[#FF5252] transition-colors">Refund &amp; Cancellation Policy</Link></li>
                <li><Link to="/legal#cookies" className="hover:text-[#FF5252] transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>

            <div className="rounded-lg bg-white/[0.06] border border-white/15 p-4 space-y-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#FF5252]">
                Direct Consultancy Desk
              </p>
              <button
                type="button"
                onClick={() => openEnquiryDrawer()}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#C9A45C] text-[#10243B] text-xs font-semibold hover:bg-[#E4C98D] transition-colors cursor-pointer"
              >
                Start Your Journey
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#15803D] text-white text-xs font-semibold hover:bg-[#166534] transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Mandatory Transparency Notice & Bottom Row */}
        <div className="pt-8 space-y-4 text-xs text-[#FAF8F3]/65 leading-relaxed">
          <p>
            <strong className="text-[#FF5252] font-medium">Important Advisory Notice:</strong>{' '}
            Oasis Travel and Tourism Consultancy Dubai is an independent travel consultancy and is not a government
            department, embassy, or immigration authority. Visa approvals and immigration decisions are made solely by
            the relevant government authorities. Employment placements are not guaranteed. Business licences are issued
            by authorised UAE bodies, and traffic fine reductions or cancellations remain subject to official approval.
            All travel prices, itineraries, and bookings are subject to final confirmation.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/10">
            <p className="text-[#FAF8F3]/85">
              &copy; {new Date().getFullYear()} {s.businessName || 'Oasis Travel and Tourism Consultancy Dubai'}. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[#FAF8F3]/75">
              <span>{s.location || 'Dubai, United Arab Emirates'}</span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#4ADE80] hover:text-white transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp Support
              </a>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              {s.facebookUrl && (
                <a href={s.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF5252]">
                  Facebook
                </a>
              )}
              {s.instagramUrl && (
                <a href={s.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF5252]">
                  Instagram
                </a>
              )}
              {s.tiktokUrl && (
                <a href={s.tiktokUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF5252]">
                  TikTok
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
