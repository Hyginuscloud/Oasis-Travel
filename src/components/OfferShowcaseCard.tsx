import React from 'react';
import { ArrowRight, ExternalLink, Film, FolderKanban, Image as ImageIcon, MessageCircle, Youtube } from 'lucide-react';
import { SpecialOfferItem } from '../types';
import { extractGoogleDriveEmbedUrl, extractYouTubeEmbedUrl } from '../lib/mediaEmbeds';
import { SafeImage } from './BrandMark';

interface OfferShowcaseCardProps {
  offer: SpecialOfferItem;
  whatsappNumber?: string;
  onEnquire?: (offer: SpecialOfferItem) => void;
}

export function OfferShowcaseCard({ offer, whatsappNumber = '971525509694', onEnquire }: OfferShowcaseCardProps) {
  const youtubeEmbed = offer.mediaType === 'youtube' ? extractYouTubeEmbedUrl(offer.mediaUrl) : null;
  const gdriveEmbed = offer.mediaType === 'gdrive' ? extractGoogleDriveEmbedUrl(offer.mediaUrl) : null;
  const cleanWa = whatsappNumber.replace(/[^0-9]/g, '') || '971525509694';
  const waHref = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
    `Hello Oasis Travel Consultancy Dubai, I would like to enquire about your Special Offer: "${offer.title}".`
  )}`;

  const typeLabel =
    offer.mediaType === 'youtube'
      ? 'YouTube Feature'
      : offer.mediaType === 'gdrive'
        ? 'Google Drive Media'
        : offer.mediaType === 'video'
          ? 'Video Offer'
          : 'Featured Promotion';

  const TypeIcon =
    offer.mediaType === 'youtube'
      ? Youtube
      : offer.mediaType === 'gdrive'
        ? FolderKanban
        : offer.mediaType === 'video'
          ? Film
          : ImageIcon;

  return (
    <article className="bg-white border border-[#C9A45C]/35 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:border-[#C9A45C] hover:shadow-md transition-all">
      <div>
        <div className="aspect-[16/9] bg-[#10243B]/5 overflow-hidden relative">
          {offer.mediaType === 'youtube' && youtubeEmbed ? (
            <iframe
              src={youtubeEmbed}
              title={offer.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : offer.mediaType === 'gdrive' && gdriveEmbed ? (
            <iframe
              src={gdriveEmbed}
              title={offer.title}
              allow="autoplay"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : offer.mediaType === 'video' ? (
            <video
              src={offer.mediaUrl}
              poster={offer.thumbnailUrl || undefined}
              controls
              playsInline
              preload="metadata"
              className="w-full h-full object-cover bg-[#10243B]"
            />
          ) : (
            <SafeImage
              src={offer.mediaUrl}
              alt={offer.title}
              className="w-full h-full object-cover"
            />
          )}

          {offer.badge && (
            <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-md bg-[#10243B]/90 text-[#FF5252] text-[11px] font-semibold tracking-wide shadow-sm">
              {offer.badge}
            </span>
          )}
        </div>

        <div className="p-6 space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-xs font-semibold">
            <span className="text-[#DC2626]">Special Offer</span>
            <span className="inline-flex items-center gap-1 text-[#748094]">
              <TypeIcon className="w-3.5 h-3.5 text-[#193B59]" />
              {typeLabel}
            </span>
          </div>
          <h3 className="font-display text-xl font-semibold text-[#10243B] leading-snug">
            {offer.title}
          </h3>
          <p className="text-sm text-[#475569] leading-relaxed">{offer.description}</p>
        </div>
      </div>

      <div className="px-6 pb-6 pt-3 flex items-center justify-between gap-2.5 border-t border-[#10243B]/10">
        {onEnquire ? (
          <button
            type="button"
            onClick={() => onEnquire(offer)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-xl bg-[#10243B] text-white text-xs font-semibold hover:bg-[#193B59] transition-colors cursor-pointer"
          >
            Enquire About Offer
            <ArrowRight className="w-3.5 h-3.5 text-[#FF5252]" />
          </button>
        ) : (
          <span />
        )}
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp about ${offer.title}`}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[42px] rounded-xl bg-[#15803D] text-white text-xs font-semibold hover:bg-[#166534] transition-colors shrink-0"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          WhatsApp
        </a>
        {(offer.mediaType === 'youtube' || offer.mediaType === 'gdrive') && (
          <a
            href={offer.mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open media link for ${offer.title}`}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-[#10243B]/15 text-[#748094] hover:text-[#10243B] shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </article>
  );
}
