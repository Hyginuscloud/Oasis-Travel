import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  Building2,
  CarFront,
  CheckCircle2,
  Compass,
  FileCheck2,
  Globe2,
  HeartHandshake,
  Maximize2,
  MessageCircle,
  Plane,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HERO_IMAGE } from '../db/seedData';
import { DestinationItem, parseStringList } from '../types';
import { extractGoogleDriveEmbedUrl, extractYouTubeEmbedUrl } from '../lib/mediaEmbeds';
import { SafeImage } from '../components/BrandMark';
import { PageMeta } from '../components/PageMeta';
import { ImageLightbox } from '../components/ImageLightbox';

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

const SERVICE_GROUPS = [
  { id: 'All', label: 'All Services' },
  { id: 'Travel & Visas', label: 'Travel, Visas & Europe', codes: ['A', 'B', 'C'] },
  { id: 'Stays & Holidays', label: 'Stays, Transfers & Holidays', codes: ['D', 'E', 'F', 'G'] },
  { id: 'Business & Advisory', label: 'Business & Compliance', codes: ['H', 'I'] },
] as const;

export function ServicesPage() {
  const { data, loading, openEnquiryDrawer } = useApp();
  const [selectedGroup, setSelectedGroup] = useState<(typeof SERVICE_GROUPS)[number]['id']>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const waNumber = (data.settings.whatsappNumber || '971525509694').replace(/[^0-9]/g, '');

  const filteredServices = useMemo(() => {
    const group = SERVICE_GROUPS.find((g) => g.id === selectedGroup);
    if (!group || !('codes' in group)) return data.services;
    return data.services.filter((s) => (group.codes as readonly string[]).includes(s.code));
  }, [data.services, selectedGroup]);

  const lightboxItems = useMemo<DestinationItem[]>(
    () =>
      filteredServices.map((s) => ({
        id: s.id,
        slug: `service-${s.code.toLowerCase()}`,
        name: s.title,
        region: `Division ${s.code}`,
        country: s.category,
        shortDescription: s.description,
        highlights: s.items,
        imageUrl: s.imageUrl || HERO_IMAGE,
        featured: false,
        sortOrder: s.sortOrder,
      })),
    [filteredServices]
  );

  return (
    <>
      <PageMeta
        title="Travel Services, Dubai Visas, Hotels & Airport Pickup | Oasis"
        description="Travel consultants Dubai for UAE visit guidance, Dubai visa, family visa, freelance visa, work visa, visit visa change, Dubai hotel reservations, bedspace rental, accommodation inquiring & Dubai airport taxi pickup."
        keywords="travel agency in Dubai, travel consultants Dubai, travel consultancy Dubai, UAE visit guidance, Dubai visa, family visa, freelance visa, work visa, work visa family visa, visit visa change, Dubai Hotel Reservations, Dubai airport taxi pickup, European travel information from Dubai, Dubai relocation information, bedspace rental, accommodation inquiring"
      />

      {/* Midnight Navy Hero */}
      <section className="relative overflow-hidden bg-[#10243B] text-white py-14 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,164,92,0.14),transparent_58%)]"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF5252]">
            <span className="w-8 h-[1px] bg-[#C9A45C]" aria-hidden="true" />
            <span>Service Directory · Dubai &amp; Global</span>
          </div>

          <h1 className="font-display font-bold tracking-tight leading-[1.15] text-2xl sm:text-[clamp(1.3rem,2.85vw,2.6rem)] sm:whitespace-nowrap text-white">
            Integrated Divisions Supporting Your Journey
          </h1>

          <div className="w-20 h-[2px] bg-[#C9A45C]" aria-hidden="true" />

          <p className="text-base md:text-[clamp(0.85rem,1.22vw,1rem)] text-[#FAF8F3]/85 leading-relaxed">
            <span className="md:block">
              Every division is built around transparent communication, careful preparation, and direct consultant coordination in Dubai.
            </span>{' '}
            <span className="md:block text-[#FF5252] font-medium mt-1">
              Select a category below, inspect any photo in full, or enquire for tailored support.
            </span>
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            <div className="lg:col-span-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openEnquiryDrawer({ subjectLabel: 'Service Directory Consultation' })}
                className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-[#C9A45C] text-[#10243B] text-sm font-semibold shadow-sm hover:bg-[#b5914a] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                Start a Service Enquiry
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                  'Hello Oasis Dubai, I would like guidance across your travel and consultancy services.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-[#15803D] text-white text-sm font-semibold shadow-sm hover:bg-[#166534] hover:-translate-y-0.5 transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Our Desk
              </a>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 border border-white/15 bg-[#193B59]/55 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-white/15 overflow-hidden">
              {(
                [
                  { id: 'Travel & Visas', num: '01 · Visas', title: 'Flights, UAE & Europe Mobility' },
                  { id: 'Stays & Holidays', num: '02 · Stays', title: 'Hotels, Transfers & Holidays' },
                  { id: 'Business & Advisory', num: '03 · Desk', title: 'Business & UAE Advisory' },
                ] as const
              ).map((item) => {
                const isSelected = selectedGroup === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedGroup(item.id);
                      setLightboxIndex(null);
                    }}
                    className={`p-4 min-h-[44px] text-left space-y-1 transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#193B59]' : 'hover:bg-[#193B59]/80'
                    }`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#FF5252]">{item.num}</p>
                    <p className="text-xs sm:text-sm font-medium text-white leading-snug">{item.title}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Directory & Cards */}
      <section className="py-12 sm:py-16 bg-[#FAF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Interactive Group Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-[#10243B]/10">
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-white border border-[#10243B]/10 max-w-full">
              {SERVICE_GROUPS.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => {
                    setSelectedGroup(group.id);
                    setLightboxIndex(null);
                  }}
                  className={`px-4 py-2 min-h-[40px] text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    selectedGroup === group.id
                      ? 'bg-[#10243B] text-[#FF5252] shadow-xs'
                      : 'text-[#475569] hover:text-[#10243B] hover:bg-[#FAF8F3]'
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>
            <p className="text-sm text-[#475569] tabular-nums">
              Showing {filteredServices.length} service divisions
            </p>
          </div>

          {loading && data.services.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-96 bg-white border border-[#10243B]/10 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredServices.map((service) => {
                const IconComp = SERVICE_ICONS[service.iconName] || Compass;
                const items = parseStringList(service.items);
                const whatsappHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(
                  `Hello Oasis Dubai, I would like to enquire about ${service.title}.`
                )}`;
                const resolvedMediaType = service.mediaType || 'image';
                const resolvedMediaUrl = service.mediaUrl || service.imageUrl || HERO_IMAGE;
                const ytEmbed = resolvedMediaType === 'youtube' ? extractYouTubeEmbedUrl(resolvedMediaUrl) : null;
                const gdEmbed = resolvedMediaType === 'gdrive' ? extractGoogleDriveEmbedUrl(resolvedMediaUrl) : null;
                const lbIdx = lightboxItems.findIndex((item) => item.id === service.id);

                return (
                  <article
                    key={service.id}
                    className="group bg-white border border-[#10243B]/10 hover:border-[#C9A45C] rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:shadow-md"
                  >
                    <div>
                      {resolvedMediaType === 'youtube' && ytEmbed ? (
                        <div>
                          <div className="aspect-[16/9] bg-[#10243B]/5 overflow-hidden">
                            <iframe
                              src={ytEmbed}
                              title={service.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full border-0"
                            />
                          </div>
                          <div className="px-6 pt-4 flex items-center justify-between text-xs font-semibold text-[#DC2626]">
                            <span>Division {service.code} · {service.category}</span>
                            <IconComp className="w-4 h-4 text-[#10243B]" />
                          </div>
                        </div>
                      ) : resolvedMediaType === 'gdrive' && gdEmbed ? (
                        <div>
                          <div className="aspect-[16/9] bg-[#10243B]/5 overflow-hidden">
                            <iframe
                              src={gdEmbed}
                              title={service.title}
                              allow="autoplay"
                              allowFullScreen
                              className="w-full h-full border-0"
                            />
                          </div>
                          <div className="px-6 pt-4 flex items-center justify-between text-xs font-semibold text-[#DC2626]">
                            <span>Division {service.code} · {service.category}</span>
                            <IconComp className="w-4 h-4 text-[#10243B]" />
                          </div>
                        </div>
                      ) : resolvedMediaType === 'video' && resolvedMediaUrl ? (
                        <div>
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
                          <div className="px-6 pt-4 flex items-center justify-between text-xs font-semibold text-[#DC2626]">
                            <span>Division {service.code} · {service.category}</span>
                            <IconComp className="w-4 h-4 text-[#10243B]" />
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setLightboxIndex(lbIdx >= 0 ? lbIdx : 0)}
                          aria-label={`View full photo for ${service.title}`}
                          className="relative block w-full aspect-[16/9] overflow-hidden cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
                        >
                          <SafeImage
                            src={resolvedMediaUrl}
                            alt={`${service.title} — ${service.category}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#10243B]/80 via-[#10243B]/25 to-transparent" />

                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-md bg-[#10243B]/90 text-[#FF5252] text-[11px] font-semibold uppercase tracking-wider shadow-xs">
                              Division {service.code}
                            </span>
                          </div>

                          <span
                            aria-hidden="true"
                            className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-[#10243B]/85 text-[#FF5252] shadow-xs flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </span>

                          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                            <span className="text-xs font-medium text-[#FF5252] truncate pr-2">
                              {service.category}
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                              <IconComp className="w-4 h-4 text-[#FF5252]" />
                            </div>
                          </div>
                        </button>
                      )}

                      <div className="p-6 space-y-4">
                        <div className="space-y-2">
                          <h2 className="font-display text-2xl font-semibold text-[#10243B] leading-snug">
                            {service.title}
                          </h2>
                          <p className="text-sm text-[#475569] leading-relaxed">
                            {service.description}
                          </p>
                        </div>

                        <ul className="pt-4 border-t border-[#10243B]/10 space-y-2 text-sm text-[#334155]">
                          {items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 leading-snug">
                              <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-2 flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          openEnquiryDrawer({
                            serviceRequired: service.title,
                            subjectLabel: `Enquire: ${service.title}`,
                          })
                        }
                        className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 min-h-[44px] rounded-xl bg-[#10243B] text-white text-sm font-semibold shadow-xs hover:bg-[#193B59] transition-colors cursor-pointer"
                      >
                        Enquire Now
                        <ArrowRight className="w-4 h-4 text-[#FF5252]" />
                      </button>
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`WhatsApp Oasis about ${service.title}`}
                        className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-[#10243B]/15 bg-white text-[#15803D] hover:bg-[#15803D] hover:text-white hover:border-[#15803D] transition-colors shrink-0"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Service & Regulatory Clarity + Direct Desk CTA */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7 bg-white border border-[#10243B]/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-center space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">
                Advisory Standards
              </p>
              <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#10243B]">
                Service &amp; Regulatory Transparency
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Oasis Travel and Tourism Consultancy Dubai acts as experienced travel consultants in Dubai and African
                travel consultants supporting travellers across African countries, Europe, and worldwide—providing UAE
                visit guidance covering Dubai visa, family visa, freelance visa, work visa, visit visa change steps,
                Dubai hotel reservations, bedspace rental and accommodation inquiring, Dubai airport taxi pickup, Dubai
                relocation information, and European travel information from Dubai. We do not act as a government
                embassy or immigration authority; visa approvals, work permits, business licences, and traffic fine
                decisions are made solely by competent government authorities.
              </p>
            </div>

            <div className="lg:col-span-5 bg-[#10243B] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-5 shadow-md">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#FF5252]">
                  Need Combined Support?
                </p>
                <h3 className="font-display text-xl sm:text-2xl font-semibold">
                  Request a Custom Multi-Service Consultation
                </h3>
                <p className="text-sm text-[#FAF8F3]/85 leading-relaxed">
                  Combine flight planning, UAE visa guidance, hotel stays, airport transfers, or European travel advice
                  in one tailored enquiry.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openEnquiryDrawer({ subjectLabel: 'Multi-Service Travel Consultation' })}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-[#C9A45C] text-[#10243B] text-sm font-semibold shadow-sm hover:bg-[#b5914a] transition-colors cursor-pointer"
              >
                Speak With Our Dubai Desk
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <ImageLightbox
        items={lightboxItems}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={(nextIdx) => setLightboxIndex(nextIdx)}
        onEnquire={(item) =>
          openEnquiryDrawer({
            serviceRequired: item.name,
            subjectLabel: `Enquire: ${item.name}`,
          })
        }
      />
    </>
  );
}
