import React, { useMemo, useState } from 'react';
import { ArrowRight, MapPin, Maximize2, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { parseStringList } from '../types';
import { SafeImage } from '../components/BrandMark';
import { PageMeta } from '../components/PageMeta';
import { ImageLightbox } from '../components/ImageLightbox';

const REGIONS = ['All Destinations', 'Dubai & UAE', 'Europe', 'Global Escapes'] as const;

export function DestinationsPage() {
  const { data, loading, openEnquiryDrawer } = useApp();
  const [selectedRegion, setSelectedRegion] = useState<(typeof REGIONS)[number]>('All Destinations');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const waNumber = (data.settings.whatsappNumber || '971525509694').replace(/[^0-9]/g, '');

  const filtered = useMemo(() => {
    if (selectedRegion === 'All Destinations') return data.destinations;
    return data.destinations.filter((d) => d.region === selectedRegion);
  }, [data.destinations, selectedRegion]);

  const regionCounts = useMemo(() => {
    const counts = { 'Dubai & UAE': 0, Europe: 0, 'Global Escapes': 0 };
    for (const d of data.destinations) {
      if (d.region in counts) {
        counts[d.region as keyof typeof counts] += 1;
      }
    }
    return counts;
  }, [data.destinations]);

  return (
    <>
      <PageMeta
        title="Dubai Tourism Packages & European Travel From Dubai | Oasis"
        description="Discover Dubai tourism packages, landmarks, and European travel information from Dubai with trusted African travel consultants serving travellers from Nigeria and across African countries."
        keywords="Dubai tourism packages, European travel information from Dubai, Dubai holiday packages from Nigeria, African travel consultants from African countries, travel agency in Dubai"
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
            <span>Destinations &amp; Attractions</span>
          </div>

          <h1 className="font-display font-bold tracking-tight leading-[1.15]">
            <span className="block text-2xl sm:text-3xl lg:text-[clamp(1.75rem,3.1vw,2.75rem)] lg:whitespace-nowrap text-white">
              From Iconic Dubai Landmarks to Europe
            </span>
            <span className="block mt-1 text-2xl sm:text-3xl lg:text-[clamp(1.75rem,3.1vw,2.75rem)] text-white">
              &amp; Island Escapes
            </span>
          </h1>

          <div className="w-20 h-[2px] bg-[#C9A45C]" aria-hidden="true" />

          <p className="text-base md:text-[clamp(0.85rem,1.25vw,1rem)] text-white leading-relaxed">
            <span className="md:block">
              Browse curated UAE attractions alongside sought-after international destinations in Europe, Turkey, the Indian Ocean, and Africa.
            </span>{' '}
            <span className="md:block text-white font-medium mt-1">
              Click any destination photograph to view it in full.
            </span>
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            <div className="lg:col-span-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openEnquiryDrawer({ subjectLabel: 'Custom Multi-Destination Itinerary' })}
                className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-[#C9A45C] text-[#10243B] text-sm font-semibold shadow-sm hover:bg-[#b5914a] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                Plan a Custom Itinerary
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                  'Hello Oasis Dubai, I would like to enquire about Dubai attractions and international destinations.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-[#15803D] text-white text-sm font-semibold shadow-sm hover:bg-[#166534] hover:-translate-y-0.5 transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Destination Desk
              </a>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 border border-white/15 bg-[#193B59]/55 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-white/15 overflow-hidden">
              {(
                [
                  { key: 'Dubai & UAE', num: '01', subtitle: 'Emirates & Desert' },
                  { key: 'Europe', num: '02', subtitle: 'UK & Schengen' },
                  { key: 'Global Escapes', num: '03', subtitle: 'Islands & Africa' },
                ] as const
              ).map((item) => {
                const isSelected = selectedRegion === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setSelectedRegion(item.key);
                      setLightboxIndex(null);
                    }}
                    className={`p-4 min-h-[44px] text-left space-y-1 transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#193B59]' : 'hover:bg-[#193B59]/80'
                    }`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white tabular-nums">
                      {item.num} · {regionCounts[item.key] || '—'}
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-white leading-snug">{item.key}</p>
                    <p className="text-[11px] text-white leading-snug">{item.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-[#FAF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Interactive Region Filter */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-[#10243B]/10">
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-white border border-[#10243B]/10 max-w-full">
              {REGIONS.map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => {
                    setSelectedRegion(reg);
                    setLightboxIndex(null);
                  }}
                  className={`px-4 py-2 min-h-[40px] text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    selectedRegion === reg
                      ? 'bg-[#10243B] text-[#FF5252] shadow-xs'
                      : 'text-[#475569] hover:text-[#10243B] hover:bg-[#FAF8F3]'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
            <p className="text-sm text-[#475569] tabular-nums">
              Showing {filtered.length} destinations
            </p>
          </div>

          {loading && data.destinations.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 bg-white border border-[#10243B]/10 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {filtered.map((dest, index) => {
                const highlights = parseStringList(dest.highlights);
                return (
                  <article
                    key={dest.id}
                    className="group bg-white border border-[#10243B]/10 hover:border-[#C9A45C] rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:shadow-md"
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() => setLightboxIndex(index)}
                        aria-label={`View full photo of ${dest.name}`}
                        className="relative block w-full aspect-[4/3] overflow-hidden cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
                      >
                        <SafeImage
                          src={dest.imageUrl}
                          alt={`${dest.name} in ${dest.country}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#091524]/85 via-transparent to-transparent" />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#091524]/92 border border-[#F59E0B]/45 text-[#F59E0B] text-[11px] font-bold uppercase tracking-wider shadow-md [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
                          {dest.region}
                        </span>
                        <span
                          aria-hidden="true"
                          className="absolute bottom-3 right-3 w-9 h-9 rounded-lg bg-[#091524]/90 border border-[#F59E0B]/40 text-[#F59E0B] shadow-md flex items-center justify-center opacity-95 group-hover:opacity-100 transition-opacity"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </span>
                      </button>

                      <div className="p-6 space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-[#DC2626]">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{dest.country}</span>
                        </div>
                        <h2 className="font-display text-2xl font-semibold text-[#10243B] leading-snug">
                          {dest.name}
                        </h2>
                        <p className="text-sm text-[#475569] leading-relaxed">
                          {dest.shortDescription}
                        </p>
                        {highlights.length > 0 && (
                          <ul className="pt-3 border-t border-[#10243B]/10 space-y-1.5 text-xs text-[#475569]">
                            {highlights.map((h, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A45C] mt-1.5 shrink-0" aria-hidden="true" />
                                <span>{h}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEnquiryDrawer({
                            destination: dest.name,
                            subjectLabel: `Enquire: ${dest.name}`,
                          })
                        }
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 min-h-[44px] rounded-xl bg-[#10243B] text-white text-sm font-semibold shadow-xs hover:bg-[#193B59] transition-colors cursor-pointer"
                      >
                        Enquire About {dest.name}
                        <ArrowRight className="w-4 h-4 text-[#FF5252]" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <ImageLightbox
        items={filtered}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={(nextIdx) => setLightboxIndex(nextIdx)}
        onEnquire={(dest) =>
          openEnquiryDrawer({
            destination: dest.name,
            subjectLabel: `Enquire: ${dest.name}`,
          })
        }
      />
    </>
  );
}
