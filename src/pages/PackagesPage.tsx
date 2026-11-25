import React, { useMemo, useState } from 'react';
import { ArrowRight, Calendar, Check, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { parseStringList } from '../types';
import { SafeImage } from '../components/BrandMark';
import { PageMeta } from '../components/PageMeta';
import { OfferShowcaseCard } from '../components/OfferShowcaseCard';

export function PackagesPage() {
  const { data, loading, openEnquiryDrawer } = useApp();
  const [category, setCategory] = useState('All');

  const waNumber = (data.settings.whatsappNumber || '971525509694').replace(/[^0-9]/g, '');

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    for (const p of data.packages) set.add(p.category);
    return Array.from(set);
  }, [data.packages]);

  const filtered = useMemo(() => {
    if (category === 'All') return data.packages;
    return data.packages.filter((p) => p.category === category);
  }, [data.packages, category]);

  const publishedOffers = useMemo(() => data.specialOffers.filter((o) => o.published), [data.specialOffers]);

  return (
    <>
      <PageMeta
        title="Dubai Holiday Packages From Nigeria & Honeymoon Offers | Oasis"
        description="Explore bespoke Dubai holiday packages from Nigeria, romantic Dubai honeymoon packages, family tourism packages, hotel reservations, and live special offers."
        keywords="Dubai holiday packages from Nigeria, Dubai honeymoon package, Dubai tourism packages, Dubai Hotel Reservations, travel consultancy Dubai"
      />

      {/* Midnight Navy Hero (no logo prefix before Holiday & Travel Packages) */}
      <section className="relative overflow-hidden bg-[#10243B] text-white py-14 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,164,92,0.14),transparent_58%)]"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF5252]">
            <span className="w-8 h-[1px] bg-[#C9A45C]" aria-hidden="true" />
            <span>Holiday &amp; Travel Packages</span>
          </div>

          <h1 className="font-display font-bold tracking-tight leading-[1.15] text-xl sm:text-[clamp(1.1rem,2.35vw,2.35rem)] sm:whitespace-nowrap text-white">
            Thoughtfully Structured Packages, Tailored to Your Dates
          </h1>

          <div className="w-20 h-[2px] bg-[#C9A45C]" aria-hidden="true" />

          <p className="text-base md:text-[clamp(0.85rem,1.35vw,1.04rem)] text-[#FAF8F3]/85 leading-relaxed">
            <span className="md:block md:whitespace-nowrap">
              Because airline fares and hotel rates vary by season,
            </span>{' '}
            <span className="md:block md:whitespace-nowrap text-[#FF5252] font-medium mt-0.5">
              every package is quoted transparently upon enquiry rather than locking you into rigid pricing.
            </span>
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            <div className="lg:col-span-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openEnquiryDrawer({ subjectLabel: 'Custom Holiday Package Quote' })}
                className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-[#C9A45C] text-[#10243B] text-sm font-semibold shadow-sm hover:bg-[#b5914a] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                Request a Custom Quote
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                  'Hello Oasis Dubai, I would like a tailored quotation for one of your holiday or business travel packages.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-[#15803D] text-white text-sm font-semibold shadow-sm hover:bg-[#166534] hover:-translate-y-0.5 transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Package Desk
              </a>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 border border-white/15 bg-[#193B59]/55 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-white/15 overflow-hidden">
              {[
                { key: 'Honeymoon', num: '01 · Romance', label: 'Honeymoon & Couples' },
                { key: 'Family', num: '02 · Family', label: 'Suites & Parks' },
                { key: 'Luxury', num: '03 · Executive', label: 'Luxury & Chauffeur' },
              ].map((item) => {
                const isSelected = category === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setCategory(item.key)}
                    className={`p-4 min-h-[44px] text-left space-y-1 transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#193B59]' : 'hover:bg-[#193B59]/80'
                    }`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#FF5252]">{item.num}</p>
                    <p className="text-xs sm:text-sm font-medium text-white leading-snug">{item.label}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-[#FAF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {publishedOffers.length > 0 && (
            <div className="mb-12 pb-10 border-b border-[#10243B]/10">
              <div className="mb-6 space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">
                  Live Promotions
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#10243B]">
                  Special Offers &amp; Featured Deals
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedOffers.map((offer) => (
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
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-[#10243B]/10">
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-white border border-[#10243B]/10 max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-2 min-h-[40px] text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    category === cat
                      ? 'bg-[#10243B] text-[#FF5252] shadow-xs'
                      : 'text-[#475569] hover:text-[#10243B] hover:bg-[#FAF8F3]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#475569]">
              All prices and availability are confirmed in writing upon quotation.
            </p>
          </div>

          {loading && data.packages.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-96 bg-white border border-[#10243B]/10 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filtered.map((pkg) => {
                const inclusions = parseStringList(pkg.inclusions);
                return (
                  <article
                    key={pkg.id}
                    className="bg-white border border-[#10243B]/10 hover:border-[#C9A45C] rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:shadow-md"
                  >
                    <div>
                      <div className="aspect-[16/9] overflow-hidden">
                        <SafeImage
                          src={pkg.imageUrl}
                          alt={pkg.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="p-6 sm:p-7 space-y-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#475569]">
                          <span className="font-semibold text-[#DC2626]">{pkg.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#10243B]" />
                            {pkg.suggestedDuration}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{pkg.availabilityStatus}</span>
                        </div>

                        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#10243B]">
                          {pkg.title}
                        </h2>
                        <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
                          {pkg.description}
                        </p>

                        <div className="pt-3 border-t border-[#10243B]/10 space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#DC2626]">
                            Possible Inclusions
                          </p>
                          <ul className="space-y-1.5 text-sm text-[#334155]">
                            {inclusions.map((inc, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                                <span>{inc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 sm:px-7 pb-6 pt-4 border-t border-[#10243B]/10 bg-[#FAF8F3] space-y-3">
                      <p className="text-xs text-[#475569]">
                        <strong className="text-[#10243B]">Quotation:</strong> {pkg.priceNote}
                      </p>
                      <div className="flex flex-wrap gap-3">
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
                              subjectLabel: `Enquire: ${pkg.title}`,
                            })
                          }
                          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 min-h-[44px] rounded-xl bg-[#10243B] text-white text-sm font-semibold shadow-xs hover:bg-[#193B59] transition-colors cursor-pointer"
                        >
                          Enquire Now
                          <ArrowRight className="w-4 h-4 text-[#FF5252]" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openEnquiryDrawer({
                              subjectLabel: `Custom Quotation: ${pkg.title}`,
                            })
                          }
                          className="py-2.5 px-4 min-h-[44px] rounded-xl border border-[#10243B]/20 bg-white text-[#10243B] text-sm font-medium hover:border-[#C9A45C] transition-colors cursor-pointer"
                        >
                          Custom Quote
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
