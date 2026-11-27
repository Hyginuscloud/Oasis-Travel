import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EUROPE_IMAGE } from '../db/seedData';
import { SafeImage } from '../components/BrandMark';
import { PageMeta } from '../components/PageMeta';

const VISION_PILLARS = [
  {
    title: 'Expand International Travel Services',
    detail:
      'Broaden multi-city flight coordination, itinerary advisory, and seamless connection planning across the Middle East, Europe, and Africa.',
  },
  {
    title: 'Build Relationships With Legitimate Hospitality Providers',
    detail:
      'Strengthen direct collaborations with vetted hotels, serviced residences, licensed tour operators, and transport fleets in the UAE and abroad.',
  },
  {
    title: 'Develop Accessible & Transparent Holiday Packages',
    detail:
      'Design budget-conscious holiday structures that allow young travellers, families, and professionals to experience Dubai clearly and affordably.',
  },
  {
    title: 'Introduce Elevated Honeymoon Experiences',
    detail:
      'Curate signature couples’ itineraries combining Dubai waterfront luxury with tranquil retreats in the Maldives, Seychelles, and Europe.',
  },
  {
    title: 'Expand Global Destination Options',
    detail:
      'Continuously add thoughtful itineraries covering the United Kingdom, Schengen nations, Turkey, South Africa, and emerging cultural hubs.',
  },
  {
    title: 'Enhance Digital Booking & Enquiry Facilities',
    detail:
      'Invest in faster online quotation workflows, instant reference tracking, and clear digital itinerary summaries for busy clients.',
  },
  {
    title: 'Offer More Convenient Customer Support',
    detail:
      'Streamline multi-channel communication across WhatsApp, telephone, and email so questions receive prompt, accurate replies.',
  },
  {
    title: 'Develop Better Travel Planning Resources',
    detail:
      'Publish up-to-date preparation checklists covering packing, local customs, documentation, and arrival logistics.',
  },
  {
    title: 'Improve Travel Information for African Customers',
    detail:
      'Bridge information gaps for travellers departing Nigeria, Ghana, Kenya, South Africa, and neighbouring nations with honest, country-relevant clarity.',
  },
  {
    title: 'Expand Educational & International Mobility Information',
    detail:
      'Provide increasingly structured resources for students and professionals exploring legitimate study and international relocation opportunities.',
  },
];

export function VisionPage() {
  const { data, openEnquiryDrawer } = useApp();
  const s = data.settings;

  return (
    <>
      <PageMeta
        title="Our Vision | Connecting Africa, Dubai & Europe Travel — Oasis"
        description="Explore Oasis Travel Consultancy Dubai’s vision connecting African travellers from Nigeria and across Africa with Dubai holidays, hospitality, and European travel information."
        keywords="travel agency in Dubai, African travel consultants from African countries, European travel information from Dubai, Dubai holiday packages from Nigeria"
      />

      {/* Midnight Navy Hero */}
      <section className="relative overflow-hidden bg-[#10243B] text-white py-14 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,164,92,0.14),transparent_58%)]"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-white">
            <span className="w-8 h-[1px] bg-[#C9A45C]" aria-hidden="true" />
            <span>Our Vision &amp; Future Roadmap</span>
          </div>

          <h1 className="font-display font-bold tracking-tight leading-[1.15]">
            {!s.visionHeroHeadline ||
            s.visionHeroHeadline.trim() === 'Building a Recognised Bridge Between Africa, Dubai & the Wider World' ? (
              <>
                <span className="block text-2xl sm:text-3xl lg:text-[clamp(1.65rem,2.6vw,2.5rem)] lg:whitespace-nowrap text-white">
                  Building a Recognised Bridge Between Africa, Dubai &amp;
                </span>
                <span className="block mt-1 text-2xl sm:text-3xl lg:text-[clamp(1.65rem,2.6vw,2.5rem)] text-white">
                  the Wider World
                </span>
              </>
            ) : (
              <span className="block text-2xl sm:text-4xl lg:text-[2.6rem] text-white max-w-4xl">
                {s.visionHeroHeadline}
              </span>
            )}
          </h1>

          <div className="w-20 h-[2px] bg-[#C9A45C]" aria-hidden="true" />

          <p className="text-sm sm:text-base lg:text-[15.5px] xl:text-base text-white leading-relaxed">
            {!s.visionHeroSubtitle ||
            s.visionHeroSubtitle.trim() ===
              'Our roadmap focuses on practical improvements that deliver greater clarity, hospitality quality, and peace of mind for every traveller who trusts Oasis.' ? (
              <>
                <span className="lg:block">
                  Our roadmap focuses on practical improvements that deliver greater clarity, hospitality quality, and
                </span>{' '}
                <span className="lg:block text-white font-medium mt-0.5">
                  peace of mind for every traveller who trusts Oasis.
                </span>
              </>
            ) : (
              s.visionHeroSubtitle
            )}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            <div className="lg:col-span-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openEnquiryDrawer({ subjectLabel: 'Start Your Journey With Oasis' })}
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-[#C9A45C] text-[#10243B] text-sm font-semibold shadow-sm hover:bg-[#b5914a] transition-colors cursor-pointer"
              >
                Start Your Journey
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl border border-white/25 bg-white/10 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                Explore Our Services
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
              <a
                href={`https://wa.me/${s.whatsappNumber}?text=${encodeURIComponent(
                  'Hello Oasis Dubai, I would like to learn more about partnering or planning travel with your consultancy.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-[#15803D] text-white text-sm font-semibold hover:bg-[#166534] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Desk
              </a>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 border border-white/15 bg-[#193B59]/55 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-white/15 overflow-hidden">
              <div className="p-4 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white">01 · Reach</p>
                <p className="text-xs sm:text-sm font-medium text-white leading-snug">
                  Africa, Dubai &amp; Europe Corridors
                </p>
              </div>
              <div className="p-4 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white">02 · Stays</p>
                <p className="text-xs sm:text-sm font-medium text-white leading-snug">
                  Vetted Hospitality Networks
                </p>
              </div>
              <div className="p-4 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white">03 · Care</p>
                <p className="text-xs sm:text-sm font-medium text-white leading-snug">
                  Transparent Digital Support
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-[#FAF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch bg-white border border-[#10243B]/10 rounded-2xl overflow-hidden shadow-xs">
            <div className="lg:col-span-5 min-h-[260px]">
              <SafeImage
                src={s.europeImageUrl || EUROPE_IMAGE}
                alt="European architectural destination representing global expansion"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">
                Long-Term Commitment
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#10243B]">
                Connecting Ambition With Responsible Guidance
              </h2>
              <p className="text-base text-[#475569] leading-relaxed">
                As global travel evolves, travellers need more than automated booking links—they need an attentive
                consultancy that understands regional travel realities, maintains rigorous ethical standards, and
                continually improves the experience from first enquiry to safe return home.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VISION_PILLARS.map((item, idx) => (
              <div
                key={item.title}
                className="bg-white border border-[#10243B]/10 rounded-2xl p-6 space-y-2.5 hover:border-[#C9A45C] transition-colors"
              >
                <span className="font-mono text-xs font-semibold text-[#DC2626] tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-xl font-semibold text-[#10243B]">{item.title}</h3>
                <p className="text-sm text-[#475569] leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#10243B] text-white rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
            <div className="space-y-2 max-w-xl">
              <h3 className="font-display text-2xl sm:text-3xl font-semibold">
                Partner or Travel With Oasis
              </h3>
              <p className="text-sm sm:text-base text-[#FAF8F3]/85">
                Interested in group travel, corporate accounts, or bespoke destination planning? Reach out to our team.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openEnquiryDrawer({ subjectLabel: 'Start Your Journey With Oasis' })}
              className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[44px] rounded-xl bg-[#C9A45C] text-[#10243B] text-sm font-semibold shadow-sm hover:bg-[#b5914a] transition-colors shrink-0 cursor-pointer"
            >
              Start Your Journey
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
