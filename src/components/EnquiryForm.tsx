import React, { useEffect, useState } from 'react';
import { CheckCircle2, Mail, MessageCircle, Send, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SERVICE_OPTIONS = [
  'Travel and Flight Services',
  'UAE Visit / Tourist Visa Guidance',
  'UAE Residence Visa Information',
  'European Travel & Schengen Information',
  'European Study / Work Permit Information',
  'Hotel and Accommodation',
  'Airport Pick-Up & Transportation',
  'Dubai Tourism & Adventure Tours',
  'Honeymoon & Romantic Holiday Package',
  'Family / Group Holiday Package',
  'Business & Company Formation Guidance',
  'Police Clearance / Traffic Fine Guidance',
  'Relocation & General Consultancy',
];

const DESTINATION_OPTIONS = [
  'Dubai, UAE',
  'Abu Dhabi, UAE',
  'United Kingdom',
  'France',
  'Germany',
  'Netherlands',
  'Switzerland',
  'Italy',
  'Spain',
  'Portugal',
  'Turkey',
  'Maldives',
  'Seychelles',
  'South Africa',
  'Multi-Destination / Other',
];

interface EnquiryFormProps {
  initialService?: string;
  initialDestination?: string;
  compact?: boolean;
  onSuccess?: () => void;
}

export function EnquiryForm({
  initialService,
  initialDestination,
  compact = false,
  onSuccess,
}: EnquiryFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('');
  const [countryOfResidence, setCountryOfResidence] = useState('');
  const [serviceRequired, setServiceRequired] = useState(initialService || SERVICE_OPTIONS[0]);
  const [destination, setDestination] = useState(initialDestination || DESTINATION_OPTIONS[0]);
  const [preferredTravelDate, setPreferredTravelDate] = useState('');
  const [numberOfTravellers, setNumberOfTravellers] = useState('2');
  const [budgetRange, setBudgetRange] = useState('');
  const [message, setMessage] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<{
    referenceNumber: string;
    emailDispatched: boolean;
    whatsappUrl: string;
  } | null>(null);

  useEffect(() => {
    if (initialService) setServiceRequired(initialService);
  }, [initialService]);

  useEffect(() => {
    if (initialDestination) setDestination(initialDestination);
  }, [initialDestination]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (fullName.trim().length < 2) errs.fullName = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.length < 7 || digits.length > 16) {
      errs.phone = 'Include country code and valid mobile number (e.g. +234 801 234 5678).';
    }
    if (!nationality.trim()) errs.nationality = 'Please enter your nationality.';
    if (!countryOfResidence.trim()) errs.countryOfResidence = 'Please enter your country of residence.';
    if (!preferredTravelDate.trim()) errs.preferredTravelDate = 'Please select or enter a preferred date.';
    const count = Number(numberOfTravellers);
    if (!Number.isInteger(count) || count < 1) errs.numberOfTravellers = 'Enter at least 1 traveller.';
    if (message.trim().length < 5) errs.message = 'Please share brief details about your travel plans.';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submitWithChannel(channel: 'web' | 'whatsapp' | 'email') {
    setServerError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          nationality: nationality.trim(),
          countryOfResidence: countryOfResidence.trim(),
          serviceRequired,
          destination,
          preferredTravelDate,
          numberOfTravellers: Number(numberOfTravellers),
          budgetRange: budgetRange.trim() || undefined,
          message: message.trim(),
          channel,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Could not submit enquiry.');
      }

      setSubmittedResult({
        referenceNumber: json.referenceNumber,
        emailDispatched: Boolean(json.emailDispatched),
        whatsappUrl: json.whatsappUrl,
      });

      if (channel === 'whatsapp' && json.whatsappUrl) {
        const link = document.createElement('a');
        link.href = json.whatsappUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
      }

      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Submission error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedResult) {
    return (
      <div className="bg-white border border-[#10243B]/15 rounded-lg p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-[#16A34A] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display text-2xl font-semibold text-[#10243B]">Enquiry Received</h3>
            <p className="text-sm text-[#748094] mt-1">
              Reference Number:{' '}
              <span className="font-mono font-semibold text-[#10243B] tabular-nums">
                {submittedResult.referenceNumber}
              </span>
            </p>
          </div>
        </div>

        <p className="text-sm text-[#10243B]/80 leading-relaxed">
          Thank you, <strong>{fullName}</strong>. Your enquiry for{' '}
          <strong>{serviceRequired}</strong> ({destination}) has been securely recorded.
          {submittedResult.emailDispatched
            ? ' A confirmation email has been dispatched and our Dubai consultancy team has been notified.'
            : ' Our Dubai consultancy team will review your request during business hours (Monday–Saturday, 8:00 AM–8:00 PM GST).'}
        </p>

        <div className="bg-[#FAF8F3] border border-[#10243B]/10 rounded-md p-4 text-xs text-[#748094] space-y-1">
          <p>
            <strong className="text-[#10243B]">Travellers:</strong> {numberOfTravellers} ·{' '}
            <strong className="text-[#10243B]">Preferred Date:</strong> {preferredTravelDate}
          </p>
          <p>
            <strong className="text-[#10243B]">Contact:</strong> {email} · {phone}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href={submittedResult.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-md bg-[#15803D] text-white text-sm font-medium hover:bg-[#166534] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Continue on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => {
              setSubmittedResult(null);
              setMessage('');
            }}
            className="px-4 py-2.5 min-h-[44px] rounded-md border border-[#10243B]/20 text-sm font-medium text-[#10243B] hover:bg-[#FAF8F3] transition-colors cursor-pointer"
          >
            Submit Another Enquiry
          </button>
        </div>
      </div>
    );
  }

  const inputClass =
    'w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-[#FAF8F3] border border-[#10243B]/15 text-sm text-[#10243B] focus:outline-none focus:ring-2 focus:ring-[#C9A45C] focus:border-transparent';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitWithChannel('web');
      }}
      noValidate
      className="space-y-5"
    >
      {serverError && (
        <div role="alert" className="p-3.5 rounded-md bg-[#DC2626]/10 border border-[#DC2626]/30 text-sm text-[#DC2626]">
          {serverError}
        </div>
      )}

      <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-2' : 'md:grid-cols-2'} gap-4`}>
        <div>
          <label htmlFor="enq-fullName" className="block text-xs font-medium text-[#10243B] mb-1.5">
            Full Name *
          </label>
          <input
            id="enq-fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Chinedu Okafor"
            className={inputClass}
          />
          {fieldErrors.fullName && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.fullName}</p>}
        </div>

        <div>
          <label htmlFor="enq-email" className="block text-xs font-medium text-[#10243B] mb-1.5">
            Email Address *
          </label>
          <input
            id="enq-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className={inputClass}
          />
          {fieldErrors.email && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.email}</p>}
        </div>

        <div>
          <label htmlFor="enq-phone" className="block text-xs font-medium text-[#10243B] mb-1.5">
            Mobile / WhatsApp (with Country Code) *
          </label>
          <input
            id="enq-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234 801 234 5678"
            className={inputClass}
          />
          {fieldErrors.phone && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.phone}</p>}
        </div>

        <div>
          <label htmlFor="enq-nationality" className="block text-xs font-medium text-[#10243B] mb-1.5">
            Nationality *
          </label>
          <input
            id="enq-nationality"
            type="text"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            placeholder="e.g. Nigerian, Ghanaian, Kenyan"
            className={inputClass}
          />
          {fieldErrors.nationality && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.nationality}</p>}
        </div>

        <div>
          <label htmlFor="enq-residence" className="block text-xs font-medium text-[#10243B] mb-1.5">
            Country of Residence *
          </label>
          <input
            id="enq-residence"
            type="text"
            value={countryOfResidence}
            onChange={(e) => setCountryOfResidence(e.target.value)}
            placeholder="e.g. Nigeria, UAE, United Kingdom"
            className={inputClass}
          />
          {fieldErrors.countryOfResidence && (
            <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.countryOfResidence}</p>
          )}
        </div>

        <div>
          <label htmlFor="enq-service" className="block text-xs font-medium text-[#10243B] mb-1.5">
            Service Required *
          </label>
          <select
            id="enq-service"
            value={serviceRequired}
            onChange={(e) => setServiceRequired(e.target.value)}
            className={inputClass}
          >
            {SERVICE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="enq-destination" className="block text-xs font-medium text-[#10243B] mb-1.5">
            Destination *
          </label>
          <select
            id="enq-destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className={inputClass}
          >
            {DESTINATION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="enq-date" className="block text-xs font-medium text-[#10243B] mb-1.5">
            Preferred Travel Date *
          </label>
          <input
            id="enq-date"
            type="date"
            value={preferredTravelDate}
            onChange={(e) => setPreferredTravelDate(e.target.value)}
            className={inputClass}
          />
          {fieldErrors.preferredTravelDate && (
            <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.preferredTravelDate}</p>
          )}
        </div>

        <div>
          <label htmlFor="enq-travellers" className="block text-xs font-medium text-[#10243B] mb-1.5">
            Number of Travellers *
          </label>
          <input
            id="enq-travellers"
            type="number"
            min={1}
            max={200}
            value={numberOfTravellers}
            onChange={(e) => setNumberOfTravellers(e.target.value)}
            className={`${inputClass} tabular-nums`}
          />
          {fieldErrors.numberOfTravellers && (
            <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.numberOfTravellers}</p>
          )}
        </div>

        <div>
          <label htmlFor="enq-budget" className="block text-xs font-medium text-[#10243B] mb-1.5">
            Budget Range (Optional)
          </label>
          <input
            id="enq-budget"
            type="text"
            value={budgetRange}
            onChange={(e) => setBudgetRange(e.target.value)}
            placeholder="e.g. $2,500 – $5,000 USD"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="enq-message" className="block text-xs font-medium text-[#10243B] mb-1.5">
          Additional Message &amp; Requirements *
        </label>
        <textarea
          id="enq-message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your trip purpose, hotel preferences, visa questions, or special celebrations..."
          className={inputClass}
        />
        {fieldErrors.message && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.message}</p>}
      </div>

      {/* Live Enquiry Summary Strip */}
      <div className="bg-[#FAF8F3] border border-[#10243B]/10 rounded-md p-3.5 text-xs text-[#748094] flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-medium text-[#10243B]">Enquiry Summary:</span>
        <span>{serviceRequired}</span>
        <span aria-hidden="true">·</span>
        <span>{destination}</span>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums">{numberOfTravellers || 1} Traveller(s)</span>
        {preferredTravelDate && (
          <>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{preferredTravelDate}</span>
          </>
        )}
      </div>

      <p className="text-xs text-[#748094] leading-relaxed">
        By submitting, you acknowledge that visa approvals, employment outcomes, and official licences are determined
        solely by relevant government authorities, and all quotations are subject to confirmation.
      </p>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-md bg-[#10243B] text-white text-sm font-semibold shadow-sm hover:bg-[#193B59] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:opacity-60 cursor-pointer"
        >
          <Send className="w-4 h-4 text-[#FF5252]" />
          {submitting ? 'Submitting...' : 'Submit Enquiry'}
        </button>

        <button
          type="button"
          disabled={submitting}
          onClick={() => submitWithChannel('whatsapp')}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-md bg-[#15803D] text-white text-sm font-semibold shadow-sm hover:bg-[#166534] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:opacity-60 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp Chat
        </button>

        <button
          type="button"
          disabled={submitting}
          onClick={() => submitWithChannel('email')}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-md border border-[#193B59]/40 bg-white text-[#193B59] text-sm font-medium hover:bg-[#193B59]/10 hover:border-[#193B59] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 disabled:opacity-60 cursor-pointer"
        >
          <Mail className="w-4 h-4" />
          Submit &amp; Email Dispatch
        </button>
      </div>
    </form>
  );
}

export function EnquiryDrawer() {
  const { data, enquiryDrawerOpen, enquiryPrefill, closeEnquiryDrawer } = useApp();

  if (!enquiryDrawerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-[#10243B]/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-drawer-title"
    >
      <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl overflow-y-auto p-6 sm:p-8 border-l border-[#C9A45C]/30">
        <div className="flex items-start justify-between gap-4 pb-5 mb-6 border-b border-[#10243B]/10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#DC2626]">
              {data.settings.businessName || 'Oasis Travel & Tourism Consultancy Dubai'}
            </p>
            <h2 id="enquiry-drawer-title" className="font-display text-2xl sm:text-3xl font-semibold text-[#10243B] mt-1">
              {enquiryPrefill.subjectLabel || 'Start Your Journey'}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeEnquiryDrawer}
            aria-label="Close enquiry drawer"
            className="w-11 h-11 rounded-md flex items-center justify-center text-[#10243B] hover:bg-[#FAF8F3] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <EnquiryForm
          initialService={enquiryPrefill.serviceRequired}
          initialDestination={enquiryPrefill.destination}
          compact
        />
      </div>
    </div>
  );
}
