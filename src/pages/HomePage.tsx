import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  CarFront,
  ChevronDown,
  Compass,
  Eye,
  FileCheck2,
  Globe2,
  GraduationCap,
  HeartHandshake,
  HelpCircle,
  Mail,
  Maximize2,
  MessageSquareQuote,
  Phone,
  Plane,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import {
  CONCIERGE_IMAGE,
  DESERT_IMAGE,
  HERO_IMAGE,
  HONEYMOON_IMAGE,
} from '../db/seedData';
import { parseStringList } from '../types';
import { SafeImage } from '../components/BrandMark';
import { PageMeta } from '../components/PageMeta';
import { EnquiryForm } from '../components/EnquiryForm';
import { ImageLightbox } from '../components/ImageLightbox';
import { ProjectShowcaseCard } from '../components/ProjectShowcaseCard';
import { OfferShowcaseCard } from '../components/OfferShowcaseCard';
import { extractGoogleDriveEmbedUrl, extractYouTubeEmbedUrl } from '../lib/mediaEmbeds';

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Plane,
  FileCheck2,
  Globe2,
  Building2,
  CarFront,
  Compass,
  HeartHandshake,
  Briefcase,
  ShieldCheck,
};

export function HomePage() {
  const { data, openEnquiryDrawer } = useApp();
  const s = data.settings;
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);
  const [destSlide, setDestSlide] = useState<'Dubai & UAE' | 'Europe' | 'Global Escapes'>('Dubai & UAE');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const popularServices = data.services.slice(0, 6);
  const dubaiHighlights = data.destinations.filter((d) => d.region === 'Dubai & UAE').slice(0, 6);
  const internationalHighlights = data.destinations.filter((d) => d.region !== 'Dubai & UAE').slice(0, 6);
  const filteredCarousel = data.destinations.filter((d) => d.region === destSlide).slice(0, 4);
  const featuredPackages = data.packages.filter((p) => p.featured).slice(0, 4);
  const featuredOffers = data.specialOffers.filter((o) => o.published).slice(0, 6);
  const featuredProjects = data.designProjects.filter((p) => p.published).slice(0, 6);
  const homeTestimonials = data.testimonials.slice(0, 3);
  const homeFaqs = data.faqs.slice(0, 5);
  const waNumber = (s.whatsappNumber || '971525509694').replace(/[^0-9]/g, '');

  return (
    <>
      <PageMeta
        title="Oasis Travel Consultancy Dubai | Holidays, Visas & Hotels"
        description="Leading travel agency in Dubai and African travel consultants for Dubai holiday packages from Nigeria, Dubai honeymoon packages, UAE visit, family, freelance & work visa guidance, hotel reservations, bedspace & airport taxi pickup."
        keywords="travel agency in Dubai, travel consultants Dubai, travel consultancy Dubai, Dubai holiday packages from Nigeria, Dubai honeymoon package, UAE visit guidance, Dubai visa, family visa, freelance visa, work visa, work visa family visa, visit visa change, Dubai Hotel Reservations, Dubai airport taxi pickup, African travel consultants from African countries, Dubai tourism packages, European travel information from Dubai, Dubai relocation information, bedspace rental, accommodation inquiring"
      />

      {/* 1. FULL-BLEED BACKGROUND IMAGE HERO (NAVY + GOLD) */}
      <section className="relative bg-[#10243B] text-white overflow-hidden">
        <div className="absolute inset-0">
          <SafeImage
            src={s.heroImageUrl || HERO_IMAGE}
            alt="Golden hour skyline of Dubai featuring Burj Khalifa and waterfront marina"
            className="w-full h-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#10243B]/92 via-[#10243B]/75 to-[#10243B]/45"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#10243B]/80 via-transparent to-[#10243B]/35"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-4xl space-y-6"
          >
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF5252]">
              <span className="w-8 h-[1px] bg-[#C9A45C]" aria-hidden="true" />
              <span>{s.heroEyebrow || 'Dubai, United Arab Emirates · International Travel & Tourism Consultancy'}</span>
            </div>

            <h1 className="font-display text-2xl sm:text-5xl lg:text-[clamp(2.35rem,3.8vw,3.5rem)] font-bold leading-[1.12] tracking-tight text-white">
              {!s.heroHeadline || s.heroHeadline.trim() === 'YOUR WORLD. YOUR JOURNEY. OUR OASIS.' ? (
                <>
                  <span className="block sm:whitespace-nowrap">YOUR WORLD. YOUR JOURNEY.</span>
                  <span className="block mt-1">OUR OASIS.</span>
                </>
              ) : (
                s.heroHeadline
              )}
            </h1>

            <p className="font-display text-lg sm:text-2xl font-medium text-[#FF5252] leading-snug">
              {s.heroSubheadline || 'Discover Dubai. Explore Opportunities. Create Unforgettable Memories.'}
            </p>

            <p className="text-base sm:text-lg text-[#FAF8F3]/90 leading-relaxed max-w-2xl">
              {s.heroIntro ||
                'From unforgettable holidays and romantic honeymoons to international travel, business opportunities, study and relocation guidance, Oasis Travel and Tourism Consultancy helps you organise your next journey with confidence.'}
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => openEnquiryDrawer()}
                className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[44px] rounded-xl bg-[#C9A45C] text-[#10243B] text-sm font-semibold shadow-sm hover:bg-[#b5914a] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                Start Your Journey
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[44px] rounded-xl border border-white/30 bg-white/10 backdrop-blur-xs text-white text-sm font-semibold hover:bg-white/20 transition-colors"
              >
                Explore Our Services
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#FAF8F3]/80">
              <span>{s.location || 'Dubai, United Arab Emirates'}</span>
              <span aria-hidden="true" className="text-[#DC2626]">·</span>
              <span>{s.hoursWeekday || 'Monday – Saturday: 8:00 AM – 8:00 PM'}</span>
              <span aria-hidden="true" className="text-[#DC2626]">·</span>
              <span>Personalised Holidays &amp; Transparent Advisory</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. ALWAYS-VISIBLE CONSULTANCY FEATURES SHOWCASE */}
      <section className="py-12 sm:py-14 bg-[#FAF8F3] border-b border-[#10243B]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-6xl mx-auto mb-8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">
              {s.exploreEyebrow || 'Explore Oasis Consultancy'}
            </p>
            <h2 className="font-display font-semibold text-[#10243B] text-xl sm:text-[clamp(1.05rem,2.15vw,1.95rem)] sm:whitespace-nowrap">
              {s.exploreHeading || 'Who We Are, Our Vision, Client Perspectives & Guidance'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                to: '/about',
                icon: Compass,
                title: 'About Us',
                desc: 'Eight core principles, mission, and Dubai consultancy values.',
              },
              {
                to: '/story',
                icon: BookOpen,
                title: 'Our Story',
                desc: 'How Oasis grew around African and global traveller care.',
              },
              {
                to: '/vision',
                icon: Eye,
                title: 'Our Vision',
                desc: 'Expanding trusted corridors connecting Africa, Dubai & Europe.',
              },
              {
                to: '/reviews',
                icon: MessageSquareQuote,
                title: 'Customer Reviews',
                desc: 'Transparent feedback perspectives and client experiences.',
              },
              {
                to: '/faq',
                icon: HelpCircle,
                title: 'FAQ',
                desc: 'Clear answers on UAE visas, flights, hotels & refunds.',
              },
            ].map((feat) => {
              const Icon = feat.icon;
              return (
                <Link
                  key={feat.to}
                  to={feat.to}
                  className="group bg-white border border-[#10243B]/10 rounded-xl p-5 flex flex-col justify-between gap-3 hover:border-[#C9A45C] hover:shadow-md transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="w-10 h-10 rounded-lg bg-[#FAF8F3] border border-[#10243B]/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#10243B] group-hover:text-[#DC2626] transition-colors" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-[#10243B] group-hover:text-[#193B59] transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-[#475569] leading-relaxed">{feat.desc}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#10243B] group-hover:text-[#DC2626] transition-colors">
                    Open {feat.title}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. WELCOME TO OASIS */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">
              {s.welcomeEyebrow || 'Welcome to Oasis'}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#10243B] leading-tight">
              {s.welcomeHeading ||
                'An International Consultancy Rooted in Dubai, Attentive to African & Global Travellers'}
            </h2>
            <p className="text-base text-[#475569] leading-relaxed">
              {s.welcomeParagraph1 ||
                'Planning an international journey requires more than booking a flight or picking a hotel online. Whether you are travelling from Nigeria, Ghana, Kenya, South Africa, or connecting globally, you deserve clear answers, verified options, and responsive guidance on the ground in Dubai.'}
            </p>
            <p className="text-base text-[#475569] leading-relaxed">
              {s.welcomeParagraph2 ||
                'Oasis Travel and Tourism Consultancy Dubai brings together curated leisure holidays, romantic honeymoons, executive business logistics, accommodation planning, and transparent visa and relocation information under one dependable roof.'}
            </p>
            <div className="pt-2 flex flex-wrap gap-6 text-sm font-semibold">
              <Link to="/about" className="inline-flex items-center gap-1.5 text-[#10243B] hover:text-[#DC2626] transition-colors">
                Read About Us <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/story" className="inline-flex items-center gap-1.5 text-[#193B59] hover:text-[#DC2626] transition-colors">
                Discover Our Story <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/vision" className="inline-flex items-center gap-1.5 text-[#10243B] hover:text-[#DC2626] transition-colors">
                Our Vision <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[300px] rounded-2xl overflow-hidden border border-[#10243B]/10 shadow-sm">
              <SafeImage
                src={s.conciergeImageUrl || CONCIERGE_IMAGE}
                alt="Oasis Travel and Tourism Consultancy lounge overlooking the Dubai skyline"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3B. SPECIAL OFFERS & SEASONAL PROMOTIONS (ADMIN-CONTROLLED) */}
      {featuredOffers.length > 0 && (
        <section id="special-offers" className="py-16 sm:py-20 bg-[#FAF8F3] border-t border-[#10243B]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-5xl mx-auto mb-10 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">
                Special Offers &amp; Seasonal Promotions
              </p>
              <h2 className="font-display font-semibold text-[#10243B] text-xl sm:text-[clamp(1.1rem,2.3vw,2.1rem)] sm:whitespace-nowrap">
                Curated Dubai Holiday, Honeymoon &amp; Visa Consultancy Offers
              </h2>
              <p className="text-sm text-[#475569] max-w-2xl mx-auto">
                Live promotions managed by our Dubai consultancy desk—enquire directly or chat on WhatsApp for tailored dates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredOffers.map((offer) => (
                <OfferShowcaseCard
                  key={offer.id}
                  offer={offer}
                  whatsappNumber={waNumber}
                  onEnquire={(item) =>
                    openEnquiryDrawer({
                      subjectLabel: `Special Offer: ${item.title}`,
                    })
                  }
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. DESIGN & EXPERIENCE SHOWCASE (CMS PROJECTS: IMAGES, VIDEOS, YOUTUBE, DRIVE) */}
      {featuredProjects.length > 0 && (
        <section className="py-16 sm:py-20 bg-[#FAF8F3] border-y border-[#10243B]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-6xl mx-auto mb-10 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">
                Design Projects &amp; Media Showcase
              </p>
              <h2 className="font-display font-semibold text-[#10243B] text-xl sm:text-[clamp(1rem,2.15vw,1.95rem)] sm:whitespace-nowrap">
                Curated Concepts, Visual Itineraries &amp; Destination Previews
              </h2>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => openEnquiryDrawer({ subjectLabel: 'Request Bespoke Itinerary Design' })}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#10243B] hover:text-[#DC2626] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Request Custom Design
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project) => (
                <ProjectShowcaseCard
                  key={project.id}
                  project={project}
                  onEnquire={(p) =>
                    openEnquiryDrawer({
                      subjectLabel: `Enquire: ${p.title}`,
                    })
                  }
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. WHY CHOOSE OASIS */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-6xl mx-auto mb-12 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">
              {s.whyChooseEyebrow || 'Why Choose Oasis'}
            </p>
            <h2 className="font-display font-semibold text-[#10243B] text-xl sm:text-[clamp(1.05rem,2.1vw,1.95rem)] sm:whitespace-nowrap">
              {s.whyChooseHeading || 'Built on Transparency, Cultural Understanding & Personal Accountability'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: '01',
                title: 'African & Global Perspective',
                body: 'We understand the practical visa, flight routing, and hospitality nuances important to Nigerian, West, East, Southern African, and international travellers.',
              },
              {
                num: '02',
                title: 'Honest Advisory Standards',
                body: 'Zero unrealistic promises. We explain official government criteria clearly so you can plan travel, study, or business steps responsibly.',
              },
              {
                num: '03',
                title: 'End-to-End Dubai Coordination',
                body: 'From airport meet-and-greet transfers and verified hotels to desert safaris and local orientation, every detail connects smoothly.',
              },
              {
                num: '04',
                title: 'Direct Human Support',
                body: 'Reach real consultants Monday to Saturday via WhatsApp, telephone, or email before departure and throughout your stay.',
              },
            ].map((item) => (
              <div
                key={item.num}
                className="bg-[#FAF8F3] border border-[#10243B]/10 rounded-2xl p-6 space-y-3 hover:border-[#C9A45C] transition-colors"
              >
                <span className="text-xs font-semibold text-[#DC2626] tabular-nums">{item.num}</span>
                <h3 className="font-display text-xl font-semibold text-[#10243B]">{item.title}</h3>
                <p className="text-sm text-[#475569] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. OUR MOST POPULAR SERVICES */}
      <section className="py-16 sm:py-20 bg-[#FAF8F3] border-y border-[#10243B]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-12 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">
              {s.popularServicesEyebrow || 'Our Most Popular Services'}
            </p>
            <h2 className="font-display font-semibold text-[#10243B] text-xl sm:text-[clamp(1.2rem,2.6vw,2.25rem)] sm:whitespace-nowrap">
              {s.popularServicesHeading || 'Comprehensive Travel & Consultancy Solutions'}
            </h2>
            <div className="pt-1">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#10243B] hover:text-[#DC2626] transition-colors whitespace-nowrap"
              >
                View All {data.services.length} Service Divisions
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularServices.map((service) => {
              const IconComp = SERVICE_ICONS[service.iconName] || Compass;
              const items = parseStringList(service.items).slice(0, 4);
              const resolvedMediaType = service.mediaType || 'image';
              const resolvedMediaUrl = service.mediaUrl || service.imageUrl || '';
              const ytEmbed = resolvedMediaType === 'youtube' ? extractYouTubeEmbedUrl(resolvedMediaUrl) : null;
              const gdEmbed = resolvedMediaType === 'gdrive' ? extractGoogleDriveEmbedUrl(resolvedMediaUrl) : null;
              return (
                <article
                  key={service.id}
                  className="bg-white border border-[#10243B]/10 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#C9A45C] hover:shadow-md transition-all"
                >
                  <div>
                    {resolvedMediaType === 'youtube' && ytEmbed ? (
                      <div className="aspect-[16/9] bg-[#10243B]/5 overflow-hidden">
                        <iframe
                          src={ytEmbed}
                          title={service.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      </div>
                    ) : resolvedMediaType === 'gdrive' && gdEmbed ? (
                      <div className="aspect-[16/9] bg-[#10243B]/5 overflow-hidden">
                        <iframe
                          src={gdEmbed}
                          title={service.title}
                          allow="autoplay"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      </div>
                    ) : resolvedMediaType === 'video' && resolvedMediaUrl ? (
                      <div className="aspect-[16/9] bg-[#10243B] overflow-hidden">
                        <video
                          src={resolvedMediaUrl}
                          poster={service.imageUrl || undefined}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : resolvedMediaUrl ? (
                      <div className="aspect-[16/9] bg-[#10243B]/5 overflow-hidden">
                        <SafeImage
                          src={resolvedMediaUrl}
                          alt={`${service.title} — ${service.category}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : null}

                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#DC2626]">
                        <span>{service.category}</span>
                        <div className="w-9 h-9 rounded-lg bg-[#FAF8F3] border border-[#10243B]/10 flex items-center justify-center">
                          <IconComp className="w-4 h-4 text-[#10243B]" />
                        </div>
                      </div>
                      <h3 className="font-display text-xl font-semibold text-[#10243B]">
                        {service.title}
                      </h3>
                      <p className="text-sm text-[#475569] leading-relaxed">{service.description}</p>
                      <ul className="space-y-1.5 pt-3 border-t border-[#10243B]/10 text-sm text-[#334155]">
                        {items.map((line, i) => (
                          <li key={i}>· {line}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <button
                      type="button"
                      onClick={() =>
                        openEnquiryDrawer({
                          serviceRequired: service.title,
                          subjectLabel: `Enquire: ${service.title}`,
                        })
                      }
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#10243B] hover:text-[#DC2626] transition-colors cursor-pointer"
                    >
                      Enquire Now
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. DISCOVER DUBAI & INTERNATIONAL DESTINATIONS */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-6xl mx-auto mb-10 space-y-5">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">
                {s.discoverEyebrow || 'Discover Dubai & Beyond'}
              </p>
              <h2 className="font-display font-semibold text-[#10243B] leading-tight text-xl sm:text-[clamp(1.05rem,2.15vw,1.95rem)] sm:whitespace-nowrap">
                {s.discoverHeading || 'Curated Landmarks Across the UAE, Europe & Global Escapes'}
              </h2>
            </div>

            <div className="inline-flex flex-wrap justify-center items-center gap-1 p-1 rounded-xl bg-[#FAF8F3] border border-[#10243B]/10 max-w-full">
              {(['Dubai & UAE', 'Europe', 'Global Escapes'] as const).map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => setDestSlide(region)}
                  className={`px-3.5 py-2 min-h-[40px] text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    destSlide === region
                      ? 'bg-[#10243B] text-[#FF5252] shadow-xs'
                      : 'text-[#475569] hover:text-[#10243B]'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCarousel.map((dest, index) => (
              <div
                key={dest.id}
                className="group bg-white border border-[#10243B]/10 rounded-2xl overflow-hidden flex flex-col hover:border-[#C9A45C] hover:shadow-md transition-all"
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  aria-label={`View full photo of ${dest.name}`}
                  className="relative block w-full aspect-[4/3] overflow-hidden cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
                >
                  <SafeImage
                    src={dest.imageUrl}
                    alt={`${dest.name} — ${dest.country}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-lg bg-[#10243B]/85 text-[#FF5252] shadow-sm flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </span>
                </button>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#DC2626]">
                      {dest.region} · {dest.country}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-[#10243B]">{dest.name}</h3>
                    <p className="text-sm text-[#475569] leading-relaxed line-clamp-3">
                      {dest.shortDescription}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      openEnquiryDrawer({
                        destination: dest.name,
                        subjectLabel: `Plan Trip to ${dest.name}`,
                      })
                    }
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#10243B] hover:text-[#DC2626] transition-colors cursor-pointer"
                  >
                    Enquire About {dest.name}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-[#10243B]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-[#475569]">
              Featuring {dubaiHighlights.length}+ iconic UAE experiences and {internationalHighlights.length}+ UK,
              Schengen, Indian Ocean &amp; African destinations.
            </p>
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#10243B] hover:text-[#DC2626] transition-colors"
            >
              Explore Full Destination Directory
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. HOLIDAY AND HONEYMOON EXPERIENCES */}
      <section className="py-16 sm:py-20 bg-[#FAF8F3] border-y border-[#10243B]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6">
            <div className="h-full min-h-[300px] rounded-2xl overflow-hidden border border-[#10243B]/10 shadow-sm">
              <SafeImage
                src={s.honeymoonImageUrl || HONEYMOON_IMAGE}
                alt="Couple relaxing at a sunset coastal resort arranged for a Dubai and island honeymoon"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">
              {s.honeymoonEyebrow || 'Holiday & Honeymoon Experiences'}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#10243B]">
              {s.honeymoonHeading || 'Romantic Honeymoons, Family Celebrations & Memorable Getaways'}
            </h2>
            <p className="text-base text-[#475569] leading-relaxed">
              {s.honeymoonBody ||
                'From newlywed couples dreaming of beachfront sunsets and candlelit desert evenings, to families seeking spacious apartments near Dubai’s safest attractions, we craft itineraries paced around your celebration.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm">
              <div className="p-4 rounded-xl bg-white border border-[#10243B]/10">
                <p className="font-semibold text-[#10243B]">Honeymoons &amp; Anniversaries</p>
                <p className="text-xs text-[#475569] mt-1">
                  Beach resorts, marina dinner cruises, private desert dining &amp; Dubai + Maldives twin-centres.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#10243B]/10">
                <p className="font-semibold text-[#10243B]">Family &amp; Group Holidays</p>
                <p className="text-xs text-[#475569] mt-1">
                  Serviced suites, private family vans, aquarium &amp; theme park coordination.
                </p>
              </div>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  openEnquiryDrawer({
                    serviceRequired: 'Honeymoon & Romantic Holiday Package',
                    subjectLabel: 'Plan Your Holiday or Honeymoon',
                  })
                }
                className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-[#10243B] text-white text-sm font-semibold shadow-sm hover:bg-[#193B59] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                Request Holiday Quotation
                <ArrowRight className="w-4 h-4 text-[#FF5252]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. UAE VISA & RELOCATION + BUSINESS & STUDY */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#FAF8F3] border border-[#10243B]/10 rounded-2xl p-7 sm:p-9 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">
                UAE Visas &amp; Relocation Guidance
              </span>
              <FileCheck2 className="w-5 h-5 text-[#10243B]" />
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#10243B]">
              Structured Guidance on UAE Visit, Residence &amp; Relocation Steps
            </h3>
            <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
              As a trusted travel agency and team of travel consultants in Dubai—including dedicated African travel
              consultants supporting guests from Nigeria and across African countries—we provide accurate UAE visit
              guidance covering Dubai visa options, family visa, freelance visa, work visa, visit visa change
              procedures, Dubai hotel reservations, bedspace rental and accommodation inquiring, Dubai airport taxi
              pickup, and practical Dubai relocation information.
            </p>
            <p className="text-xs text-[#748094] leading-relaxed">
              Transparency notice: All visa approvals and immigration decisions rest strictly with relevant UAE
              government authorities.
            </p>
            <button
              type="button"
              onClick={() =>
                openEnquiryDrawer({
                  serviceRequired: 'UAE Visit / Tourist Visa Guidance',
                  subjectLabel: 'UAE Visa, Accommodation & Relocation Enquiry',
                })
              }
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#10243B] hover:text-[#DC2626] transition-colors cursor-pointer"
            >
              Enquire About UAE Guidance
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-[#FAF8F3] border border-[#10243B]/10 rounded-2xl p-7 sm:p-9 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">
                Business, Study &amp; European Pathways
              </span>
              <GraduationCap className="w-5 h-5 text-[#10243B]" />
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#10243B]">
              Entrepreneurial, Corporate &amp; European Travel Information From Dubai
            </h3>
            <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
              Whether you are booking Dubai holiday packages from Nigeria, a romantic Dubai honeymoon package, curated
              Dubai tourism packages, or seeking European travel information from Dubai, our travel consultancy in Dubai
              prepares transparent study, corporate travel, and UAE business licensing orientation from day one.
            </p>
            <p className="text-xs text-[#748094] leading-relaxed">
              Transparency notice: Employment placements are not guaranteed and business licences are issued exclusively
              by authorised UAE government bodies.
            </p>
            <button
              type="button"
              onClick={() =>
                openEnquiryDrawer({
                  serviceRequired: 'Business & Company Formation Guidance',
                  subjectLabel: 'Business, Tourism or European Travel Enquiry',
                })
              }
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#10243B] hover:text-[#DC2626] transition-colors cursor-pointer"
            >
              Enquire About Business or Study
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 10. FEATURED TRAVEL PACKAGES */}
      <section className="py-16 sm:py-20 bg-[#FAF8F3] border-y border-[#10243B]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto mb-12 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">
              {s.packagesEyebrow || 'Featured Travel Packages'}
            </p>
            <h2 className="font-display font-semibold text-[#10243B] text-xl sm:text-[clamp(1.1rem,2.3vw,2.15rem)] sm:whitespace-nowrap">
              {s.packagesHeading || 'Tailored Package Concepts Ready for Custom Quotation'}
            </h2>
            <div className="pt-1">
              <Link
                to="/packages"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#10243B] hover:text-[#DC2626] transition-colors whitespace-nowrap"
              >
                Explore All Packages
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPackages.map((pkg) => (
              <article
                key={pkg.id}
                className="bg-white border border-[#10243B]/10 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#C9A45C] hover:shadow-md transition-all"
              >
                <div>
                  <div className="aspect-[4/3] overflow-hidden">
                    <SafeImage src={pkg.imageUrl} alt={pkg.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 space-y-2.5">
                    <p className="text-xs font-semibold text-[#DC2626]">
                      {pkg.category} · {pkg.suggestedDuration}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-[#10243B]">{pkg.title}</h3>
                    <p className="text-sm text-[#475569] leading-relaxed line-clamp-3">{pkg.description}</p>
                  </div>
                </div>
                <div className="px-5 pb-5 pt-2">
                  <p className="text-xs text-[#748094] mb-3">{pkg.priceNote}</p>
                  <button
                    type="button"
                    onClick={() =>
                      openEnquiryDrawer({
                        serviceRequired:
                          pkg.category === 'Honeymoon'
                            ? 'Honeymoon & Romantic Holiday Package'
                            : pkg.category === 'Business'
                            ? 'Business & Company Formation Guidance'
                            : 'Family / Group Holiday Package',
                        subjectLabel: `Custom Quote: ${pkg.title}`,
                      })
                    }
                    className="w-full py-2.5 px-4 min-h-[44px] rounded-xl bg-[#10243B] text-white text-xs font-semibold shadow-xs hover:bg-[#193B59] transition-colors cursor-pointer"
                  >
                    Request Custom Quote
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 11. HOW OUR SERVICES WORK */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-12 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">
              {s.howItWorksEyebrow || 'How Our Services Work'}
            </p>
            <h2 className="font-display font-semibold text-[#10243B] text-xl sm:text-[clamp(1.2rem,2.6vw,2.25rem)] sm:whitespace-nowrap">
              {s.howItWorksHeading || 'Four Clear Steps From Enquiry to Arrival'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: 'Step 01',
                title: 'Share Your Travel Goals',
                desc: 'Submit your dates, destination, travellers, and service requirements online or via WhatsApp.',
              },
              {
                step: 'Step 02',
                title: 'Consultation & Guidance',
                desc: 'Receive a reference number and clear consultation outlining realistic visa, hotel, and itinerary options.',
              },
              {
                step: 'Step 03',
                title: 'Tailored Quotation & Review',
                desc: 'Approve your verified itinerary, accommodation choices, and written terms before any commitment.',
              },
              {
                step: 'Step 04',
                title: 'Coordinated Travel Support',
                desc: 'Enjoy airport pick-up, local transfers, and accessible consultant support throughout your journey.',
              },
            ].map((item) => (
              <div key={item.step} className="bg-[#FAF8F3] border border-[#10243B]/10 rounded-2xl p-6 space-y-3">
                <p className="text-xs font-semibold text-[#DC2626] tabular-nums">{item.step}</p>
                <h3 className="font-display text-xl font-semibold text-[#10243B]">{item.title}</h3>
                <p className="text-sm text-[#475569] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. CUSTOMER REVIEWS (ALWAYS VISIBLE FEATURE) */}
      <section className="py-16 sm:py-20 bg-[#FAF8F3] border-y border-[#10243B]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">
              {s.reviewsEyebrow || 'Customer Reviews'}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#10243B]">
              {s.reviewsHeading || 'Trusted Service Perspectives'}
            </h2>
            <p className="text-sm text-[#475569]">
              Note: Sample development placeholders are clearly labelled until verified client reviews are added via
              the Administrator Dashboard.
            </p>
            <div className="pt-1">
              <Link
                to="/reviews"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#10243B] hover:text-[#DC2626] transition-colors whitespace-nowrap"
              >
                View All Customer Reviews
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {homeTestimonials.map((t) => (
              <blockquote
                key={t.id}
                className="bg-white border border-[#10243B]/10 rounded-2xl p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#DC2626]" aria-label={`${t.rating} out of 5 stars`}>
                      {Array.from({ length: t.rating }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-[#C9A45C] text-[#C9A45C]" />
                      ))}
                    </div>
                    {t.isSamplePlaceholder && (
                      <span className="text-[11px] font-medium text-[#748094]">Sample Placeholder</span>
                    )}
                  </div>
                  <p className="text-sm text-[#10243B] leading-relaxed">“{t.quote}”</p>
                </div>
                <footer className="pt-3 border-t border-[#10243B]/10 text-xs">
                  <p className="font-semibold text-[#10243B]">{t.authorName}</p>
                  <p className="text-[#475569] mt-0.5">
                    {t.origin} · {t.serviceUsed}
                  </p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* 13. FREQUENTLY ASKED QUESTIONS (ALWAYS VISIBLE FEATURE) */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">
              {s.faqEyebrow || 'Frequently Asked Questions'}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#10243B]">
              {s.faqHeading || 'Clear Answers Before You Travel'}
            </h2>
          </div>

          <div className="space-y-3">
            {homeFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-[#FAF8F3] border border-[#10243B]/10 rounded-xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white transition-colors"
                  >
                    <span className="font-medium text-sm sm:text-base text-[#10243B]">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#DC2626] shrink-0 transition-transform duration-150 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-2 text-sm text-[#475569] leading-relaxed bg-white border-t border-[#10243B]/10">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#10243B] hover:text-[#DC2626] transition-colors"
            >
              Read All FAQs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 14. CONTACT AND ENQUIRY CALL TO ACTION (CALM NON-HOVERING PHONE & EMAIL) */}
      <section className="py-16 sm:py-20 bg-[#FAF8F3] border-t border-[#10243B]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">
              Ready to Begin?
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#10243B]">
              {s.ctaHeading || 'Speak Directly With Our Travel & Consultancy Team'}
            </h2>
            <p className="text-base text-[#475569] leading-relaxed">
              {s.ctaSubheading ||
                'Share your travel dates, destination interests, or visa questions using our enquiry form. You will receive a formal reference number and can continue directly on WhatsApp or email.'}
            </p>
            <div className="space-y-3 text-sm text-[#10243B]">
              <a
                href={`tel:${s.phoneRaw || '+971525509694'}`}
                className="flex items-center gap-3 bg-white border border-[#10243B]/10 rounded-xl p-3.5"
              >
                <span className="w-10 h-10 rounded-lg bg-[#FAF8F3] border border-[#10243B]/10 text-[#10243B] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#748094]">
                    Direct Telephone
                  </span>
                  <span className="block font-semibold text-[#10243B] tabular-nums">
                    {s.phoneDisplay || '+971 52 550 9694'}
                  </span>
                </span>
              </a>

              <a
                href={`mailto:${s.email || 'Oasistravel46@gmail.com'}`}
                className="flex items-center gap-3 bg-white border border-[#10243B]/10 rounded-xl p-3.5"
              >
                <span className="w-10 h-10 rounded-lg bg-[#FAF8F3] border border-[#10243B]/10 text-[#DC2626] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#748094]">
                    Direct Email
                  </span>
                  <span className="block font-semibold text-[#10243B] break-all">
                    {s.email || 'Oasistravel46@gmail.com'}
                  </span>
                </span>
              </a>

              <div className="bg-white border border-[#10243B]/10 rounded-xl p-4 space-y-1 text-xs text-[#475569]">
                <p>
                  <strong className="text-[#10243B]">Location:</strong> {s.location || 'Dubai, United Arab Emirates'}
                </p>
                <p>
                  <strong className="text-[#10243B]">Hours:</strong>{' '}
                  {s.hoursWeekday || 'Monday – Saturday: 8:00 AM – 8:00 PM'} · {s.hoursSunday || 'Sunday: Closed'}
                </p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-[#10243B]/10 aspect-[16/9]">
              <SafeImage
                src={s.desertImageUrl || DESERT_IMAGE}
                alt="Arabian Desert Sunset Safari hospitality experience"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-[#10243B]/10 rounded-2xl p-6 sm:p-8 shadow-xs">
            <h3 className="font-display text-2xl font-semibold text-[#10243B] mb-5">
              Travel &amp; Consultancy Enquiry Form
            </h3>
            <EnquiryForm />
          </div>
        </div>
      </section>

      <ImageLightbox
        items={filteredCarousel}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={(nextIdx) => setLightboxIndex(nextIdx)}
        onEnquire={(dest) =>
          openEnquiryDrawer({
            destination: dest.name,
            subjectLabel: `Plan Trip to ${dest.name}`,
          })
        }
      />
    </>
  );
}
