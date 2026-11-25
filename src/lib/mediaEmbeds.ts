export function normalizeExternalMediaUrl(rawUrl: string): string {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return '';

  // Extract src if user pasted a full <iframe> HTML snippet
  const iframeSrcMatch = /src=["']([^"']+)["']/i.exec(trimmed);
  const candidate = (iframeSrcMatch ? iframeSrcMatch[1] : trimmed).trim();

  if (/^data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=\s]+$/i.test(candidate)) {
    return candidate.replace(/\s+/g, '');
  }
  if (candidate.startsWith('/src/assets/') || candidate.startsWith('/uploads/')) {
    return candidate;
  }
  if (/^https?:\/\//i.test(candidate)) {
    return candidate;
  }
  if (candidate.startsWith('//')) {
    return `https:${candidate}`;
  }
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(candidate)) {
    return `https://${candidate}`;
  }
  return candidate;
}

export function isSafeHttpOrLocalUrl(rawUrl: string): boolean {
  const normalized = normalizeExternalMediaUrl(rawUrl);
  if (!normalized) return false;
  if (/^data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(normalized)) return true;
  if (normalized.startsWith('/src/assets/') || normalized.startsWith('/uploads/')) return true;
  try {
    const parsed = new URL(normalized);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function extractYouTubeEmbedUrl(rawUrl: string): string | null {
  try {
    const normalized = normalizeExternalMediaUrl(rawUrl);
    if (!normalized) return null;
    const parsed = new URL(normalized);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    const host = parsed.hostname.replace(/^(www\.|m\.|music\.)/, '').toLowerCase();

    let videoId = '';
    if (host === 'youtu.be') {
      videoId = parsed.pathname.split('/').filter(Boolean)[0] || '';
    } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      const segments = parsed.pathname.split('/').filter(Boolean);
      if (parsed.pathname === '/watch' || parsed.searchParams.has('v')) {
        videoId = parsed.searchParams.get('v') || '';
      } else if (segments[0] === 'embed' || segments[0] === 'shorts' || segments[0] === 'live' || segments[0] === 'v') {
        videoId = segments[1] || '';
      }
    }

    if (!/^[A-Za-z0-9_-]{6,20}$/.test(videoId)) return null;
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
  } catch {
    return null;
  }
}

export function extractGoogleDriveEmbedUrl(rawUrl: string): string | null {
  try {
    const normalized = normalizeExternalMediaUrl(rawUrl);
    if (!normalized) return null;
    const parsed = new URL(normalized);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    if (host !== 'drive.google.com' && host !== 'docs.google.com') return null;

    // Match folder share URL: /drive/folders/FOLDER_ID or /drive/u/0/folders/FOLDER_ID
    const folderMatch = /\/folders\/([A-Za-z0-9_-]{10,120})/.exec(parsed.pathname);
    if (folderMatch) {
      return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#grid`;
    }

    // Match file / document / presentation URL: /d/FILE_ID or /file/u/0/d/FILE_ID
    let fileId = '';
    const dMatch = /\/d\/([A-Za-z0-9_-]{10,120})/.exec(parsed.pathname);
    if (dMatch) {
      fileId = dMatch[1];
    } else {
      const qId = parsed.searchParams.get('id') || '';
      if (/^[A-Za-z0-9_-]{10,120}$/.test(qId)) {
        fileId = qId;
      }
    }

    if (!fileId) return null;
    return `https://drive.google.com/file/d/${fileId}/preview`;
  } catch {
    return null;
  }
}
