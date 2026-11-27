import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CONCIERGE_IMAGE } from '../db/seedData';
import { SafeImage } from '../components/BrandMark';
import { PageMeta } from '../components/PageMeta';

const CORE_VALUES = [
  {
    name: 'Integrity',
    desc: 'Honest communication regarding visa rules, travel costs, and realistic timelines without exaggerated promises.',
  },
  {
    name: 'Transparency',
    desc: 'Clear breakdowns of inclusions, third-party policies, and official authority requirements before payment.',
  },
  {
    name: 'Professionalism',
    desc: 'Disciplined coordination from your first enquiry to airport pick-up, accommodation check-in, and departure.',
  },
  {
    name: 'Customer Satisfaction',
    desc: 'Listening closely to your travel goals, group needs, and budget to recommend genuinely suitable options.',
  },
  {
    name: 'Respect',
    desc: 'Courteous, dignified service for every individual, family, couple, student, and executive client.',
  },
  {
    name: 'Reliability',
    desc: 'Consistent responsiveness Monday through Saturday across WhatsApp, telephone, and email.',
  },
  {
    name: 'Cultural Understanding',
    desc: 'Deep familiarity with both African travel expectations and UAE hospitality and regulatory culture.',
  },
  {
    name: 'Responsible Travel Guidance',
    desc: 'Prioritising lawful documentation, verified stays, and safe destination practices at every step.',
  },
];

export function AboutPage() {
  const { data, openEnquiryDrawer } = useApp();
  const s = data.settings;

  return (
    <>
      <PageMeta
        title="About Oasis | Travel Agency & African Consultants in Dubai"
        description="Learn about Oasis Travel Consultancy Dubai—trusted travel agency in Dubai and African travel consultants helping travellers from Nigeria, Africa, and worldwide with holidays, visas, and relocation information."
        keywords="travel agency in Dubai, travel consultancy Dubai, African travel consultants from African countries, Dubai relocation information"
      />

      {/* Midnight Navy Hero with Subtle Gold Illumination */}
      <section className="relative overflow-hidden bg-[#10243B] text-white py-14 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,164,92,0.14),transparent_58%)]"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-white">
            <span className="w-8 h-[1px] bg-[#C9A45C]" aria-hidden="true" />
            <span>About Oasis · Dubai, United Arab Emirates</span>
          </div>

          <h1 className="font-display font-bold tracking-tight leading-[1.15]">
            {!s.aboutHeroHeadline ||
            s.aboutHeroHeadline.trim() === 'Dependable Travel Guidance & Hospitality From the Heart of Dubai' ? (
              <>
                <span className="block text-2xl sm:text-3xl lg:text-[clamp(1.7rem,2.75vw,2.6rem)] lg:whitespace-nowrap text-white">
                  Dependable Travel Guidance &amp; Hospitality
                </span>
                <span className="block mt-1 text-2xl sm:text-3xl lg:text-[clamp(1.7rem,2.75vw,2.6rem)] text-white">
                  From the Heart of Dubai
                </span>
              </>
            ) : (
              <span className="block text-2xl sm:text-4xl lg:text-[2.6rem] text-white max-w-4xl">
                {s.aboutHeroHeadline}
              </span>
            )}
          </h1>

          <div className="w-20 h-[2px] bg-[#C9A45C]" aria-hidden="true" />

          <p className="text-sm sm:text-base lg:text-[15.5px] xl:text-base text-white leading-relaxed">
            {!s.aboutHeroSubtitle ||
            s.aboutHeroSubtitle.trim() ===
              'Oasis Travel and Tourism Consultancy Dubai is an international travel advisory and destination consultancy dedicated to making global journeys structured, welcoming, and transparent.' ? (
              <>
                <span className="lg:block">
                  Oasis Travel and Tourism Consultancy Dubai is an international travel advisory and destination consultancy
                </span>{' '}
                <span className="lg:block text-white font-medium mt-0.5">
                  dedicated to making global journeys structured, welcoming, and transparent.
                </span>
              </>
            ) : (
              s.aboutHeroSubtitle
            )}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            <div className="lg:col-span-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openEnquiryDrawer({ subjectLabel: 'Consultancy Enquiry' })}
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-[#C9A45C] text-[#10243B] text-sm font-semibold shadow-sm hover:bg-[#b5914a] transition-colors cursor-pointer"
              >
                Start Your Journey
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/story"
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl border border-white/25 bg-white/10 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                Read Our Story
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
              <a
                href={`https://wa.me/${s.whatsappNumber}?text=${encodeURIComponent(
                  'Hello Oasis Dubai, I would like to speak with your travel consultancy team.'
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
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white">01 · Base</p>
                <p className="text-xs sm:text-sm font-medium text-white leading-snug">
                  Dubai, UAE &amp; Africa Focus
                </p>
              </div>
              <div className="p-4 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white">02 · Desk</p>
                <p className="text-xs sm:text-sm font-medium text-white leading-snug">
                  Mon – Sat · 8 AM – 8 PM
                </p>
              </div>
              <div className="p-4 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white">03 · Ethos</p>
                <p className="text-xs sm:text-sm font-medium text-white leading-snug">
                  Honest &amp; Clear Guidance
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-[#FAF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 space-y-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#10243B] mb-3">
                Who We Are
              </h2>
              <p className="text-base text-[#475569] leading-relaxed">
                Headquartered in Dubai, United Arab Emirates, Oasis is an international travel and tourism consultancy
                serving leisure travellers, honeymooners, families, corporate executives, entrepreneurs, and students. We
                have particular insight into the needs of travellers departing from Nigeria, Ghana, Kenya, South Africa,
                and across the African continent alongside global clients.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#10243B] mb-3">
                What We Do
              </h2>
              <p className="text-base text-[#475569] leading-relaxed">
                We coordinate international flight research, hotel and serviced apartment reservations, airport transfers,
                Dubai sightseeing and adventure itineraries, romantic honeymoon packages, UAE visa guidance, European
                travel and study information, business travel logistics, and UAE relocation orientation.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#10243B] mb-3">
                Why We Started
              </h2>
              <p className="text-base text-[#475569] leading-relaxed">
                Too many international travellers face fragmented booking advice, unclear documentation requirements, and
                unresponsive intermediaries when planning trips to Dubai and Europe. Oasis was established to offer one
                trustworthy consultancy where clients receive clear explanations before committing their plans.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[320px] rounded-2xl overflow-hidden border border-[#10243B]/10 shadow-sm">
              <SafeImage
                src={s.conciergeImageUrl || CONCIERGE_IMAGE}
                alt="Oasis Travel Consultancy Dubai advisory lounge"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 sm:py-20 bg-white border-y border-[#10243B]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#FAF8F3] border border-[#10243B]/10 rounded-2xl p-8 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">Our Mission</p>
            <p className="font-display text-xl sm:text-2xl text-[#10243B] leading-relaxed">
              “{s.aboutMission ||
                'To make travel, tourism and international opportunities more accessible through reliable information, personalised assistance, responsible guidance and exceptional customer service.'}”
            </p>
          </div>
          <div className="bg-[#10243B] text-white rounded-2xl p-8 space-y-4 shadow-md">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5252]">Our Vision</p>
            <p className="font-display text-xl sm:text-2xl text-white leading-relaxed">
              “{s.aboutVision ||
                'To become a recognised and trusted travel and tourism consultancy connecting African travellers with destinations, opportunities and unforgettable experiences across the UAE and the wider world.'}”
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 sm:py-20 bg-[#FAF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 space-y-4">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#DC2626]">
              <span className="w-8 h-[1px] bg-[#C9A45C]" aria-hidden="true" />
              <span>Our Core Values</span>
            </div>
            <h2 className="font-display font-semibold tracking-tight leading-[1.15] text-2xl sm:text-3xl lg:text-[clamp(1.65rem,2.75vw,2.5rem)] lg:whitespace-nowrap text-[#10243B]">
              Eight Principles Guiding Every Consultation
            </h2>
            <div className="w-16 h-[2px] bg-[#C9A45C]" aria-hidden="true" />
            <p className="text-sm sm:text-base text-[#475569] max-w-2xl leading-relaxed">
              Every recommendation, itinerary, and advisory conversation is grounded in ethical clarity, verified
              arrangements, and genuine respect for your goals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CORE_VALUES.map((val, idx) => (
              <div
                key={val.name}
                className="group relative bg-white border border-[#10243B]/10 rounded-2xl p-6 space-y-3 overflow-hidden hover:border-[#C9A45C] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
              >
                <div
                  aria-hidden="true"
                  className="absolute top-0 inset-x-0 h-[3px] bg-[#C9A45C] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                />
                <span className="w-8 h-8 rounded-lg bg-[#FAF8F3] border border-[#C9A45C]/40 text-xs font-semibold text-[#10243B] tabular-nums flex items-center justify-center">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-lg font-semibold text-[#10243B]">{val.name}</h3>
                <p className="text-sm text-[#475569] leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white border-t border-[#10243B]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <h2 className="font-display text-3xl font-semibold text-[#10243B]">
            Ready to Plan With Confidence?
          </h2>
          <p className="text-base text-[#475569] leading-relaxed">
            Speak directly with our Dubai travel consultants about your upcoming holiday, honeymoon, visa guidance, or
            international itinerary.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => openEnquiryDrawer()}
              className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-[#10243B] text-white text-sm font-semibold shadow-sm hover:bg-[#193B59] transition-colors cursor-pointer"
            >
              Start Your Journey
              <ArrowRight className="w-4 h-4 text-[#FF5252]" />
            </button>
            <Link
              to="/story"
              className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl border border-[#10243B]/20 text-[#10243B] text-sm font-semibold hover:border-[#C9A45C] transition-colors"
            >
              Read Our Story
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
