import React from 'react';
import { PageMeta } from '../components/PageMeta';

export function LegalPage() {
  return (
    <>
      <PageMeta
        title="Legal, Compliance & Policies | Oasis Travel and Tourism Consultancy Dubai"
        description="Regulatory disclaimers, Privacy Policy, Terms and Conditions, Refund and Cancellation Policy, and Cookie Policy for Oasis Travel and Tourism Consultancy Dubai."
      />

      <section className="relative overflow-hidden bg-[#10243B] text-white py-14 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,164,92,0.14),transparent_58%)]"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              <span className="w-8 h-[1px] bg-[#C9A45C]" aria-hidden="true" />
              <span>Trust, Compliance &amp; Transparency</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight text-white">
              Disclaimers &amp; Legal Policies
            </h1>
            <p className="text-base text-white leading-relaxed">
              Clear standards governing advisory information, client data handling, bookings, and official authority
              boundaries.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-[#FAF8F3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div id="disclaimer" className="bg-white border border-[#10243B]/10 rounded-2xl p-7 sm:p-8 space-y-3">
            <h2 className="font-display text-2xl font-semibold text-[#10243B]">
              1. Website &amp; Advisory Disclaimer
            </h2>
            <p className="text-sm text-[#334155] leading-relaxed">
              Oasis Travel and Tourism Consultancy Dubai is an independent travel and tourism consultancy. We are not a
              government department, embassy, consulate, or immigration authority, and we do not represent any sovereign
              government unless formal authorisation has been explicitly verified.
            </p>
            <ul className="space-y-2 text-sm text-[#475569] pt-2">
              <li>· Visa approval and entry clearance are determined solely by relevant government immigration authorities.</li>
              <li>· Employment opportunities, job offers, and work placements are never guaranteed.</li>
              <li>· Immigration and relocation outcomes depend strictly on applicable laws and individual eligibility.</li>
              <li>· UAE business licences and company registrations are issued exclusively by authorised government bodies.</li>
              <li>· Traffic fine reductions, appeals, or cancellations remain subject to official UAE authority approval.</li>
              <li>· All travel prices, flight fares, hotel rates, and itinerary availability are subject to written confirmation.</li>
              <li>· Clients are encouraged to verify official government requirements prior to making payments.</li>
            </ul>
          </div>

          <div id="privacy" className="bg-white border border-[#10243B]/10 rounded-2xl p-7 sm:p-8 space-y-3">
            <h2 className="font-display text-2xl font-semibold text-[#10243B]">
              2. Privacy Policy
            </h2>
            <p className="text-sm text-[#334155] leading-relaxed">
              Personal information submitted through our enquiry forms—including your full name, email address,
              telephone number, nationality, country of residence, and travel preferences—is collected solely to respond
              to your travel consultancy request and coordinate requested services.
            </p>
            <p className="text-sm text-[#475569] leading-relaxed">
              Enquiry records are stored securely in our protected database and are accessible only to authorised Oasis
              administrators. We never publish personal customer records publicly or sell personal contact data to third
              parties. You may request access to, correction of, or deletion of your enquiry details by emailing
              Oasistravel46@gmail.com.
            </p>
          </div>

          <div id="terms" className="bg-white border border-[#10243B]/10 rounded-2xl p-7 sm:p-8 space-y-3">
            <h2 className="font-display text-2xl font-semibold text-[#10243B]">
              3. Terms &amp; Conditions
            </h2>
            <p className="text-sm text-[#334155] leading-relaxed">
              Submitting an enquiry through this website initiates a consultation and quotation process; it does not
              create a confirmed flight, hotel, or visa booking. Confirmed bookings are governed by the written quotation,
              invoice terms, and the respective airline, hotel, or tour supplier conditions provided at the time of
              confirmation.
            </p>
            <p className="text-sm text-[#475569] leading-relaxed">
              Clients are responsible for ensuring passport validity (typically at least six months beyond intended
              return date), accurate personal information, and compliance with destination laws.
            </p>
          </div>

          <div id="refunds" className="bg-white border border-[#10243B]/10 rounded-2xl p-7 sm:p-8 space-y-3">
            <h2 className="font-display text-2xl font-semibold text-[#10243B]">
              4. Refund &amp; Cancellation Policy
            </h2>
            <p className="text-sm text-[#334155] leading-relaxed">
              Cancellation and refund eligibility depends on the specific fare rules of airlines, hotel reservation
              deadlines, tour operators, and official authority policies applicable to each component of your itinerary.
              Government visa application and processing fees are non-refundable once submitted to authorities regardless
              of outcome. Written cancellation rules are always shared prior to payment confirmation.
            </p>
          </div>

          <div id="cookies" className="bg-white border border-[#10243B]/10 rounded-2xl p-7 sm:p-8 space-y-3">
            <h2 className="font-display text-2xl font-semibold text-[#10243B]">
              5. Cookie Policy
            </h2>
            <p className="text-sm text-[#334155] leading-relaxed">
              This website uses essential browser state strictly necessary for core site navigation, form reliability,
              and administrator authentication. We do not deploy intrusive advertising trackers.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
