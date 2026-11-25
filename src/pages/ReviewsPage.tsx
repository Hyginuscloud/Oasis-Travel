import React from 'react';
import { ArrowRight, ExternalLink, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageMeta } from '../components/PageMeta';

export function ReviewsPage() {
  const { data, openEnquiryDrawer } = useApp();

  return (
    <>
      <PageMeta
        title="Customer Reviews | Oasis Travel Agency & Consultants Dubai"
        description="Read client perspectives on Oasis Travel and Tourism Consultancy Dubai across Dubai holiday packages, honeymoons, UAE visit guidance, hotel reservations, and airport transfers."
        keywords="travel agency in Dubai, travel consultants Dubai, Dubai honeymoon package, Dubai Hotel Reservations, Dubai airport taxi pickup"
      />

      <section className="relative overflow-hidden bg-[#10243B] text-white py-14 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,164,92,0.14),transparent_58%)]"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF5252]">
            <span className="w-8 h-[1px] bg-[#C9A45C]" aria-hidden="true" />
            <span>Customer Reviews</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight text-white">
            Client Experiences &amp; Feedback
          </h1>
          <div className="w-20 h-[2px] bg-[#C9A45C]" aria-hidden="true" />
          <p className="text-base md:text-[clamp(0.82rem,1.22vw,1.02rem)] text-[#FAF8F3]/85 leading-relaxed">
            <span className="md:block md:whitespace-nowrap">
              Honest feedback helps travellers choose with confidence. Oasis publishes only authorised client testimonials and
            </span>{' '}
            <span className="md:block md:whitespace-nowrap text-[#FF5252] font-medium mt-0.5">
              clearly marks sample development placeholders.
            </span>
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-[#FAF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="bg-white border border-[#10243B]/10 rounded-2xl p-6 text-sm text-[#475569] leading-relaxed">
            <strong className="text-[#10243B]">Verification Standard:</strong> Entries labelled{' '}
            <em>Sample Placeholder</em> below are structural examples used during site setup and do not represent real
            customer endorsements. As authorised client permissions and verified review links are added via the Oasis
            Admin Dashboard, genuine testimonials appear here automatically.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {data.testimonials.map((t) => (
              <article
                key={t.id}
                className="bg-white border border-[#10243B]/10 hover:border-[#C9A45C] rounded-2xl p-7 flex flex-col justify-between space-y-5 transition-all hover:shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1" aria-label={`${t.rating} out of 5 stars`}>
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#C9A45C] text-[#C9A45C]" />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-[#748094]">
                      {t.isSamplePlaceholder ? 'Sample Placeholder' : 'Verified Client Review'}
                    </span>
                  </div>

                  <p className="text-base text-[#10243B] leading-relaxed">“{t.quote}”</p>
                  {t.experienceSummary && (
                    <p className="text-xs text-[#475569] leading-relaxed">{t.experienceSummary}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-[#10243B]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-[#10243B]">{t.authorName}</p>
                    <p className="text-[#475569]">
                      {t.origin} · {t.serviceUsed}
                    </p>
                  </div>
                  {t.verifiedLink && (
                    <a
                      href={t.verifiedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#10243B] font-semibold hover:text-[#DC2626] transition-colors"
                    >
                      Verified Link
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => openEnquiryDrawer()}
              className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[44px] rounded-xl bg-[#10243B] text-white text-sm font-semibold shadow-sm hover:bg-[#193B59] transition-colors cursor-pointer"
            >
              Plan Your Own Journey With Oasis
              <ArrowRight className="w-4 h-4 text-[#FF5252]" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
