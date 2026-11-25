import React, { useEffect, useId, useState } from 'react';
import { Compass } from 'lucide-react';

export function BrandMark({
  className = 'w-9 h-9',
  logoUrl,
  alt = 'Oasis Travel & Tourism Consultancy Logo',
}: {
  className?: string;
  logoUrl?: string;
  alt?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const gradBg = `oasis-ng-${uid}`;
  const gradGold = `oasis-gd-${uid}`;
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [logoUrl]);

  if (logoUrl && logoUrl.trim() && !imgFailed) {
    return (
      <img
        src={logoUrl}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className={`${className} object-contain rounded-lg border border-[#C9A45C]/40 bg-white p-0.5`}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradBg} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#193B59" />
          <stop offset="100%" stopColor="#0C1C2F" />
        </linearGradient>
        <linearGradient id={gradGold} x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F3DDA8" />
          <stop offset="55%" stopColor="#C9A45C" />
          <stop offset="100%" stopColor="#9C7A35" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${gradBg})`} stroke={`url(#${gradGold})`} strokeWidth="1.5" />
      <rect x="5.5" y="5.5" width="37" height="37" rx="9" stroke="#E4C98D" strokeOpacity="0.28" strokeWidth="0.9" />

      <path
        d="M10 30.5C14.5 26 19.2 24.2 24 24.2C28.8 24.2 33.5 26 38 30.5"
        stroke={`url(#${gradGold})`}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M13.5 34.5C17 32.2 20.5 31.2 24 31.2C27.5 31.2 31 32.2 34.5 34.5"
        stroke="#E4C98D"
        strokeOpacity="0.65"
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      <path d="M24 9.5L26.5 21.2L24 23.2L21.5 21.2L24 9.5Z" fill={`url(#${gradGold})`} />
      <path
        d="M14.5 24.4C16.8 19 20.1 16.4 24 15.1C27.9 16.4 31.2 19 33.5 24.4"
        stroke="#FAF8F3"
        strokeOpacity="0.75"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="24" cy="7.3" r="1.3" fill="#FAF8F3" />
    </svg>
  );
}

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function SafeImage({ src, alt, className = '', fallbackTitle }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#10243B] via-[#193B59] to-[#234B6E] text-[#FAF8F3] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Compass className="w-8 h-8 text-[#FF5252] mb-2 opacity-80" strokeWidth={1.5} />
        <span className="font-display text-sm font-medium text-[#FAF8F3]">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
