import React from 'react';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageMeta } from '../components/PageMeta';
import { EnquiryForm } from '../components/EnquiryForm';

export function ContactPage() {
  const { data } = useApp();
  const s = data.settings;
  const waNumber = (s.whatsappNumber || '971525509694').replace(/[^0-9]/g, '');

  const socialChannels = [
    { label: 'Facebook', url: s.facebookUrl || 'https://facebook.com' },
    { label: 'Instagram', url: s.instagramUrl || 'https://instagram.com' },
    { label: 'TikTok', url: s.tiktokUrl || 'https://tiktok.com' },
    ...(s.youtubeUrl ? [{ label: 'YouTube', url: s.youtubeUrl }] : []),
    ...(s.linkedinUrl ? [{ label: 'LinkedIn', url: s.linkedinUrl }] : []),
  ];

  return (
    <>
      <PageMeta
        title="Contact Travel Consultants Dubai | Visas, Hotels & Stays — Oasis"
        description="Contact our travel consultancy in Dubai via WhatsApp or online form for Dubai visa, family, freelance & work visa guidance, visit visa change, Dubai hotel reservations, bedspace rental, accommodation inquiring & Dubai airport taxi pickup."
        keywords="travel consultancy Dubai, travel consultants Dubai, travel agency in Dubai, bedspace rental, accommodation inquiring, Dubai airport taxi pickup, visit visa change, Dubai Hotel Reservations"
      />

      {/* Midnight Navy Hero */}
      <section className="relative overflow-hidden bg-[#10243B] text-white py-14 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,164,92,0.14),transparent_58%)]"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white">
            <span className="w-8 h-[1px] bg-[#C9A45C]" aria-hidden="true" />
            <MessageCircle className="w-3.5 h-3.5 text-white" />
            <span>Contact Oasis Dubai · Direct Consultancy Desk</span>
          </div>

          <h1 className="font-display font-bold tracking-tight leading-[1.15]">
            <span className="block text-2xl sm:text-3xl lg:text-[clamp(1.7rem,2.85vw,2.6rem)] lg:whitespace-nowrap text-white">
              Speak Directly With Our Travel &amp; Consultancy
            </span>
            <span className="block mt-1 text-2xl sm:text-3xl lg:text-[clamp(1.7rem,2.85vw,2.6rem)] text-white">
              Team
            </span>
          </h1>

          <div className="w-20 h-[2px] bg-[#C9A45C]" aria-hidden="true" />

          <p className="text-sm sm:text-base lg:text-[15.5px] xl:text-base text-white leading-relaxed">
            <span className="lg:block">
              Whether you are planning a holiday, honeymoon, business visit, accommodation reservation,
            </span>{' '}
            <span className="lg:block text-white font-medium mt-0.5">
              or seeking transparent visa information, we are ready to assist.
            </span>
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            <div className="lg:col-span-7 flex flex-wrap items-center gap-3">
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                  'Hello Oasis Travel and Tourism Consultancy Dubai, I would like to discuss a travel enquiry.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-[#15803D] text-white text-sm font-semibold shadow-sm hover:bg-[#166534] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
              <a
                href={`tel:${s.phoneRaw || '+971525509694'}`}
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-[#C9A45C] text-[#10243B] text-sm font-semibold shadow-sm hover:bg-[#b5914a] transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="tabular-nums">{s.phoneDisplay || '+971 52 550 9694'}</span>
              </a>
              <a
                href={`mailto:${s.email || 'Oasistravel46@gmail.com'}`}
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] max-w-full rounded-xl border border-white/25 bg-white/10 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                <Mail className="w-4 h-4 text-white shrink-0" />
                <span className="break-all">{s.email || 'Oasistravel46@gmail.com'}</span>
              </a>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 border border-white/15 bg-[#193B59]/55 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-white/15 overflow-hidden">
              <div className="p-4 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white">01 · Base</p>
                <p className="text-xs sm:text-sm font-medium text-white leading-snug">
                  Dubai, UAE Headquarters
                </p>
              </div>
              <div className="p-4 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white">02 · Hours</p>
                <p className="text-xs sm:text-sm font-medium text-white leading-snug">
                  Mon – Sat · 8 AM – 8 PM
                </p>
              </div>
              <div className="p-4 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white">03 · Care</p>
                <p className="text-xs sm:text-sm font-medium text-white leading-snug">
                  Direct Human Consultants
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-[#FAF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Channels & Hours */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#10243B]/10 rounded-2xl p-7 space-y-5">
              <h2 className="font-display text-2xl font-semibold text-[#10243B]">
                {s.businessName || 'Oasis Travel and Tourism Consultancy Dubai'}
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#10243B]">Location</p>
                    <p className="text-[#475569]">{s.location || 'Dubai, United Arab Emirates'}</p>
                  </div>
                </div>

                <a
                  href={`tel:${s.phoneRaw || '+971525509694'}`}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF8F3] border border-[#10243B]/10"
                >
                  <Phone className="w-5 h-5 text-[#10243B] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-semibold text-[#10243B]">Direct Telephone</p>
                    <p className="text-[#475569] tabular-nums">
                      {s.phoneDisplay || '+971 52 550 9694'}
                    </p>
                  </div>
                </a>

                <a
                  href={`mailto:${s.email || 'Oasistravel46@gmail.com'}`}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF8F3] border border-[#10243B]/10"
                >
                  <Mail className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-semibold text-[#10243B]">Email</p>
                    <p className="text-[#475569] break-all">
                      {s.email || 'Oasistravel46@gmail.com'}
                    </p>
                  </div>
                </a>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#10243B]">Opening Hours</p>
                    <p className="text-[#475569]">{s.hoursWeekday || 'Monday–Saturday: 8:00 AM–8:00 PM'}</p>
                    <p className="text-[#475569]">{s.hoursSunday || 'Sunday: Closed'}</p>
                  </div>
                </div>
              </div>

              {/* Direct Action Buttons */}
              <div className="pt-4 border-t border-[#10243B]/10 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                    'Hello Oasis Travel and Tourism Consultancy Dubai, I would like to discuss a travel enquiry.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-[44px] rounded-xl bg-[#15803D] text-white text-xs font-semibold shadow-xs hover:bg-[#166534] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Chat
                </a>
                <a
                  href={`tel:${s.phoneRaw || '+971525509694'}`}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-[44px] rounded-xl bg-[#10243B] text-white text-xs font-semibold shadow-xs hover:bg-[#193B59] transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#FF5252]" />
                  Call Mobile
                </a>
                <a
                  href={`mailto:${s.email || 'Oasistravel46@gmail.com'}`}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-[44px] rounded-xl bg-[#C9A45C] text-[#10243B] text-xs font-semibold shadow-xs hover:bg-[#b5914a] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Email Us
                </a>
              </div>
            </div>

            {/* Verified Office Location / Socials Section */}
            <div className="bg-white border border-[#10243B]/10 rounded-2xl p-7 space-y-3">
              <h3 className="font-display text-xl font-semibold text-[#10243B]">
                Dubai Office &amp; Consultation Map
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                {s.officeAddress ||
                  'Dubai, United Arab Emirates — verified street-level office pin will be published here once confirmed.'}
              </p>
              <div className="rounded-xl bg-[#FAF8F3] border border-[#10243B]/10 p-5 text-xs text-[#475569] space-y-2.5">
                <p className="font-semibold text-[#10243B]">Appointments &amp; Social Channels</p>
                <p>In-person consultations in Dubai are scheduled by prior appointment Monday to Saturday.</p>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {socialChannels.map((soc) => (
                    <a
                      key={soc.label}
                      href={soc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-lg bg-white border border-[#10243B]/15 text-[#10243B] font-medium hover:border-[#C9A45C] transition-colors"
                    >
                      {soc.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Full Enquiry Form */}
          <div className="lg:col-span-7 bg-white border border-[#10243B]/10 rounded-2xl p-6 sm:p-8">
            <div className="mb-6 pb-4 border-b border-[#10243B]/10">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#10243B]">
                Submit a Travel or Consultancy Enquiry
              </h2>
              <p className="text-sm text-[#475569] mt-1">
                Complete all essential fields below to generate a reference number and submit via web, email, or WhatsApp.
              </p>
            </div>
            <EnquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
