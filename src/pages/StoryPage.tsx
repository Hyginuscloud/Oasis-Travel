import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Compass,
  Globe2,
  HeartHandshake,
  Plane,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageMeta } from '../components/PageMeta';

const STORY_CHAPTERS = [
  {
    number: '01',
    era: 'The Beginning',
    title: 'A Vision Rooted in Clarity and Hospitality',
    summary: 'Helping first-time travellers experience Dubai with calm, human coordination.',
    paragraphs: [
      'Approximately ten years ago, the vision behind Oasis took shape around a straightforward observation: thousands of ambitious professionals, families, newlyweds, and young explorers from Nigeria and across Africa wanted to experience the United Arab Emirates, yet many struggled to find a single, approachable consultancy in Dubai that genuinely listened to their plans.',
      'In the early days, conversations centred on the essentials of a memorable trip: helping first-time travellers experience Dubai with confidence, coordinating flight tickets, reserving dependable hotels or serviced apartments, arranging warm airport pick-up and drop-off, organising reliable local transportation, and crafting itineraries across landmarks such as the Burj Khalifa, Palm Jumeirah, Dubai Marina, and the golden dunes of the Arabian desert.',
    ],
    highlights: [
      { icon: Plane, label: 'Flight & Route Coordination' },
      { icon: Building2, label: 'Hotels & Serviced Stays' },
      { icon: Compass, label: 'Curated Dubai Landmarks' },
    ],
  },
  {
    number: '02',
    era: 'Deepening Trust',
    title: 'From Celebrated Holidays to Full Destination Advisory',
    summary: 'Growing alongside newlyweds, families, entrepreneurs, and long-stay visitors.',
    paragraphs: [
      'Soon, newly married couples began trusting Oasis to plan romantic honeymoons and milestone anniversary trips. Parents reached out for family vacations where comfort and safety came first. As relationships grew, clients naturally turned to us with broader questions about life, commerce, and mobility in the Emirates.',
      'Travellers asked how to navigate relevant visit and residence visa categories, locate temporary or family accommodation, understand legitimate employment pathways, or explore UAE company formation and business licensing frameworks with realistic expectations.',
    ],
    spotlight: {
      eyebrow: 'Client-Led Evolution',
      heading: 'Expanding Around Real Needs',
      body: 'Every new advisory pillar emerged directly from returning guests asking for honest, practical orientation before making life, study, or business decisions in the UAE.',
    },
  },
  {
    number: '03',
    era: 'Oasis Today',
    title: 'A Multidisciplinary Consultancy Connecting Dubai & the World',
    summary: 'Transparent travel planning, everyday UAE orientation, and international study or mobility guidance.',
    paragraphs: [
      'Others already living or visiting in Dubai needed practical, lawful guidance on everyday administrative questions—how to understand UAE regulations, how to apply for police clearance certificates, and how official traffic fine checking and payment procedures work. Meanwhile, students and families looked beyond the Gulf, asking for transparent information about international study opportunities and legitimate migration or travel pathways from Dubai to Europe.',
      'Responding to those real client needs transformed Oasis from a holiday planner into a multidisciplinary travel and tourism consultancy—committed to providing honest explanations, responsible guidance, and calm, human coordination for every chapter of your journey.',
    ],
    highlights: [
      { icon: ShieldCheck, label: 'Lawful UAE Orientation' },
      { icon: Globe2, label: 'Dubai-to-Europe Pathways' },
      { icon: HeartHandshake, label: 'Personalised Human Support' },
    ],
  },
];

const GUIDING_PILLARS = [
  {
    icon: Compass,
    title: 'Clarity Over Complexity',
    text: 'Clear documentation checklists, practical timelines, and realistic guidance without empty promises.',
  },
  {
    icon: HeartHandshake,
    title: 'Warm Hospitality First',
    text: 'Every client—whether booking a honeymoon or planning a business trip—receives attentive personal care.',
  },
  {
    icon: ShieldCheck,
    title: 'Responsible Advisory',
    text: 'Full respect for UAE immigration rules, embassy procedures, and official regulatory frameworks.',
  },
  {
    icon: Globe2,
    title: 'Africa, Dubai & Global Reach',
    text: 'Rooted in Dubai with deep understanding of African international travellers and global destinations.',
  },
];

export function StoryPage() {
  const { data, openEnquiryDrawer } = useApp();
  const s = data.settings;

  return (
    <>
      <PageMeta
        title="Our Story | African & International Travel Consultants Dubai"
        description="Discover how Oasis Travel and Tourism Consultancy Dubai grew into a dependable travel consultancy supporting African travellers with Dubai tourism packages, visas, and relocation planning."
        keywords="travel consultants Dubai, African travel consultants from African countries, Dubai tourism packages, Dubai relocation information"
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
            <span>Our Story · Dubai &amp; Global Advisory</span>
          </div>

          <h1 className="font-display font-bold tracking-tight leading-[1.15]">
            {!s.storyHeroHeadline ||
            s.storyHeroHeadline.trim() === 'From Helping First-Time Visitors Experience Dubai to Guiding Global Journeys' ? (
              <>
                <span className="block text-2xl sm:text-3xl lg:text-[clamp(1.65rem,2.6vw,2.55rem)] lg:whitespace-nowrap text-white">
                  From Helping First-Time Visitors Experience Dubai
                </span>
                <span className="block mt-1 text-2xl sm:text-3xl lg:text-[clamp(1.65rem,2.6vw,2.55rem)] text-white">
                  to Guiding Global Journeys
                </span>
              </>
            ) : (
              <span className="block text-2xl sm:text-4xl lg:text-[2.6rem] text-white max-w-4xl">
                {s.storyHeroHeadline}
              </span>
            )}
          </h1>

          <div className="w-20 h-[2px] bg-[#C9A45C]" aria-hidden="true" />

          <p className="text-sm sm:text-base lg:text-[15.5px] xl:text-base text-white leading-relaxed">
            {!s.storyHeroSubtitle ||
            s.storyHeroSubtitle.trim() ===
              'Every journey begins with an aspiration—whether a family holiday, a romantic honeymoon, an academic goal, or an entrepreneurial step into a new market.' ? (
              <>
                <span className="lg:block">
                  Every journey begins with an aspiration—whether a family holiday, a romantic honeymoon, an academic goal,
                </span>{' '}
                <span className="lg:block text-white font-medium mt-0.5">
                  or an entrepreneurial step into a new market.
                </span>
              </>
            ) : (
              s.storyHeroSubtitle
            )}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => openEnquiryDrawer({ subjectLabel: 'Consultancy Enquiry' })}
              className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-[#C9A45C] text-[#10243B] text-sm font-semibold shadow-sm hover:bg-[#b5914a] transition-colors cursor-pointer"
            >
              Start Your Journey
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/vision"
              className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl border border-white/25 bg-white/10 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Our Future Vision
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>
          </div>

          {/* 3-Chapter Interactive Strip */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 border border-white/15 bg-[#193B59]/55 rounded-xl divide-y md:divide-y-0 md:divide-x divide-white/15 overflow-hidden">
            {[
              {
                id: 'chapter-01',
                eyebrow: '01 · Origins',
                title: 'First-Time Dubai Arrivals',
                text: 'Coordinating flights, vetted hotels, airport transfers, and iconic Emirates sightseeing.',
              },
              {
                id: 'chapter-02',
                eyebrow: '02 · Milestones',
                title: 'Honeymoons & Family Escapes',
                text: 'Trusted by couples and parents for unhurried itineraries, comfort, and peace of mind.',
              },
              {
                id: 'chapter-03',
                eyebrow: '03 · Advisory',
                title: 'UAE, Business & Europe Mobility',
                text: 'Structured orientation on visas, business setup, compliance, and study abroad pathways.',
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="p-5 text-left space-y-1.5 hover:bg-[#193B59] transition-colors cursor-pointer"
              >
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white">{item.eyebrow}</p>
                <p className="font-display text-lg font-semibold text-white">{item.title}</p>
                <p className="text-xs text-white leading-relaxed">{item.text}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Narrative Chapters */}
      <article className="py-16 sm:py-20 bg-[#FAF8F3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="bg-white border border-[#10243B]/10 rounded-2xl p-7 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-[#C9A45C]" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">Founding Purpose</p>
                <p className="font-display text-2xl sm:text-3xl font-semibold text-[#10243B] leading-snug">
                  One approachable consultancy built on listening first.
                </p>
              </div>
              <div className="lg:col-span-8 lg:border-l lg:border-[#10243B]/10 lg:pl-8">
                <p className="text-base text-[#475569] leading-relaxed">
                  Rather than treating travellers as reservation numbers, Oasis grew through long-term human
                  relationships—guiding guests seamlessly from their very first airport arrival in Dubai to major
                  family holidays, corporate visits, and international opportunities across Europe and beyond.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {STORY_CHAPTERS.map((chapter) => (
              <section
                id={`chapter-${chapter.number}`}
                key={chapter.number}
                className="scroll-mt-24 bg-white border border-[#10243B]/10 rounded-2xl p-7 sm:p-10 space-y-6 transition-colors hover:border-[#C9A45C]"
              >
                <div className="space-y-3 pb-5 border-b border-[#10243B]/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#10243B] text-[#FF5252] font-display text-base font-semibold flex items-center justify-center shrink-0">
                      {chapter.number}
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#748094]">
                      {chapter.era}
                    </span>
                  </div>

                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#10243B] leading-snug">
                    {chapter.title}
                  </h2>
                  <p className="text-sm font-medium text-[#DC2626]">{chapter.summary}</p>
                </div>

                <div className="space-y-4 text-base text-[#475569] leading-relaxed">
                  {chapter.paragraphs.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                {chapter.highlights && (
                  <div className="pt-4 border-t border-[#10243B]/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {chapter.highlights.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="flex items-center gap-2.5 bg-[#FAF8F3] border border-[#10243B]/10 rounded-xl px-3.5 py-2.5"
                        >
                          <Icon className="w-4 h-4 text-[#DC2626] shrink-0" />
                          <span className="text-xs font-semibold text-[#10243B]">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {chapter.spotlight && (
                  <div className="mt-4 bg-[#10243B] text-white rounded-xl p-6 space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#FF5252]">
                      {chapter.spotlight.eyebrow}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-white">
                      {chapter.spotlight.heading}
                    </h3>
                    <p className="text-sm text-[#FAF8F3]/85 leading-relaxed">{chapter.spotlight.body}</p>
                  </div>
                )}
              </section>
            ))}
          </div>

          <div className="pt-4 space-y-6">
            <div className="text-center max-w-4xl mx-auto space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">
                What Our Story Means For You
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#10243B] lg:whitespace-nowrap">
                Four Principles Shaping Every Consultation
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {GUIDING_PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="bg-white border border-[#10243B]/10 rounded-2xl p-6 space-y-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#FAF8F3] border border-[#10243B]/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#10243B]" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-[#10243B]">{pillar.title}</h3>
                    <p className="text-sm text-[#475569] leading-relaxed">{pillar.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-[#10243B]/10 rounded-xl p-5 text-xs text-[#475569] leading-relaxed">
            <strong className="text-[#10243B]">Editorial Transparency Note:</strong>{' '}
            {s.storyDisclaimer ||
              'The approximate ten-year company history described above is company-provided background information subject to formal verification prior to publication. Oasis does not fabricate customer counts, awards, or government partnerships.'}
          </div>

          <div className="bg-[#10243B] text-white rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
            <div className="space-y-2 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5252]">
                Begin Your Next Chapter
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold">
                Ready to Plan Your Dubai Stay or Global Journey?
              </h2>
              <p className="text-sm text-[#FAF8F3]/85 leading-relaxed">
                Speak directly with our Dubai consultancy team for honest timelines, curated travel itineraries, or
                relocation orientation.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <Link
                to="/vision"
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl border border-white/25 bg-white/10 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                Our Future Vision
                <ArrowRight className="w-4 h-4 text-[#FF5252]" />
              </Link>
              <button
                type="button"
                onClick={() => openEnquiryDrawer()}
                className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-[#C9A45C] text-[#10243B] text-sm font-semibold shadow-sm hover:bg-[#b5914a] transition-colors cursor-pointer"
              >
                Start Your Journey
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
