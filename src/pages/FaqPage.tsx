import React, { useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageMeta } from '../components/PageMeta';

export function FaqPage() {
  const { data, openEnquiryDrawer } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    for (const f of data.faqs) set.add(f.category);
    return Array.from(set);
  }, [data.faqs]);

  const filtered = useMemo(() => {
    return data.faqs.filter((f) => {
      const catOk = selectedCategory === 'All' || f.category === selectedCategory;
      const q = search.trim().toLowerCase();
      const searchOk =
        !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
      return catOk && searchOk;
    });
  }, [data.faqs, selectedCategory, search]);

  const faqSchema = useMemo(
    () =>
      data.faqs.length > 0
        ? {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: data.faqs.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer,
              },
            })),
          }
        : null,
    [data.faqs]
  );

  return (
    <>
      <PageMeta
        title="Dubai Visa, Family, Freelance, Work Visa & Travel FAQ | Oasis"
        description="Answers from our travel consultants in Dubai on UAE visit guidance, Dubai visa, family visa, freelance visa, work visa, visit visa change, Dubai holiday packages from Nigeria, hotel reservations, bedspace & airport taxi pickup."
        keywords="UAE visit guidance, Dubai visa, family visa, freelance visa, work visa, work visa family visa, visit visa change, Dubai holiday packages from Nigeria, Dubai airport taxi pickup, bedspace rental, accommodation inquiring, European travel information from Dubai"
        schema={faqSchema}
      />

      <section className="relative overflow-hidden bg-[#10243B] text-white py-14 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,164,92,0.14),transparent_58%)]"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF5252]">
            <span className="w-8 h-[1px] bg-[#C9A45C]" aria-hidden="true" />
            <span>Frequently Asked Questions</span>
          </div>
          <h1 className="font-display font-bold leading-[1.15] tracking-tight text-2xl sm:text-[clamp(1.25rem,2.9vw,2.75rem)] sm:whitespace-nowrap text-white">
            Practical Guidance for Every Stage of Your Trip
          </h1>
          <div className="w-20 h-[2px] bg-[#C9A45C]" aria-hidden="true" />
          <p className="text-base md:text-[clamp(0.84rem,1.22vw,1.02rem)] text-[#FAF8F3]/85 leading-relaxed max-w-5xl">
            <span className="md:block">
              Browse answers on UAE visas, Nigeria-to-Dubai travel, African countries-to-Dubai travel, other nationalities to Dubai travel,
            </span>{' '}
            <span className="md:block text-[#FF5252] font-medium mt-0.5">
              European pathways, accommodation, business orientation, and booking terms.
            </span>
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-[#FAF8F3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-[#748094] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions (e.g. visa, honeymoon, Nigeria, Schengen, police clearance)..."
                aria-label="Search frequently asked questions"
                className="w-full pl-10 pr-4 py-3 min-h-[44px] rounded-xl bg-white border border-[#10243B]/15 text-sm text-[#10243B] focus:outline-none focus:ring-2 focus:ring-[#C9A45C]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#10243B] text-[#FF5252] shadow-xs'
                      : 'bg-white border border-[#10243B]/15 text-[#475569] hover:text-[#10243B] hover:border-[#C9A45C]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white border border-[#10243B]/10 rounded-2xl p-8 text-center space-y-3">
              <p className="text-sm text-[#475569]">No matching questions found for your search.</p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                }}
                className="text-sm font-semibold text-[#10243B] hover:text-[#DC2626] cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((faq) => {
                const isOpen = openId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-white border border-[#10243B]/10 rounded-2xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : faq.id)}
                      aria-expanded={isOpen}
                      className="w-full px-6 py-4 min-h-[52px] text-left flex items-start justify-between gap-4 cursor-pointer hover:bg-[#FAF8F3] transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="text-[11px] font-semibold text-[#DC2626]">{faq.category}</p>
                        <h2 className="text-sm sm:text-base font-semibold text-[#10243B]">
                          {faq.question}
                        </h2>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-[#DC2626] shrink-0 mt-1 transition-transform duration-150 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 pt-3 text-sm text-[#475569] leading-relaxed border-t border-[#10243B]/10 bg-[#FAF8F3]/60">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-[#10243B] text-white rounded-2xl p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div>
              <h3 className="font-display text-xl font-semibold">Have a Specific Question?</h3>
              <p className="text-sm text-[#FAF8F3]/85 mt-1">
                Send your enquiry directly to our Dubai consultancy team.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openEnquiryDrawer({ subjectLabel: 'Ask a Travel Consultant' })}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-[#C9A45C] text-[#10243B] text-sm font-semibold shadow-sm hover:bg-[#b5914a] transition-colors shrink-0 cursor-pointer"
            >
              Ask Oasis Directly
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
