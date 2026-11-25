import React from 'react';
import { ArrowRight, ExternalLink, Film, FolderKanban, Image as ImageIcon, Youtube } from 'lucide-react';
import { DesignProjectItem } from '../types';
import { extractGoogleDriveEmbedUrl, extractYouTubeEmbedUrl } from '../lib/mediaEmbeds';
import { SafeImage } from './BrandMark';

interface ProjectShowcaseCardProps {
  project: DesignProjectItem;
  onEnquire?: (project: DesignProjectItem) => void;
}

export function ProjectShowcaseCard({ project, onEnquire }: ProjectShowcaseCardProps) {
  const youtubeEmbed = project.mediaType === 'youtube' ? extractYouTubeEmbedUrl(project.mediaUrl) : null;
  const gdriveEmbed = project.mediaType === 'gdrive' ? extractGoogleDriveEmbedUrl(project.mediaUrl) : null;

  const typeLabel =
    project.mediaType === 'youtube'
      ? 'YouTube Video'
      : project.mediaType === 'gdrive'
      ? 'Google Drive Media'
      : project.mediaType === 'video'
      ? 'Uploaded Video'
      : 'Project Image';

  const TypeIcon =
    project.mediaType === 'youtube'
      ? Youtube
      : project.mediaType === 'gdrive'
      ? FolderKanban
      : project.mediaType === 'video'
      ? Film
      : ImageIcon;

  return (
    <article className="bg-white border border-[#10243B]/10 rounded-lg overflow-hidden flex flex-col justify-between hover:border-[#C9A45C]/60 hover:shadow-md transition-all">
      <div>
        <div className="aspect-[16/9] bg-[#10243B]/5 overflow-hidden relative">
          {project.mediaType === 'youtube' && youtubeEmbed ? (
            <iframe
              src={youtubeEmbed}
              title={project.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : project.mediaType === 'gdrive' && gdriveEmbed ? (
            <iframe
              src={gdriveEmbed}
              title={project.title}
              allow="autoplay"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : project.mediaType === 'video' ? (
            <video
              src={project.mediaUrl}
              poster={project.thumbnailUrl || undefined}
              controls
              playsInline
              preload="metadata"
              className="w-full h-full object-cover bg-[#10243B]"
            />
          ) : (
            <SafeImage
              src={project.mediaUrl}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="p-6 space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-xs font-semibold">
            <span className="text-[#DC2626]">{project.category}</span>
            <span className="inline-flex items-center gap-1 text-[#748094]">
              <TypeIcon className="w-3.5 h-3.5 text-[#193B59]" />
              {typeLabel}
            </span>
          </div>
          <h3 className="font-display text-xl font-semibold text-[#10243B] leading-snug">
            {project.title}
          </h3>
          <p className="text-sm text-[#748094] leading-relaxed">{project.description}</p>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3 border-t border-[#10243B]/10">
        {onEnquire ? (
          <button
            type="button"
            onClick={() => onEnquire(project)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#193B59] hover:text-[#DC2626] transition-colors cursor-pointer"
          >
            Enquire About Concept
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <span />
        )}
        {(project.mediaType === 'youtube' || project.mediaType === 'gdrive') && (
          <a
            href={project.mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#748094] hover:text-[#10243B]"
          >
            Open Source
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </article>
  );
}
