import React, { useEffect, useState } from 'react';
import { ArrowUp, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.76 14.08c-.24.68-1.41 1.3-1.95 1.38-.5.07-1.13.1-1.82-.12-.42-.14-.96-.32-1.65-.62-2.9-1.26-4.79-4.18-4.94-4.38-.14-.2-1.18-1.57-1.18-3s.75-2.13 1.01-2.42c.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.59.82 2.02.9 2.17.07.15.12.32.02.52-.1.2-.15.32-.29.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.36 1.45.29.15.46.12.64-.07.17-.2.74-.86.94-1.16.2-.3.39-.25.66-.15.27.1 1.71.81 2 .95.29.15.49.22.56.34.07.12.07.7-.17 1.38Z" />
    </svg>
  );
}

export function FloatingActions() {
  const { data } = useApp();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 420);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const waNumber = (data.settings.whatsappNumber || '971525509694').replace(/[^0-9]/g, '');
  const whatsappHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    'Hello Oasis Travel and Tourism Consultancy Dubai, I would like to make a travel enquiry.'
  )}`;

  return (
    <div
      className="fixed right-3.5 sm:right-5 z-40 flex flex-col items-end gap-2.5"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          title="Back to top"
          className="w-11 h-11 rounded-md bg-[#10243B] text-[#FF5252] border border-[#C9A45C]/45 shadow-lg flex items-center justify-center hover:bg-[#193B59] hover:border-[#E4C98D] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Oasis on WhatsApp"
        className="animate-gentle-float hover:animate-none group relative inline-flex items-center gap-2 sm:gap-2.5 pl-2.5 pr-3.5 py-2 sm:pl-3 sm:pr-4 sm:py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white border border-white/25 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
      >
        <span className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/15 shrink-0">
          <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </span>
        <span className="text-left leading-tight">
          <span className="block text-xs sm:text-sm font-semibold tracking-tight whitespace-nowrap">
            WhatsApp Chat
          </span>
          <span className="hidden sm:block text-[10px] text-white/85 whitespace-nowrap">
            Chat with Oasis Dubai
          </span>
        </span>
        <ExternalLink className="w-3.5 h-3.5 opacity-80 hidden sm:inline-block" />
      </a>
    </div>
  );
}
