import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Check,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileQuestion,
  FolderKanban,
  Globe2,
  HardDrive,
  Image as ImageIcon,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  Megaphone,
  MessageSquareQuote,
  Package,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  Sparkles,
  Trash2,
  Upload,
  UserPlus,
  Video,
  Youtube,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  AdminAccountItem,
  DashboardUserItem,
  DesignProjectItem,
  DestinationItem,
  EnquiryItem,
  FaqItem,
  MediaAssetItem,
  PackageItem,
  ProjectMediaType,
  ServiceItem,
  SpecialOfferItem,
  TestimonialItem,
  parseStringList,
} from '../types';
import { extractGoogleDriveEmbedUrl, extractYouTubeEmbedUrl, normalizeExternalMediaUrl } from '../lib/mediaEmbeds';
import { BrandMark, SafeImage } from '../components/BrandMark';
import { PageMeta } from '../components/PageMeta';

type AdminTab =
  | 'overview'
  | 'offers'
  | 'projects'
  | 'enquiries'
  | 'packages'
  | 'destinations'
  | 'services'
  | 'reviews'
  | 'faqs'
  | 'media'
  | 'settings'
  | 'security';

interface DashboardBundle {
  enquiries: EnquiryItem[];
  destinations: DestinationItem[];
  packages: PackageItem[];
  services: ServiceItem[];
  testimonials: TestimonialItem[];
  faqs: FaqItem[];
  settings: Record<string, string>;
  mediaAssets: MediaAssetItem[];
  admins: AdminAccountItem[];
  designProjects: DesignProjectItem[];
  specialOffers: SpecialOfferItem[];
  managers: DashboardUserItem[];
}

interface AuthStatusInfo {
  envPasscodeConfigured: boolean;
  hasClaimedAdmin: boolean;
  requiresSetup: boolean;
  dbConnected?: boolean;
  dbError?: string;
}

export function AdminPage() {
  const navigate = useNavigate();
  const {
    data: publicData,
    authUser,
    passwordUser,
    isAuthenticated,
    authLoading,
    getIdToken,
    signInWithGoogle,
    signInWithPassword,
    setupInitialAdmin,
    signOutAdmin,
    refreshPublicData,
  } = useApp();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [loadingDash, setLoadingDash] = useState(false);
  const [bundle, setBundle] = useState<DashboardBundle | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Auth status & forms
  const [authStatus, setAuthStatus] = useState<AuthStatusInfo | null>(null);
  const [checkingAuthStatus, setCheckingAuthStatus] = useState(true);
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [setupDisplayName, setSetupDisplayName] = useState('Primary Administrator');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authFormError, setAuthFormError] = useState<string | null>(null);
  const [forceLoginView, setForceLoginView] = useState(false);

  // Design Projects state
  const [editingProjId, setEditingProjId] = useState<number | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState('Bespoke Itinerary');
  const [projDesc, setProjDesc] = useState('');
  const [projMediaType, setProjMediaType] = useState<ProjectMediaType>('image');
  const [projMediaUrl, setProjMediaUrl] = useState('');
  const [projThumbUrl, setProjThumbUrl] = useState('');
  const [projSortOrder, setProjSortOrder] = useState('0');
  const [projFeatured, setProjFeatured] = useState(true);
  const [projPublished, setProjPublished] = useState(true);
  const [projFormFeedback, setProjFormFeedback] = useState<{ type: 'error' | 'ok'; msg: string } | null>(null);

  // Special Offers state (Image Upload, Video Upload, YouTube Link, Google Drive Link)
  const [editingOfferId, setEditingOfferId] = useState<number | null>(null);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerBadge, setOfferBadge] = useState('Special Offer');
  const [offerDesc, setOfferDesc] = useState('');
  const [offerMediaType, setOfferMediaType] = useState<ProjectMediaType>('image');
  const [offerMediaUrl, setOfferMediaUrl] = useState('');
  const [offerThumbUrl, setOfferThumbUrl] = useState('');
  const [offerSortOrder, setOfferSortOrder] = useState('0');
  const [offerFeatured, setOfferFeatured] = useState(true);
  const [offerPublished, setOfferPublished] = useState(true);
  const [offerFormFeedback, setOfferFormFeedback] = useState<{ type: 'error' | 'ok'; msg: string } | null>(null);

  // Live Top Bar Latest Update Quick Publisher state
  const [latestUpdateQuick, setLatestUpdateQuick] = useState('');
  const [hoursWeekdayQuick, setHoursWeekdayQuick] = useState('');
  const [savingLatestUpdate, setSavingLatestUpdate] = useState(false);

  // Enquiries filters & drawer selection
  const [enqSearch, setEnqSearch] = useState('');
  const [enqStatusFilter, setEnqStatusFilter] = useState('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryItem | null>(null);
  const [enqStatusDraft, setEnqStatusDraft] = useState<EnquiryItem['status']>('pending');
  const [enqNotesDraft, setEnqNotesDraft] = useState('');

  const [viewAllSections, setViewAllSections] = useState(false);

  // Packages form state
  const [pkgTitle, setPkgTitle] = useState('');
  const [pkgCategory, setPkgCategory] = useState('Honeymoon');
  const [pkgDuration, setPkgDuration] = useState('5 to 7 Nights');
  const [pkgDesc, setPkgDesc] = useState('');
  const [pkgInclusions, setPkgInclusions] = useState('');
  const [pkgPriceNote, setPkgPriceNote] = useState('Custom quotation upon enquiry');
  const [pkgAvailability, setPkgAvailability] = useState('Enquiry & Custom Quote');
  const [pkgImage, setPkgImage] = useState('/src/assets/images/hero_dubai_skyline_1795373922438.jpg');
  const [pkgFeatured, setPkgFeatured] = useState(true);
  const [pkgSortOrder, setPkgSortOrder] = useState('0');
  const [editingPkgId, setEditingPkgId] = useState<number | null>(null);

  // Destinations form state
  const [destName, setDestName] = useState('');
  const [destRegion, setDestRegion] = useState('Dubai & UAE');
  const [destCountry, setDestCountry] = useState('United Arab Emirates');
  const [destDesc, setDestDesc] = useState('');
  const [destHighlights, setDestHighlights] = useState('');
  const [destImage, setDestImage] = useState('/src/assets/images/dest_desert_luxury_1795373923125.jpg');
  const [destFeatured, setDestFeatured] = useState(true);
  const [destSortOrder, setDestSortOrder] = useState('0');
  const [editingDestId, setEditingDestId] = useState<number | null>(null);

  // Services create / edit state (supports Image Upload, Video Upload, YouTube Link, Google Drive Link)
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [svcCode, setSvcCode] = useState('');
  const [svcTitle, setSvcTitle] = useState('');
  const [svcCategory, setSvcCategory] = useState('');
  const [svcDesc, setSvcDesc] = useState('');
  const [svcItems, setSvcItems] = useState('');
  const [svcIconName, setSvcIconName] = useState('Compass');
  const [svcMediaType, setSvcMediaType] = useState<ProjectMediaType>('image');
  const [svcMediaUrl, setSvcMediaUrl] = useState('');
  const [svcImage, setSvcImage] = useState('');
  const [svcSortOrder, setSvcSortOrder] = useState('0');
  const [svcFormFeedback, setSvcFormFeedback] = useState<{ type: 'error' | 'ok'; msg: string } | null>(null);

  // Testimonials form state
  const [editingRevId, setEditingRevId] = useState<number | null>(null);
  const [revAuthor, setRevAuthor] = useState('');
  const [revOrigin, setRevOrigin] = useState('');
  const [revService, setRevService] = useState('');
  const [revRating, setRevRating] = useState('5');
  const [revQuote, setRevQuote] = useState('');
  const [revSummary, setRevSummary] = useState('');
  const [revIsPlaceholder, setRevIsPlaceholder] = useState(false);
  const [revLink, setRevLink] = useState('');

  // FAQ form state
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);
  const [faqCategory, setFaqCategory] = useState('UAE Visas');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqSortOrder, setFaqSortOrder] = useState('0');

  // Media upload state
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaCategory, setMediaCategory] = useState('Dubai & Resorts');
  const [mediaAlt, setMediaAlt] = useState('');
  const [mediaDataUrl, setMediaDataUrl] = useState('');
  const [mediaFileName, setMediaFileName] = useState('');
  const [mediaExternalUrl, setMediaExternalUrl] = useState('');

  // Site settings draft
  const [settingsDraft, setSettingsDraft] = useState<Record<string, string>>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<{ type: 'ok' | 'error'; msg: string } | null>(null);

  // Security & Managers state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [mgrUsername, setMgrUsername] = useState('');
  const [mgrDisplayName, setMgrDisplayName] = useState('');
  const [mgrPassword, setMgrPassword] = useState('');
  const [mgrRole, setMgrRole] = useState<'manager' | 'super_admin'>('manager');
  const [resetPwdMap, setResetPwdMap] = useState<Record<number, string>>({});
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'super_admin'>('admin');

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const exitToPublicSite = () => {
    window.history.replaceState(null, '', '/');
    if (window.location.hash) {
      window.location.hash = '';
    }
    navigate('/');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  const loadAuthStatus = useCallback(async () => {
    setCheckingAuthStatus(true);
    try {
      const res = await fetch('/api/auth/status');
      const text = await res.text();
      if (res.ok) {
        const json = JSON.parse(text) as AuthStatusInfo;
        setAuthStatus(json);
      } else {
        const snippet = text
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 180);
        setAuthFormError(
          `Authentication API returned HTTP ${res.status}${snippet ? `: ${snippet}` : '. Verify Vercel API & database settings.'}`
        );
      }
    } catch {
      setAuthFormError('Unable to reach authentication server. Please refresh and try again.');
    } finally {
      setCheckingAuthStatus(false);
    }
  }, []);

  useEffect(() => {
    loadAuthStatus();
  }, [loadAuthStatus]);

  const apiFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        let parsedError = '';
        try {
          const body = JSON.parse(text) as { error?: string };
          parsedError = body.error || '';
        } catch {
          // non-JSON response
        }
        const snippet = text
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 180);
        throw new Error(
          parsedError ||
            (res.status === 413
              ? 'Uploaded payload is too large for one request. Upload a smaller image or paste an image URL.'
              : `Request failed (HTTP ${res.status})${snippet ? `: ${snippet}` : ''}`)
        );
      }
      return res;
    },
    [getIdToken]
  );

  const loadDashboard = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingDash(true);
    setAccessError(null);
    try {
      const meRes = await apiFetch('/api/admin/me');
      const me = await meRes.json();
      setAdminRole(me.role);

      const dashRes = await apiFetch('/api/admin/dashboard');
      const data = (await dashRes.json()) as DashboardBundle;
      setBundle(data);
      setSettingsDraft(data.settings || {});
      setLatestUpdateQuick(data.settings?.latestUpdate || '');
      setHoursWeekdayQuick(data.settings?.hoursWeekday || '');
    } catch (err: unknown) {
      setAccessError(err instanceof Error ? err.message : 'Unable to access administrator dashboard.');
      setBundle(null);
    } finally {
      setLoadingDash(false);
    }
  }, [isAuthenticated, apiFetch]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard();
    } else {
      setBundle(null);
      setAdminRole(null);
      setAccessError(null);
    }
  }, [isAuthenticated, loadDashboard]);

  // Direct file upload helper used across Logo, Settings images, Projects (image/video), Packages, Destinations, Services
  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('Could not read file.'));
      };
      reader.onerror = () => reject(new Error('Could not read file.'));
      reader.readAsDataURL(file);
    });
  }

  function optimizeImageDataUrlForUpload(
    rawDataUrl: string,
    file: File,
    maxDimension: number
  ): Promise<string> {
    return new Promise((resolve) => {
      if (file.type === 'image/svg+xml' || file.type === 'image/gif' || file.size <= 1.5 * 1024 * 1024) {
        resolve(rawDataUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        try {
          const scale = Math.min(1, maxDimension / Math.max(img.width || 1, img.height || 1));
          const targetW = Math.max(1, Math.round(img.width * scale));
          const targetH = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, targetW, targetH);
          const outMime = file.type === 'image/png' ? 'image/webp' : 'image/jpeg';
          const compressed = canvas.toDataURL(outMime, 0.86);
          resolve(compressed.length < rawDataUrl.length ? compressed : rawDataUrl);
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    });
  }

  async function uploadAssetFile(
    file: File,
    fieldKey: string,
    title: string,
    category: string,
    kind: 'image' | 'video',
    skipLibrary = true
  ): Promise<string | null> {
    const maxBytes = kind === 'video' ? 50 * 1024 * 1024 : 15 * 1024 * 1024;
    if (file.size > maxBytes) {
      const msg = kind === 'video' ? 'Please choose a video up to 50 MB.' : 'Please choose an image up to 15 MB.';
      notify(msg);
      return null;
    }
    setUploadingField(fieldKey);
    try {
      const rawDataUrl = await readFileAsDataUrl(file);
      const dataUrl =
        kind === 'image'
          ? await optimizeImageDataUrlForUpload(rawDataUrl, file, fieldKey === 'logoUrl' ? 900 : 1800)
          : rawDataUrl;
      const res = await apiFetch('/api/admin/media/upload', {
        method: 'POST',
        body: JSON.stringify({
          title: title || file.name,
          category,
          altText: title || file.name,
          fileName: file.name,
          dataUrl,
          skipLibrary,
        }),
      });
      const json = await res.json();
      notify(`${kind === 'video' ? 'Video' : 'Image'} uploaded successfully.`);
      return String(json.url || '');
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Upload failed.');
      return null;
    } finally {
      setUploadingField(null);
    }
  }

  async function handlePasswordLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthFormError(null);
    setAuthBusy(true);
    try {
      await signInWithPassword(loginUsername, loginPassword);
      setLoginPassword('');
    } catch (err: unknown) {
      setAuthFormError(err instanceof Error ? err.message : 'Invalid credentials.');
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleInitialSetupSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthFormError(null);
    if (setupPassword.length < 6) {
      setAuthFormError('Password must be at least 6 characters.');
      return;
    }
    if (setupPassword !== setupConfirm) {
      setAuthFormError('Passwords do not match.');
      return;
    }
    setAuthBusy(true);
    try {
      await setupInitialAdmin(setupPassword, setupDisplayName);
      setSetupPassword('');
      setSetupConfirm('');
      await loadAuthStatus();
    } catch (err: unknown) {
      setAuthFormError(err instanceof Error ? err.message : 'Unable to complete initial setup.');
    } finally {
      setAuthBusy(false);
    }
  }

  const filteredEnquiries = useMemo(() => {
    if (!bundle) return [];
    const q = enqSearch.trim().toLowerCase();
    return bundle.enquiries.filter((e) => {
      const statusOk = enqStatusFilter === 'all' || e.status === enqStatusFilter;
      const qOk =
        !q ||
        e.fullName.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.referenceNumber.toLowerCase().includes(q) ||
        e.destination.toLowerCase().includes(q) ||
        e.serviceRequired.toLowerCase().includes(q);
      return statusOk && qOk;
    });
  }, [bundle, enqSearch, enqStatusFilter]);

  async function handleExportCsv() {
    try {
      const token = await getIdToken();
      if (!token) return;
      const res = await fetch('/api/admin/enquiries/export', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `oasis-enquiries-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      notify('Enquiries CSV exported.');
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Export failed.');
    }
  }

  async function handleSaveProject(e: React.FormEvent) {
    e.preventDefault();
    setProjFormFeedback(null);
    const normalizedUrl = normalizeExternalMediaUrl(projMediaUrl);
    if (!normalizedUrl) {
      const msg =
        projMediaType === 'image'
          ? 'Please upload an image file or paste an image URL first.'
          : projMediaType === 'video'
            ? 'Please upload a video file or paste a video URL first.'
            : projMediaType === 'youtube'
              ? 'Please enter a valid YouTube video or Shorts URL.'
              : 'Please enter a valid Google Drive share link.';
      setProjFormFeedback({ type: 'error', msg });
      notify(msg);
      return;
    }
    if (projMediaType === 'youtube' && !extractYouTubeEmbedUrl(normalizedUrl)) {
      const msg = 'Could not read this YouTube link. Use a full youtube.com/watch?v=... or youtu.be/... URL.';
      setProjFormFeedback({ type: 'error', msg });
      notify(msg);
      return;
    }
    if (projMediaType === 'gdrive' && !extractGoogleDriveEmbedUrl(normalizedUrl)) {
      const msg = 'Could not read this Google Drive link. Use drive.google.com/file/d/... or drive.google.com/open?id=...';
      setProjFormFeedback({ type: 'error', msg });
      notify(msg);
      return;
    }

    try {
      const payload = {
        title: projTitle,
        category: projCategory,
        description: projDesc,
        mediaType: projMediaType,
        mediaUrl: normalizedUrl,
        thumbnailUrl: projThumbUrl ? normalizeExternalMediaUrl(projThumbUrl) : null,
        sortOrder: Number(projSortOrder || 0),
        featured: projFeatured,
        published: projPublished,
      };
      if (editingProjId) {
        await apiFetch(`/api/admin/projects/${editingProjId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setProjFormFeedback({ type: 'ok', msg: 'Design project updated and live on website.' });
        notify('Design project updated.');
      } else {
        await apiFetch('/api/admin/projects', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setProjFormFeedback({ type: 'ok', msg: 'Design project published to website!' });
        notify('Design project published to frontend.');
      }
      setEditingProjId(null);
      setProjTitle('');
      setProjDesc('');
      setProjMediaUrl('');
      setProjThumbUrl('');
      setProjSortOrder('0');
      await Promise.all([loadDashboard(), refreshPublicData()]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save design project.';
      setProjFormFeedback({ type: 'error', msg });
      notify(msg);
    }
  }

  function resetOfferForm() {
    setEditingOfferId(null);
    setOfferTitle('');
    setOfferBadge('Special Offer');
    setOfferDesc('');
    setOfferMediaType('image');
    setOfferMediaUrl('');
    setOfferThumbUrl('');
    setOfferSortOrder('0');
    setOfferFeatured(true);
    setOfferPublished(true);
  }

  async function handleSaveOffer(e: React.FormEvent) {
    e.preventDefault();
    setOfferFormFeedback(null);
    const normalizedUrl = normalizeExternalMediaUrl(offerMediaUrl);
    if (!normalizedUrl) {
      const msg =
        offerMediaType === 'image'
          ? 'Please upload an offer image or paste an image URL first.'
          : offerMediaType === 'video'
            ? 'Please upload an offer video or paste a video URL first.'
            : offerMediaType === 'youtube'
              ? 'Please enter a valid YouTube video or Shorts URL.'
              : 'Please enter a valid Google Drive share link.';
      setOfferFormFeedback({ type: 'error', msg });
      notify(msg);
      return;
    }
    if (offerMediaType === 'youtube' && !extractYouTubeEmbedUrl(normalizedUrl)) {
      const msg = 'Could not read this YouTube link. Use a full youtube.com/watch?v=... or youtu.be/... URL.';
      setOfferFormFeedback({ type: 'error', msg });
      notify(msg);
      return;
    }
    if (offerMediaType === 'gdrive' && !extractGoogleDriveEmbedUrl(normalizedUrl)) {
      const msg = 'Could not read this Google Drive link. Use drive.google.com/file/d/... or drive.google.com/open?id=...';
      setOfferFormFeedback({ type: 'error', msg });
      notify(msg);
      return;
    }

    try {
      const payload = {
        title: offerTitle,
        badge: offerBadge.trim() || 'Special Offer',
        description: offerDesc,
        mediaType: offerMediaType,
        mediaUrl: normalizedUrl,
        thumbnailUrl: offerThumbUrl ? normalizeExternalMediaUrl(offerThumbUrl) : null,
        sortOrder: Number(offerSortOrder || 0),
        featured: offerFeatured,
        published: offerPublished,
      };
      if (editingOfferId) {
        await apiFetch(`/api/admin/offers/${editingOfferId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setOfferFormFeedback({ type: 'ok', msg: 'Special offer updated and live on website!' });
        notify('Special offer updated on website.');
      } else {
        await apiFetch('/api/admin/offers', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setOfferFormFeedback({ type: 'ok', msg: 'Special offer published immediately on website!' });
        notify('Special offer published to frontend!');
      }
      resetOfferForm();
      await Promise.all([loadDashboard(), refreshPublicData()]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save special offer.';
      setOfferFormFeedback({ type: 'error', msg });
      notify(msg);
    }
  }

  async function handleQuickPublishLatestUpdate(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = latestUpdateQuick.trim();
    if (!cleaned) {
      notify('Please enter a Latest Update announcement first.');
      return;
    }
    setSavingLatestUpdate(true);
    try {
      const nextSettings: Record<string, string> = {
        ...settingsDraft,
        latestUpdate: cleaned,
      };
      if (hoursWeekdayQuick.trim()) {
        nextSettings.hoursWeekday = hoursWeekdayQuick.trim();
      }
      await apiFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings: nextSettings }),
      });
      setSettingsDraft(nextSettings);
      notify('Latest Update & Opening Hours published to live top bar!');
      await Promise.all([loadDashboard(), refreshPublicData()]);
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to publish Latest Update.');
    } finally {
      setSavingLatestUpdate(false);
    }
  }

  async function handleSaveEnquiry(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEnquiry) return;
    try {
      await apiFetch(`/api/admin/enquiries/${selectedEnquiry.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: enqStatusDraft, adminNotes: enqNotesDraft }),
      });
      notify(`Updated ${selectedEnquiry.referenceNumber} to ${enqStatusDraft}.`);
      setSelectedEnquiry(null);
      await loadDashboard();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to update enquiry.');
    }
  }

  async function handleDeleteEnquiry(id: number) {
    try {
      await apiFetch(`/api/admin/enquiries/${id}`, { method: 'DELETE' });
      if (selectedEnquiry?.id === id) setSelectedEnquiry(null);
      notify('Enquiry deleted.');
      await loadDashboard();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Delete failed.');
    }
  }

  async function handleSavePackage(e: React.FormEvent) {
    e.preventDefault();
    try {
      const inclusionsArr = pkgInclusions
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        title: pkgTitle,
        category: pkgCategory,
        suggestedDuration: pkgDuration,
        description: pkgDesc,
        inclusions: inclusionsArr,
        priceNote: pkgPriceNote,
        availabilityStatus: pkgAvailability,
        imageUrl: pkgImage,
        featured: pkgFeatured,
        sortOrder: Number(pkgSortOrder || 0),
      };
      if (editingPkgId) {
        await apiFetch(`/api/admin/packages/${editingPkgId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        notify('Package updated.');
      } else {
        await apiFetch('/api/admin/packages', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        notify('Package created.');
      }
      setEditingPkgId(null);
      setPkgTitle('');
      setPkgDesc('');
      setPkgInclusions('');
      setPkgFeatured(true);
      setPkgSortOrder('0');
      await Promise.all([loadDashboard(), refreshPublicData()]);
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to save package.');
    }
  }

  async function handleSaveDestination(e: React.FormEvent) {
    e.preventDefault();
    try {
      const highlightsArr = destHighlights
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        name: destName,
        region: destRegion,
        country: destCountry,
        shortDescription: destDesc,
        highlights: highlightsArr,
        imageUrl: destImage,
        featured: destFeatured,
        sortOrder: Number(destSortOrder || 0),
      };
      if (editingDestId) {
        await apiFetch(`/api/admin/destinations/${editingDestId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        notify('Destination updated.');
      } else {
        await apiFetch('/api/admin/destinations', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        notify('Destination added.');
      }
      setEditingDestId(null);
      setDestName('');
      setDestDesc('');
      setDestHighlights('');
      setDestFeatured(true);
      setDestSortOrder('0');
      await Promise.all([loadDashboard(), refreshPublicData()]);
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to save destination.');
    }
  }

  function resetServiceForm() {
    setEditingServiceId(null);
    setSvcCode('');
    setSvcTitle('');
    setSvcCategory('');
    setSvcDesc('');
    setSvcItems('');
    setSvcIconName('Compass');
    setSvcMediaType('image');
    setSvcMediaUrl('');
    setSvcImage('');
    setSvcSortOrder('0');
  }

  async function handleSaveService(e: React.FormEvent) {
    e.preventDefault();
    setSvcFormFeedback(null);
    const itemsArr = svcItems
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const normalizedInputUrl = normalizeExternalMediaUrl(svcMediaUrl);
    const resolvedMedia =
      svcMediaType === 'image'
        ? normalizedInputUrl || normalizeExternalMediaUrl(svcImage)
        : normalizedInputUrl;

    if (svcMediaType !== 'image' && !resolvedMedia) {
      const msg =
        svcMediaType === 'video'
          ? 'Please upload a video file or paste a video URL first.'
          : svcMediaType === 'youtube'
            ? 'Please enter a valid YouTube video or Shorts URL.'
            : 'Please enter a valid Google Drive share link.';
      setSvcFormFeedback({ type: 'error', msg });
      notify(msg);
      return;
    }
    if (svcMediaType === 'youtube' && !extractYouTubeEmbedUrl(resolvedMedia)) {
      const msg = 'Could not read this YouTube link. Use a full youtube.com/watch?v=... or youtu.be/... URL.';
      setSvcFormFeedback({ type: 'error', msg });
      notify(msg);
      return;
    }
    if (svcMediaType === 'gdrive' && !extractGoogleDriveEmbedUrl(resolvedMedia)) {
      const msg = 'Could not read this Google Drive link. Use drive.google.com/file/d/... or drive.google.com/open?id=...';
      setSvcFormFeedback({ type: 'error', msg });
      notify(msg);
      return;
    }

    try {
      const payload = {
        code: svcCode.trim() || undefined,
        title: svcTitle,
        category: svcCategory,
        description: svcDesc,
        items: itemsArr,
        iconName: svcIconName || 'Compass',
        mediaType: svcMediaType,
        mediaUrl: resolvedMedia || undefined,
        imageUrl:
          svcMediaType === 'image'
            ? resolvedMedia || undefined
            : svcImage.trim()
              ? normalizeExternalMediaUrl(svcImage)
              : undefined,
        sortOrder: Number(svcSortOrder || 0),
      };

      if (editingServiceId) {
        await apiFetch(`/api/admin/services/${editingServiceId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSvcFormFeedback({ type: 'ok', msg: 'Service division updated and published live.' });
        notify('Service division updated and published.');
      } else {
        await apiFetch('/api/admin/services', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setSvcFormFeedback({ type: 'ok', msg: 'New service division published live!' });
        notify('New service division created and published live.');
      }
      resetServiceForm();
      await Promise.all([loadDashboard(), refreshPublicData()]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save service division.';
      setSvcFormFeedback({ type: 'error', msg });
      notify(msg);
    }
  }

  async function handleSaveTestimonial(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        authorName: revAuthor,
        origin: revOrigin,
        serviceUsed: revService,
        rating: Number(revRating),
        quote: revQuote,
        experienceSummary: revSummary,
        isSamplePlaceholder: revIsPlaceholder,
        verifiedLink: revLink,
        published: true,
      };
      if (editingRevId) {
        await apiFetch(`/api/admin/testimonials/${editingRevId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        notify('Customer review updated.');
      } else {
        await apiFetch('/api/admin/testimonials', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        notify('Customer review published.');
      }
      setEditingRevId(null);
      setRevAuthor('');
      setRevOrigin('');
      setRevService('');
      setRevRating('5');
      setRevQuote('');
      setRevSummary('');
      setRevIsPlaceholder(false);
      setRevLink('');
      await Promise.all([loadDashboard(), refreshPublicData()]);
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to save review.');
    }
  }

  async function handleSaveFaq(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        category: faqCategory,
        question: faqQuestion,
        answer: faqAnswer,
        sortOrder: Number(faqSortOrder || 0),
        published: true,
      };
      if (editingFaqId) {
        await apiFetch(`/api/admin/faqs/${editingFaqId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        notify('FAQ entry updated.');
      } else {
        await apiFetch('/api/admin/faqs', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        notify('FAQ added.');
      }
      setEditingFaqId(null);
      setFaqQuestion('');
      setFaqAnswer('');
      setFaqSortOrder('0');
      await Promise.all([loadDashboard(), refreshPublicData()]);
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to save FAQ.');
    }
  }

  async function handleMediaFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const inputEl = e.currentTarget;
    const file = inputEl.files?.[0];
    if (!file) return;
    const isVideo =
      file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|mkv|avi)$/i.test(file.name);
    const maxBytes = isVideo ? 50 * 1024 * 1024 : 8 * 1024 * 1024;
    if (file.size > maxBytes) {
      inputEl.value = '';
      notify(isVideo ? 'Please select a video under 50 MB.' : 'Please select an image under 8 MB.');
      return;
    }
    try {
      const result = await readFileAsDataUrl(file);
      setMediaDataUrl(result);
      setMediaFileName(file.name);
      inputEl.value = '';
    } catch {
      inputEl.value = '';
      notify('Could not read selected file.');
    }
  }

  async function handleMediaUpload(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/media/upload', {
        method: 'POST',
        body: JSON.stringify({
          title: mediaTitle,
          category: mediaCategory,
          altText: mediaAlt || mediaTitle,
          fileName: mediaFileName || undefined,
          dataUrl: mediaDataUrl || undefined,
          externalUrl: !mediaDataUrl ? mediaExternalUrl : undefined,
        }),
      });
      setMediaTitle('');
      setMediaAlt('');
      setMediaDataUrl('');
      setMediaFileName('');
      setMediaExternalUrl('');
      notify('Media asset saved to library.');
      await Promise.all([loadDashboard(), refreshPublicData()]);
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Upload failed.');
    }
  }

  async function persistLogoUrl(nextLogoUrl: string, successMessage: string) {
    setSavingSettings(true);
    setSettingsFeedback(null);
    try {
      const res = await apiFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings: { logoUrl: nextLogoUrl } }),
      });
      const json = (await res.json().catch(() => ({}))) as { settings?: Record<string, string> };
      const savedLogo = json.settings?.logoUrl !== undefined ? json.settings.logoUrl : nextLogoUrl;
      setSettingsDraft((prev) => ({ ...prev, logoUrl: savedLogo }));
      setBundle((prev) =>
        prev ? { ...prev, settings: { ...prev.settings, logoUrl: savedLogo } } : prev
      );
      setSettingsFeedback({ type: 'ok', msg: successMessage });
      notify(successMessage);
      await refreshPublicData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update website logo.';
      setSettingsFeedback({ type: 'error', msg });
      notify(msg);
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsFeedback(null);
    try {
      const payloadSettings: Record<string, string> = {};
      for (const [key, val] of Object.entries(settingsDraft)) {
        if (typeof val === 'string') {
          payloadSettings[key] = val;
        }
      }
      const res = await apiFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings: payloadSettings }),
      });
      const json = (await res.json().catch(() => ({}))) as { settings?: Record<string, string> };
      if (json.settings) {
        setSettingsDraft((prev) => ({ ...prev, ...json.settings }));
        setLatestUpdateQuick(json.settings.latestUpdate ?? payloadSettings.latestUpdate ?? '');
        setHoursWeekdayQuick(json.settings.hoursWeekday ?? payloadSettings.hoursWeekday ?? '');
      }
      const successMsg = 'All website changes (site content, logo & links) published live!';
      setSettingsFeedback({ type: 'ok', msg: successMsg });
      notify(successMsg);
      await Promise.all([loadDashboard(), refreshPublicData()]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update settings.';
      setSettingsFeedback({ type: 'error', msg });
      notify(msg);
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      notify('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      notify('New passwords do not match.');
      return;
    }
    try {
      const res = await apiFetch('/api/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      notify(json.envOverrideNote || 'Password updated successfully.');
      await loadDashboard();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to update password.');
    }
  }

  async function handleAddManager(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/managers', {
        method: 'POST',
        body: JSON.stringify({
          username: mgrUsername,
          displayName: mgrDisplayName,
          password: mgrPassword,
          role: mgrRole,
        }),
      });
      setMgrUsername('');
      setMgrDisplayName('');
      setMgrPassword('');
      notify('Manager credentials saved with full dashboard management access.');
      await loadDashboard();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to assign manager password.');
    }
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/admins', {
        method: 'POST',
        body: JSON.stringify({ email: newAdminEmail, role: newAdminRole }),
      });
      setNewAdminEmail('');
      notify('Authorised Google administrator added.');
      await loadDashboard();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to add administrator.');
    }
  }

  // Loading Screen
  if (authLoading && checkingAuthStatus) {
    return (
      <div className="min-h-screen bg-[#10243B] flex items-center justify-center p-6">
        <p className="text-sm text-[#FAF8F3]/80">Loading Oasis Admin Portal...</p>
      </div>
    );
  }

  // Login / First-Run Claim Gate
  if (!isAuthenticated) {
    const showSetup = Boolean(authStatus?.requiresSetup) && !forceLoginView;

    return (
      <>
        <PageMeta
          title="Admin Portal | Oasis Travel and Tourism Consultancy Dubai"
          description="Protected administrator and manager portal for Oasis Travel and Tourism Consultancy Dubai."
        />
        <div className="min-h-screen bg-[#10243B] flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-white border border-[#10243B]/15 rounded-2xl p-7 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <BrandMark logoUrl={publicData.settings.logoUrl} className="w-11 h-11 shrink-0" />
              <div>
                <h1 className="font-display text-2xl font-bold text-[#10243B]">
                  Oasis Admin Portal
                </h1>
                <p className="text-xs text-[#DC2626] font-semibold">
                  Content, Projects &amp; Consultancy Management
                </p>
              </div>
            </div>

            {authStatus?.dbConnected === false && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 leading-relaxed">
                <strong>Database Connection Issue:</strong> Unable to reach PostgreSQL/Supabase
                {authStatus.dbError ? ` (${authStatus.dbError})` : ''}. Check your{' '}
                <code>SUPABASE_DB_URL</code> / <code>POSTGRES_URL</code> in Vercel Environment Variables.
              </div>
            )}

            {showSetup ? (
              <form onSubmit={handleInitialSetupSubmit} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#C9A45C]/40 text-xs text-[#10243B] leading-relaxed">
                  <strong>First-Time Database Setup:</strong> Your new database does not have an admin password saved
                  yet. Enter your chosen Primary Administrator password below to save it into Supabase for{' '}
                  <strong>/#</strong> sign-in (or add <code>ADMIN_PASSCODE</code> in Vercel Environment Variables).
                </div>

                {authFormError && (
                  <p className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{authFormError}</p>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#10243B] mb-1">Display Name</label>
                  <input
                    required
                    value={setupDisplayName}
                    onChange={(e) => setSetupDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-[#10243B]/15 text-sm text-[#10243B] focus:outline-none focus:ring-2 focus:ring-[#C9A45C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#10243B] mb-1">
                    Primary Admin Password (min. 6 chars)
                  </label>
                  <input
                    type="password"
                    required
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    placeholder="Enter administrator password"
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-[#10243B]/15 text-sm text-[#10243B] focus:outline-none focus:ring-2 focus:ring-[#C9A45C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#10243B] mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={setupConfirm}
                    onChange={(e) => setSetupConfirm(e.target.value)}
                    placeholder="Re-enter administrator password"
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-[#10243B]/15 text-sm text-[#10243B] focus:outline-none focus:ring-2 focus:ring-[#C9A45C]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authBusy}
                  className="w-full py-3 px-4 min-h-[44px] rounded-xl bg-[#10243B] text-white text-sm font-semibold shadow-sm hover:bg-[#193B59] disabled:opacity-60 cursor-pointer"
                >
                  {authBusy ? 'Activating...' : 'Save Password & Enter Dashboard'}
                </button>

                <button
                  type="button"
                  onClick={() => setForceLoginView(true)}
                  className="w-full text-xs text-[#10243B] hover:text-[#DC2626] font-medium cursor-pointer"
                >
                  Already configured a secret or manager login? Sign in
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <form onSubmit={handlePasswordLoginSubmit} className="space-y-3.5">
                  {authFormError && (
                    <p className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                      {authFormError}
                    </p>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#10243B] mb-1">
                      Username <span className="font-normal text-[#475569]">(use &ldquo;admin&rdquo; or manager username)</span>
                    </label>
                    <input
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      autoComplete="username"
                      placeholder="admin"
                      className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-[#10243B]/15 text-sm text-[#10243B] focus:outline-none focus:ring-2 focus:ring-[#C9A45C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#10243B] mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showLoginPw ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        autoComplete="current-password"
                        placeholder="Enter admin or manager password"
                        className="w-full pl-3.5 pr-11 py-2.5 min-h-[44px] rounded-xl border border-[#10243B]/15 text-sm text-[#10243B] focus:outline-none focus:ring-2 focus:ring-[#C9A45C]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPw((v) => !v)}
                        aria-label={showLoginPw ? 'Hide password' : 'Show password'}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#475569] hover:text-[#10243B] cursor-pointer"
                      >
                        {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authBusy}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 min-h-[44px] rounded-xl bg-[#10243B] text-white text-sm font-semibold shadow-sm hover:bg-[#193B59] disabled:opacity-60 cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-[#FF5252]" />
                    {authBusy ? 'Signing In...' : 'Sign In to Admin Dashboard'}
                  </button>
                </form>

                {authStatus?.requiresSetup && (
                  <button
                    type="button"
                    onClick={() => setForceLoginView(false)}
                    className="w-full text-xs text-[#10243B] hover:text-[#DC2626] font-medium cursor-pointer"
                  >
                    Back to First-Time Admin Password Setup
                  </button>
                )}

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-[#10243B]/10" />
                  <span className="shrink mx-3 text-[11px] uppercase tracking-wider text-[#748094]">or</span>
                  <div className="flex-grow border-t border-[#10243B]/10" />
                </div>

                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="w-full py-2.5 px-4 min-h-[44px] rounded-xl border border-[#10243B]/15 bg-white text-[#10243B] text-xs font-semibold hover:border-[#C9A45C] transition-colors cursor-pointer"
                >
                  Sign in with Authorised Google Account
                </button>
              </div>
            )}

            <div className="pt-2 border-t border-[#10243B]/10 text-center">
              <button
                type="button"
                onClick={exitToPublicSite}
                className="text-xs font-medium text-[#475569] hover:text-[#10243B] cursor-pointer"
              >
                Return to Public Website
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (accessError) {
    return (
      <div className="min-h-screen bg-[#10243B] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-[#10243B]/15 rounded-2xl p-8 space-y-5 shadow-xl">
          <h1 className="font-display text-2xl font-semibold text-[#10243B]">Access Restricted</h1>
          <p className="text-sm text-red-600">{accessError}</p>
          <p className="text-xs text-[#475569]">
            Signed in as: <strong>{passwordUser?.username || authUser?.email}</strong>
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadDashboard}
              disabled={loadingDash}
              className="px-4 py-2.5 min-h-[44px] rounded-xl bg-[#DC2626] text-white text-xs font-semibold hover:bg-[#B91C1C] disabled:opacity-60 cursor-pointer"
            >
              {loadingDash ? 'Retrying...' : 'Retry Dashboard'}
            </button>
            <button
              type="button"
              onClick={signOutAdmin}
              className="px-4 py-2.5 min-h-[44px] rounded-xl bg-[#10243B] text-white text-xs font-semibold hover:bg-[#193B59] cursor-pointer"
            >
              Sign Out
            </button>
            <button
              type="button"
              onClick={exitToPublicSite}
              className="px-4 py-2.5 min-h-[44px] rounded-xl border border-[#10243B]/15 text-xs font-medium text-[#10243B] cursor-pointer"
            >
              Public Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'offers', label: 'Special Offers', icon: Sparkles },
    { id: 'projects', label: 'Design Projects', icon: FolderKanban },
    { id: 'settings', label: 'Site Content, Logo & Links', icon: Settings },
    { id: 'enquiries', label: 'Enquiries', icon: Inbox },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'destinations', label: 'Destinations', icon: Globe2 },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'reviews', label: 'Customer Reviews', icon: MessageSquareQuote },
    { id: 'faqs', label: 'FAQs', icon: FileQuestion },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'security', label: 'Passwords & Managers', icon: KeyRound },
  ];

  const pendingCount = bundle?.enquiries.filter((e) => e.status === 'pending').length || 0;
  const activeIdentityLabel =
    passwordUser?.displayName || passwordUser?.username || authUser?.email || 'Administrator';
  const projectYouTubePreview = projMediaType === 'youtube' ? extractYouTubeEmbedUrl(projMediaUrl) : null;
  const projectDrivePreview = projMediaType === 'gdrive' ? extractGoogleDriveEmbedUrl(projMediaUrl) : null;
  const offerYouTubePreview = offerMediaType === 'youtube' ? extractYouTubeEmbedUrl(offerMediaUrl) : null;
  const offerDrivePreview = offerMediaType === 'gdrive' ? extractGoogleDriveEmbedUrl(offerMediaUrl) : null;
  const svcYouTubePreview = svcMediaType === 'youtube' ? extractYouTubeEmbedUrl(svcMediaUrl) : null;
  const svcDrivePreview = svcMediaType === 'gdrive' ? extractGoogleDriveEmbedUrl(svcMediaUrl) : null;

  return (
    <>
      <PageMeta
        title="Admin Console | Oasis Travel and Tourism Consultancy Dubai"
        description="Private administration and website content management dashboard."
      />
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col lg:flex-row">
        {/* Midnight Navy Sidebar */}
        <aside className="w-full lg:w-68 bg-[#10243B] text-white shrink-0 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#193B59]">
          <div>
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <BrandMark logoUrl={settingsDraft.logoUrl} className="w-9 h-9 shrink-0" />
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-white truncate">Oasis Admin</p>
                  <p className="text-[11px] font-semibold text-[#FF5252] truncate">
                    {adminRole === 'super_admin' ? 'Primary Admin' : adminRole || 'Manager'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={signOutAdmin}
                aria-label="Sign out of Admin Console"
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl bg-[#193B59] hover:bg-[#193B59]/80 text-xs font-medium text-white cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            <nav className="p-3 flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = !viewAllSections && tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setViewAllSections(false);
                      setTab(item.id);
                    }}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 min-h-[42px] rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      active
                        ? 'bg-[#C9A45C] text-[#10243B] shadow-xs'
                        : 'text-[#FAF8F3]/80 hover:bg-[#193B59] hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="hidden lg:block p-4 border-t border-white/10 space-y-2.5 text-xs">
            <p className="text-[#FAF8F3]/75 truncate">{activeIdentityLabel}</p>
            <button
              type="button"
              onClick={signOutAdmin}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 min-h-[40px] rounded-xl bg-[#193B59] hover:bg-white/15 text-white font-medium cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#FF5252]" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-[#10243B]/10 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-[#475569]">
              <span>Admin Dashboard</span>
              <span className="mx-2">/</span>
              <span className="font-semibold text-[#10243B] capitalize">
                {viewAllSections ? 'All Website Sections' : tab.replace('-', ' ')}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setViewAllSections((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  viewAllSections
                    ? 'bg-[#C9A45C] text-[#10243B] border-[#C9A45C]'
                    : 'bg-white text-[#10243B] border-[#10243B]/15 hover:border-[#C9A45C]'
                }`}
              >
                {viewAllSections ? 'Single Section View' : 'Show All Sections'}
              </button>
              <button
                type="button"
                onClick={loadDashboard}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl border border-[#10243B]/15 text-xs font-semibold text-[#10243B] hover:bg-[#FAF8F3] cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#DC2626] ${loadingDash ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-[#10243B] text-white text-xs font-semibold hover:bg-[#193B59] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#FF5252]" />
                Export Enquiries CSV
              </button>
              <button
                type="button"
                onClick={exitToPublicSite}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl border border-[#10243B]/15 text-xs font-semibold text-[#10243B] hover:border-[#C9A45C] cursor-pointer"
              >
                Live Site
                <ExternalLink className="w-3.5 h-3.5 text-[#DC2626]" />
              </button>
            </div>
          </header>

          {toast && (
            <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[#10243B] text-[#FF5252] border border-[#C9A45C]/50 text-xs font-semibold shadow-2xl flex items-center gap-2 max-w-[92vw]">
              <Check className="w-4 h-4 shrink-0" />
              <span>{toast}</span>
            </div>
          )}

          <main className="p-4 sm:p-6 space-y-8 flex-1 overflow-y-auto">
            {!bundle && loadingDash ? (
              <p className="text-sm text-[#475569]">Loading Oasis administration records...</p>
            ) : bundle ? (
              <>
                {/* 1. OVERVIEW */}
                {(viewAllSections || tab === 'overview') && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      {[
                        { label: 'Special Offers', val: bundle.specialOffers?.length || 0, tabTarget: 'offers' as AdminTab },
                        { label: 'Design Projects', val: bundle.designProjects.length, tabTarget: 'projects' as AdminTab },
                        { label: 'Total Enquiries', val: bundle.enquiries.length, tabTarget: 'enquiries' as AdminTab },
                        { label: 'Pending Enquiries', val: pendingCount, tabTarget: 'enquiries' as AdminTab },
                        { label: 'Managers & Staff Accounts', val: bundle.managers.length, tabTarget: 'security' as AdminTab },
                      ].map((kpi) => (
                        <button
                          key={kpi.label}
                          type="button"
                          onClick={() => setTab(kpi.tabTarget)}
                          className="text-left bg-white border border-[#10243B]/10 hover:border-[#C9A45C] rounded-2xl p-5 transition-colors cursor-pointer"
                        >
                          <p className="text-xs font-medium text-[#748094]">{kpi.label}</p>
                          <p className="font-display text-3xl font-bold text-[#10243B] mt-1 tabular-nums">
                            {kpi.val}
                          </p>
                        </button>
                      ))}
                    </div>

                    {/* Quick Publisher for Live Header Top Bar: Latest Update + Opening Hours */}
                    <form
                      onSubmit={handleQuickPublishLatestUpdate}
                      className="bg-white border border-[#C9A45C]/35 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-9 h-9 rounded-xl bg-[#10243B] text-[#FF5252] flex items-center justify-center shrink-0">
                            <Megaphone className="w-4 h-4" />
                          </span>
                          <div>
                            <h2 className="font-display text-lg font-semibold text-[#10243B]">
                              Live Header Bar · Latest Update &amp; Opening Time
                            </h2>
                            <p className="text-xs text-[#475569]">
                              Appears horizontally right beside the live ticking Dubai clock and Opening Hours on every page.
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F3] border border-[#10243B]/10 text-[11px] font-semibold text-[#10243B]">
                          <span className="w-2 h-2 rounded-full bg-[#15803D]" />
                          Updates Website Immediately
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-end">
                        <div className="lg:col-span-7">
                          <label className="block text-xs font-semibold text-[#475569] mb-1">
                            Latest Update Announcement Ticker
                          </label>
                          <input
                            required
                            value={latestUpdateQuick}
                            onChange={(e) => {
                              setLatestUpdateQuick(e.target.value);
                              setSettingsDraft((prev) => ({ ...prev, latestUpdate: e.target.value }));
                            }}
                            placeholder="e.g. Dubai Summer Holiday & Honeymoon Enquiries Open · Visit Visa Change & Airport Pickup Available Daily"
                            className="w-full px-3.5 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15 text-sm"
                          />
                        </div>
                        <div className="lg:col-span-3">
                          <label className="block text-xs font-semibold text-[#475569] mb-1">
                            Opening Hours Display
                          </label>
                          <input
                            value={hoursWeekdayQuick}
                            onChange={(e) => {
                              setHoursWeekdayQuick(e.target.value);
                              setSettingsDraft((prev) => ({ ...prev, hoursWeekday: e.target.value }));
                            }}
                            placeholder="Mon – Sat: 8:00 AM – 8:00 PM (GST)"
                            className="w-full px-3.5 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15 text-sm"
                          />
                        </div>
                        <div className="lg:col-span-2">
                          <button
                            type="submit"
                            disabled={savingLatestUpdate}
                            className="w-full py-2.5 px-4 min-h-[42px] rounded-xl bg-[#10243B] text-[#FF5252] text-xs font-semibold hover:bg-[#193B59] disabled:opacity-60 cursor-pointer"
                          >
                            {savingLatestUpdate ? 'Publishing...' : 'Publish Update'}
                          </button>
                        </div>
                      </div>
                    </form>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setViewAllSections(false);
                          setTab('offers');
                        }}
                        className="p-5 rounded-2xl bg-white border border-[#C9A45C]/35 hover:border-[#C9A45C] text-left space-y-1.5 cursor-pointer"
                      >
                        <p className="text-xs font-semibold text-[#DC2626]">Promotions</p>
                        <p className="font-display text-lg font-semibold text-[#10243B]">+ Upload Special Offer</p>
                        <p className="text-xs text-[#475569]">
                          Image, Video, YouTube or Drive offer shown on Homepage &amp; Packages.
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setViewAllSections(false);
                          setTab('projects');
                        }}
                        className="p-5 rounded-2xl bg-white border border-[#10243B]/10 hover:border-[#C9A45C] text-left space-y-1.5 cursor-pointer"
                      >
                        <p className="text-xs font-semibold text-[#DC2626]">Media Showcase</p>
                        <p className="font-display text-lg font-semibold text-[#10243B]">+ Add Design Project</p>
                        <p className="text-xs text-[#475569]">
                          Upload image, video, YouTube link, or Google Drive link.
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setViewAllSections(false);
                          setTab('services');
                        }}
                        className="p-5 rounded-2xl bg-white border border-[#10243B]/10 hover:border-[#C9A45C] text-left space-y-1.5 cursor-pointer"
                      >
                        <p className="text-xs font-semibold text-[#DC2626]">Service Divisions</p>
                        <p className="font-display text-lg font-semibold text-[#10243B]">+ Add / Update Service</p>
                        <p className="text-xs text-[#475569]">
                          Publish new services with images, videos, YouTube or Drive.
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setViewAllSections(false);
                          setTab('settings');
                        }}
                        className="p-5 rounded-2xl bg-white border border-[#10243B]/10 hover:border-[#C9A45C] text-left space-y-1.5 cursor-pointer"
                      >
                        <p className="text-xs font-semibold text-[#DC2626]">Frontend &amp; Branding</p>
                        <p className="font-display text-lg font-semibold text-[#10243B]">Edit Logo, Text &amp; Images</p>
                        <p className="text-xs text-[#475569]">
                          Update website logo, page headlines, photography, and socials.
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setViewAllSections(false);
                          setTab('security');
                        }}
                        className="p-5 rounded-2xl bg-white border border-[#10243B]/10 hover:border-[#C9A45C] text-left space-y-1.5 cursor-pointer"
                      >
                        <p className="text-xs font-semibold text-[#DC2626]">Team &amp; Passwords</p>
                        <p className="font-display text-lg font-semibold text-[#10243B]">Assign Manager Password</p>
                        <p className="text-xs text-[#475569]">
                          Change admin password or assign manager full access.
                        </p>
                      </button>
                    </div>

                    <div className="bg-white border border-[#10243B]/10 rounded-2xl overflow-hidden">
                      <div className="px-5 py-4 border-b border-[#10243B]/10 flex items-center justify-between">
                        <h2 className="font-display text-lg font-semibold text-[#10243B]">
                          Recent Customer Enquiries
                        </h2>
                        <button
                          type="button"
                          onClick={() => setTab('enquiries')}
                          className="text-xs font-semibold text-[#10243B] hover:text-[#DC2626] cursor-pointer"
                        >
                          Manage All
                        </button>
                      </div>
                      {bundle.enquiries.length === 0 ? (
                        <p className="p-6 text-sm text-[#475569]">
                          No enquiries submitted yet. Customer enquiries submitted via the website will appear here.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAF8F3] text-[#475569] border-b border-[#10243B]/10">
                              <tr>
                                <th className="py-3 px-4 font-semibold">Reference</th>
                                <th className="py-3 px-4 font-semibold">Client</th>
                                <th className="py-3 px-4 font-semibold">Service</th>
                                <th className="py-3 px-4 font-semibold">Destination</th>
                                <th className="py-3 px-4 font-semibold">Travel Date</th>
                                <th className="py-3 px-4 font-semibold">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#10243B]/10">
                              {bundle.enquiries.slice(0, 8).map((e) => (
                                <tr key={e.id} className="hover:bg-[#FAF8F3]">
                                  <td className="py-3 px-4 font-mono tabular-nums font-medium text-[#10243B]">{e.referenceNumber}</td>
                                  <td className="py-3 px-4 font-medium text-[#10243B]">{e.fullName}</td>
                                  <td className="py-3 px-4 text-[#475569]">{e.serviceRequired}</td>
                                  <td className="py-3 px-4 text-[#475569]">{e.destination}</td>
                                  <td className="py-3 px-4 tabular-nums text-[#475569]">{e.preferredTravelDate}</td>
                                  <td className="py-3 px-4 capitalize font-semibold text-[#DC2626]">{e.status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. DESIGN PROJECTS (IMAGE UPLOAD, VIDEO UPLOAD, YOUTUBE LINK, GOOGLE DRIVE LINK) */}
                {(viewAllSections || tab === 'projects') && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <form
                      onSubmit={handleSaveProject}
                      className="lg:col-span-5 bg-white border border-[#10243B]/10 rounded-2xl p-6 space-y-4 text-sm"
                    >
                      <div>
                        <h2 className="font-display text-xl font-semibold text-[#10243B]">
                          {editingProjId ? 'Edit Design Project' : 'Add New Design Project'}
                        </h2>
                        <p className="text-xs text-[#475569] mt-0.5">
                          Choose Image Upload, Video Upload, YouTube Link, or Google Drive Link.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            { id: 'image', label: 'Image Upload', icon: ImageIcon },
                            { id: 'video', label: 'Video Upload', icon: Video },
                            { id: 'youtube', label: 'YouTube Link', icon: Youtube },
                            { id: 'gdrive', label: 'Google Drive', icon: HardDrive },
                          ] as const
                        ).map((mode) => {
                          const Icon = mode.icon;
                          const active = projMediaType === mode.id;
                          return (
                            <button
                              key={mode.id}
                              type="button"
                              onClick={() => {
                                setProjMediaType(mode.id);
                                setProjFormFeedback(null);
                                const cur = projMediaUrl.trim();
                                const matchesMode =
                                  (mode.id === 'youtube' && Boolean(extractYouTubeEmbedUrl(cur))) ||
                                  (mode.id === 'gdrive' && Boolean(extractGoogleDriveEmbedUrl(cur))) ||
                                  (mode.id === 'image' && cur && !extractYouTubeEmbedUrl(cur) && !extractGoogleDriveEmbedUrl(cur) && !/\.(mp4|webm|mov|m4v|mkv|avi)(\?|$)/i.test(cur)) ||
                                  (mode.id === 'video' && cur && /\.(mp4|webm|mov|m4v|mkv|avi)(\?|$)/i.test(cur));
                                if (!matchesMode) setProjMediaUrl('');
                              }}
                              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-[42px] rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#10243B] text-[#FF5252] border-[#10243B]'
                                  : 'bg-[#FAF8F3] text-[#475569] border-[#10243B]/10 hover:text-[#10243B]'
                              }`}
                            >
                              <Icon className="w-4 h-4 shrink-0" />
                              <span>{mode.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <input
                        required
                        value={projTitle}
                        onChange={(e) => setProjTitle(e.target.value)}
                        placeholder="Project Title (e.g. Palm Jumeirah Villa Experience)"
                        className="w-full px-3.5 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          required
                          value={projCategory}
                          onChange={(e) => setProjCategory(e.target.value)}
                          placeholder="Category"
                          className="w-full px-3.5 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15"
                        />
                        <input
                          type="number"
                          value={projSortOrder}
                          onChange={(e) => setProjSortOrder(e.target.value)}
                          placeholder="Sort Order"
                          className="w-full px-3.5 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15"
                        />
                      </div>

                      <textarea
                        required
                        rows={3}
                        value={projDesc}
                        onChange={(e) => setProjDesc(e.target.value)}
                        placeholder="Project description shown on the public showcase card..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#10243B]/15"
                      />

                      {projMediaType === 'image' && (
                        <div className="space-y-2.5 p-3.5 rounded-xl bg-[#FAF8F3] border border-[#10243B]/10">
                          <label className="block text-xs font-semibold text-[#10243B]">
                            Upload Image File (JPEG, PNG, WebP, GIF, SVG · max 8 MB)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const inputEl = e.currentTarget;
                              const file = inputEl.files?.[0];
                              if (!file) return;
                              setProjFormFeedback(null);
                              const url = await uploadAssetFile(
                                file,
                                'proj-image',
                                projTitle || file.name,
                                projCategory || 'Design Project',
                                'image'
                              );
                              inputEl.value = '';
                              if (url) {
                                setProjMediaUrl(url);
                                setProjFormFeedback({ type: 'ok', msg: 'Image uploaded and ready to publish.' });
                              } else {
                                setProjFormFeedback({ type: 'error', msg: 'Image upload failed. Please try another file.' });
                              }
                            }}
                            className="w-full text-xs cursor-pointer"
                          />
                          {uploadingField === 'proj-image' && (
                            <p className="text-xs text-[#DC2626] font-medium">Uploading image...</p>
                          )}
                          <input
                            value={projMediaUrl}
                            onChange={(e) => setProjMediaUrl(e.target.value)}
                            placeholder="Or paste HTTPS / /uploads/... Image URL"
                            className="w-full px-3 py-2 rounded-lg border border-[#10243B]/15 bg-white text-xs"
                          />
                          {projMediaUrl && (
                            <div className="aspect-[16/9] rounded-lg overflow-hidden border border-[#10243B]/10 bg-white">
                              <SafeImage src={projMediaUrl} alt="Project preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      )}

                      {projMediaType === 'video' && (
                        <div className="space-y-2.5 p-3.5 rounded-xl bg-[#FAF8F3] border border-[#10243B]/10">
                          <label className="block text-xs font-semibold text-[#10243B]">
                            Upload Video File (MP4, WebM, MOV, M4V · max 50 MB)
                          </label>
                          <input
                            type="file"
                            accept="video/*,.mp4,.mov,.webm,.m4v,.mkv,.avi"
                            onChange={async (e) => {
                              const inputEl = e.currentTarget;
                              const file = inputEl.files?.[0];
                              if (!file) return;
                              setProjFormFeedback(null);
                              const url = await uploadAssetFile(
                                file,
                                'proj-video',
                                projTitle || file.name,
                                projCategory || 'Design Project Video',
                                'video'
                              );
                              inputEl.value = '';
                              if (url) {
                                setProjMediaUrl(url);
                                setProjFormFeedback({ type: 'ok', msg: 'Video uploaded and ready to publish.' });
                              } else {
                                setProjFormFeedback({ type: 'error', msg: 'Video upload failed. Check size/format and retry.' });
                              }
                            }}
                            className="w-full text-xs cursor-pointer"
                          />
                          {uploadingField === 'proj-video' && (
                            <p className="text-xs text-[#DC2626] font-medium">Uploading video (please wait)...</p>
                          )}
                          <input
                            value={projMediaUrl}
                            onChange={(e) => setProjMediaUrl(e.target.value)}
                            placeholder="Or paste HTTPS / /uploads/... Video URL"
                            className="w-full px-3 py-2 rounded-lg border border-[#10243B]/15 bg-white text-xs"
                          />
                          <label className="block text-[11px] font-medium text-[#475569] pt-1">
                            Optional Video Poster Thumbnail URL or Upload:
                          </label>
                          <div className="flex gap-2 items-center">
                            <input
                              value={projThumbUrl}
                              onChange={(e) => setProjThumbUrl(e.target.value)}
                              placeholder="Optional poster image URL"
                              className="flex-1 px-3 py-2 rounded-lg border border-[#10243B]/15 bg-white text-xs"
                            />
                            <label className="px-3 py-2 rounded-lg bg-white border border-[#10243B]/15 text-xs font-medium cursor-pointer hover:border-[#C9A45C]">
                              Upload
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const inputEl = e.currentTarget;
                                  const f = inputEl.files?.[0];
                                  if (!f) return;
                                  const u = await uploadAssetFile(f, 'proj-thumb', 'Project Thumbnail', 'Thumbnail', 'image');
                                  inputEl.value = '';
                                  if (u) setProjThumbUrl(u);
                                }}
                              />
                            </label>
                          </div>
                          {projMediaUrl && (
                            <video controls className="w-full aspect-[16/9] rounded-lg bg-[#10243B]" src={projMediaUrl} />
                          )}
                        </div>
                      )}

                      {projMediaType === 'youtube' && (
                        <div className="space-y-2.5 p-3.5 rounded-xl bg-[#FAF8F3] border border-[#10243B]/10">
                          <label className="block text-xs font-semibold text-[#10243B]">
                            YouTube Video or Shorts URL
                          </label>
                          <input
                            value={projMediaUrl}
                            onChange={(e) => setProjMediaUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                            className="w-full px-3 py-2 rounded-lg border border-[#10243B]/15 bg-white text-xs"
                          />
                          {projectYouTubePreview ? (
                            <iframe
                              src={projectYouTubePreview}
                              title="YouTube preview"
                              className="w-full aspect-[16/9] rounded-lg border border-[#10243B]/10"
                              allowFullScreen
                            />
                          ) : projMediaUrl ? (
                            <p className="text-xs text-red-600">Enter a valid youtube.com or youtu.be URL.</p>
                          ) : null}
                        </div>
                      )}

                      {projMediaType === 'gdrive' && (
                        <div className="space-y-2.5 p-3.5 rounded-xl bg-[#FAF8F3] border border-[#10243B]/10">
                          <label className="block text-xs font-semibold text-[#10243B]">
                            Google Drive Share Link (Anyone with link can view)
                          </label>
                          <input
                            value={projMediaUrl}
                            onChange={(e) => setProjMediaUrl(e.target.value)}
                            placeholder="https://drive.google.com/file/d/FILE_ID/view"
                            className="w-full px-3 py-2 rounded-lg border border-[#10243B]/15 bg-white text-xs"
                          />
                          {projectDrivePreview ? (
                            <iframe
                              src={projectDrivePreview}
                              title="Google Drive preview"
                              className="w-full aspect-[16/9] rounded-lg border border-[#10243B]/10"
                            />
                          ) : projMediaUrl ? (
                            <p className="text-xs text-red-600">
                              Paste a Google Drive share URL containing /file/d/... or ?id=...
                            </p>
                          ) : null}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={projFeatured}
                            onChange={(e) => setProjFeatured(e.target.checked)}
                          />
                          Featured on Homepage
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={projPublished}
                            onChange={(e) => setProjPublished(e.target.checked)}
                          />
                          Published Live
                        </label>
                      </div>

                      {projFormFeedback && (
                        <p
                          className={`p-3 rounded-xl text-xs font-medium border ${
                            projFormFeedback.type === 'error'
                              ? 'bg-red-50 border-red-200 text-red-700'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          }`}
                        >
                          {projFormFeedback.msg}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={uploadingField?.startsWith('proj-')}
                          className="flex-1 py-2.5 min-h-[42px] rounded-xl bg-[#10243B] text-white text-xs font-semibold hover:bg-[#193B59] disabled:opacity-60 cursor-pointer"
                        >
                          {uploadingField?.startsWith('proj-')
                            ? 'Uploading Media... Please Wait'
                            : editingProjId
                              ? 'Update Project'
                              : 'Publish Design Project'}
                        </button>
                        {editingProjId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProjId(null);
                              setProjTitle('');
                              setProjDesc('');
                              setProjMediaUrl('');
                              setProjThumbUrl('');
                            }}
                            className="px-4 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15 text-xs font-medium cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>

                    <div className="lg:col-span-7 space-y-3">
                      {bundle.designProjects.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white border border-[#10243B]/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="min-w-0 space-y-1">
                            <p className="text-xs font-semibold text-[#DC2626] uppercase tracking-wider">
                              {p.mediaType} · {p.category} · {p.published ? 'Live' : 'Hidden'}
                            </p>
                            <h3 className="font-display text-lg font-semibold text-[#10243B] truncate">
                              {p.title}
                            </h3>
                            <p className="text-xs text-[#475569] truncate">{p.mediaUrl}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 text-xs font-semibold">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProjId(p.id);
                                setProjTitle(p.title);
                                setProjCategory(p.category);
                                setProjDesc(p.description);
                                setProjMediaType((p.mediaType as ProjectMediaType) || 'image');
                                setProjMediaUrl(p.mediaUrl);
                                setProjThumbUrl(p.thumbnailUrl || '');
                                setProjSortOrder(String(p.sortOrder || 0));
                                setProjFeatured(p.featured);
                                setProjPublished(p.published);
                              }}
                              className="text-[#10243B] hover:text-[#DC2626] cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await apiFetch(`/api/admin/projects/${p.id}`, { method: 'DELETE' });
                                  if (editingProjId === p.id) setEditingProjId(null);
                                  notify('Design project deleted.');
                                  await Promise.all([loadDashboard(), refreshPublicData()]);
                                } catch (err: unknown) {
                                  notify(err instanceof Error ? err.message : 'Failed to delete project.');
                                }
                              }}
                              className="text-red-600 hover:underline cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2B. SPECIAL OFFERS & PROMOTIONS (IMAGE UPLOAD, VIDEO UPLOAD, YOUTUBE LINK, GOOGLE DRIVE LINK) */}
                {(viewAllSections || tab === 'offers') && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <form
                      onSubmit={handleSaveOffer}
                      className="lg:col-span-5 bg-white border border-[#10243B]/10 rounded-2xl p-6 space-y-4 text-sm"
                    >
                      <div>
                        <h2 className="font-display text-xl font-semibold text-[#10243B]">
                          {editingOfferId ? 'Edit Special Offer' : 'Upload Special Offer'}
                        </h2>
                        <p className="text-xs text-[#475569] mt-0.5">
                          Upload Image, Upload Video, paste YouTube Link, or paste Google Drive Link with Title &amp; Description. Reflects immediately on Homepage &amp; Packages.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            { id: 'image', label: 'Image Upload', icon: ImageIcon },
                            { id: 'video', label: 'Video Upload', icon: Video },
                            { id: 'youtube', label: 'YouTube Link', icon: Youtube },
                            { id: 'gdrive', label: 'Google Drive', icon: HardDrive },
                          ] as const
                        ).map((mode) => {
                          const Icon = mode.icon;
                          const active = offerMediaType === mode.id;
                          return (
                            <button
                              key={mode.id}
                              type="button"
                              onClick={() => {
                                setOfferMediaType(mode.id);
                                setOfferFormFeedback(null);
                                const cur = offerMediaUrl.trim();
                                const matchesMode =
                                  (mode.id === 'youtube' && Boolean(extractYouTubeEmbedUrl(cur))) ||
                                  (mode.id === 'gdrive' && Boolean(extractGoogleDriveEmbedUrl(cur))) ||
                                  (mode.id === 'image' && cur && !extractYouTubeEmbedUrl(cur) && !extractGoogleDriveEmbedUrl(cur) && !/\.(mp4|webm|mov|m4v|mkv|avi)(\?|$)/i.test(cur)) ||
                                  (mode.id === 'video' && cur && /\.(mp4|webm|mov|m4v|mkv|avi)(\?|$)/i.test(cur));
                                if (!matchesMode) setOfferMediaUrl('');
                              }}
                              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-[42px] rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#10243B] text-[#FF5252] border-[#10243B]'
                                  : 'bg-[#FAF8F3] text-[#475569] border-[#10243B]/10 hover:text-[#10243B]'
                              }`}
                            >
                              <Icon className="w-4 h-4 shrink-0" />
                              <span>{mode.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <input
                        required
                        value={offerTitle}
                        onChange={(e) => setOfferTitle(e.target.value)}
                        placeholder="Offer Title (e.g. Dubai Honeymoon & Couple Escape)"
                        className="w-full px-3.5 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          value={offerBadge}
                          onChange={(e) => setOfferBadge(e.target.value)}
                          placeholder="Offer Badge (e.g. Limited Offer)"
                          className="w-full px-3.5 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15"
                        />
                        <input
                          type="number"
                          value={offerSortOrder}
                          onChange={(e) => setOfferSortOrder(e.target.value)}
                          placeholder="Sort Order"
                          className="w-full px-3.5 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15"
                        />
                      </div>

                      <textarea
                        required
                        rows={3}
                        value={offerDesc}
                        onChange={(e) => setOfferDesc(e.target.value)}
                        placeholder="Special offer description, inclusions, and travel dates or eligibility..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#10243B]/15"
                      />

                      {offerMediaType === 'image' && (
                        <div className="space-y-2.5 p-3.5 rounded-xl bg-[#FAF8F3] border border-[#10243B]/10">
                          <label className="block text-xs font-semibold text-[#10243B]">
                            Upload Offer Image (JPEG, PNG, WebP, GIF, SVG · max 8 MB)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const inputEl = e.currentTarget;
                              const file = inputEl.files?.[0];
                              if (!file) return;
                              setOfferFormFeedback(null);
                              const url = await uploadAssetFile(
                                file,
                                'offer-image',
                                offerTitle || file.name,
                                'Special Offers',
                                'image'
                              );
                              inputEl.value = '';
                              if (url) {
                                setOfferMediaUrl(url);
                                setOfferFormFeedback({ type: 'ok', msg: 'Offer image uploaded and ready to publish.' });
                              } else {
                                setOfferFormFeedback({ type: 'error', msg: 'Image upload failed. Please try another file.' });
                              }
                            }}
                            className="w-full text-xs cursor-pointer"
                          />
                          {uploadingField === 'offer-image' && (
                            <p className="text-xs text-[#DC2626] font-medium">Uploading offer image...</p>
                          )}
                          <input
                            value={offerMediaUrl}
                            onChange={(e) => setOfferMediaUrl(e.target.value)}
                            placeholder="Or paste HTTPS / /uploads/... Image URL"
                            className="w-full px-3 py-2 rounded-lg border border-[#10243B]/15 bg-white text-xs"
                          />
                          {offerMediaUrl && (
                            <div className="aspect-[16/9] rounded-lg overflow-hidden border border-[#10243B]/10 bg-white">
                              <SafeImage src={offerMediaUrl} alt="Special offer preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      )}

                      {offerMediaType === 'video' && (
                        <div className="space-y-2.5 p-3.5 rounded-xl bg-[#FAF8F3] border border-[#10243B]/10">
                          <label className="block text-xs font-semibold text-[#10243B]">
                            Upload Offer Video (MP4, WebM, MOV, M4V · max 50 MB)
                          </label>
                          <input
                            type="file"
                            accept="video/*,.mp4,.mov,.webm,.m4v,.mkv,.avi"
                            onChange={async (e) => {
                              const inputEl = e.currentTarget;
                              const file = inputEl.files?.[0];
                              if (!file) return;
                              setOfferFormFeedback(null);
                              const url = await uploadAssetFile(
                                file,
                                'offer-video',
                                offerTitle || file.name,
                                'Special Offers Video',
                                'video'
                              );
                              inputEl.value = '';
                              if (url) {
                                setOfferMediaUrl(url);
                                setOfferFormFeedback({ type: 'ok', msg: 'Offer video uploaded and ready to publish.' });
                              } else {
                                setOfferFormFeedback({ type: 'error', msg: 'Video upload failed. Check size/format and retry.' });
                              }
                            }}
                            className="w-full text-xs cursor-pointer"
                          />
                          {uploadingField === 'offer-video' && (
                            <p className="text-xs text-[#DC2626] font-medium">Uploading offer video (please wait)...</p>
                          )}
                          <input
                            value={offerMediaUrl}
                            onChange={(e) => setOfferMediaUrl(e.target.value)}
                            placeholder="Or paste HTTPS / /uploads/... Video URL"
                            className="w-full px-3 py-2 rounded-lg border border-[#10243B]/15 bg-white text-xs"
                          />
                          <label className="block text-[11px] font-medium text-[#475569] pt-1">
                            Optional Video Poster Thumbnail URL or Upload:
                          </label>
                          <div className="flex gap-2 items-center">
                            <input
                              value={offerThumbUrl}
                              onChange={(e) => setOfferThumbUrl(e.target.value)}
                              placeholder="Optional poster image URL"
                              className="flex-1 px-3 py-2 rounded-lg border border-[#10243B]/15 bg-white text-xs"
                            />
                            <label className="px-3 py-2 rounded-lg bg-white border border-[#10243B]/15 text-xs font-medium cursor-pointer hover:border-[#C9A45C]">
                              Upload
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const inputEl = e.currentTarget;
                                  const f = inputEl.files?.[0];
                                  if (!f) return;
                                  const u = await uploadAssetFile(f, 'offer-thumb', 'Offer Thumbnail', 'Thumbnail', 'image');
                                  inputEl.value = '';
                                  if (u) setOfferThumbUrl(u);
                                }}
                              />
                            </label>
                          </div>
                          {offerMediaUrl && (
                            <video controls className="w-full aspect-[16/9] rounded-lg bg-[#10243B]" src={offerMediaUrl} />
                          )}
                        </div>
                      )}

                      {offerMediaType === 'youtube' && (
                        <div className="space-y-2.5 p-3.5 rounded-xl bg-[#FAF8F3] border border-[#10243B]/10">
                          <label className="block text-xs font-semibold text-[#10243B]">
                            YouTube Video or Shorts URL
                          </label>
                          <input
                            value={offerMediaUrl}
                            onChange={(e) => setOfferMediaUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                            className="w-full px-3 py-2 rounded-lg border border-[#10243B]/15 bg-white text-xs"
                          />
                          {offerYouTubePreview ? (
                            <iframe
                              src={offerYouTubePreview}
                              title="Special offer YouTube preview"
                              className="w-full aspect-[16/9] rounded-lg border border-[#10243B]/10"
                              allowFullScreen
                            />
                          ) : offerMediaUrl ? (
                            <p className="text-xs text-red-600">Enter a valid youtube.com or youtu.be URL.</p>
                          ) : null}
                        </div>
                      )}

                      {offerMediaType === 'gdrive' && (
                        <div className="space-y-2.5 p-3.5 rounded-xl bg-[#FAF8F3] border border-[#10243B]/10">
                          <label className="block text-xs font-semibold text-[#10243B]">
                            Google Drive Share Link (Anyone with link can view)
                          </label>
                          <input
                            value={offerMediaUrl}
                            onChange={(e) => setOfferMediaUrl(e.target.value)}
                            placeholder="https://drive.google.com/file/d/FILE_ID/view"
                            className="w-full px-3 py-2 rounded-lg border border-[#10243B]/15 bg-white text-xs"
                          />
                          {offerDrivePreview ? (
                            <iframe
                              src={offerDrivePreview}
                              title="Special offer Google Drive preview"
                              className="w-full aspect-[16/9] rounded-lg border border-[#10243B]/10"
                            />
                          ) : offerMediaUrl ? (
                            <p className="text-xs text-red-600">
                              Paste a Google Drive share URL containing /file/d/... or ?id=...
                            </p>
                          ) : null}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={offerFeatured}
                            onChange={(e) => setOfferFeatured(e.target.checked)}
                          />
                          Featured on Homepage
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={offerPublished}
                            onChange={(e) => setOfferPublished(e.target.checked)}
                          />
                          Published Live
                        </label>
                      </div>

                      {offerFormFeedback && (
                        <p
                          className={`p-3 rounded-xl text-xs font-medium border ${
                            offerFormFeedback.type === 'error'
                              ? 'bg-red-50 border-red-200 text-red-700'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          }`}
                        >
                          {offerFormFeedback.msg}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={uploadingField?.startsWith('offer-')}
                          className="flex-1 py-2.5 min-h-[42px] rounded-xl bg-[#10243B] text-white text-xs font-semibold hover:bg-[#193B59] disabled:opacity-60 cursor-pointer"
                        >
                          {uploadingField?.startsWith('offer-')
                            ? 'Uploading Media... Please Wait'
                            : editingOfferId
                              ? 'Update Special Offer'
                              : 'Publish Special Offer Live'}
                        </button>
                        {editingOfferId && (
                          <button
                            type="button"
                            onClick={resetOfferForm}
                            className="px-4 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15 text-xs font-medium cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>

                    <div className="lg:col-span-7 space-y-3">
                      {(!bundle.specialOffers || bundle.specialOffers.length === 0) ? (
                        <div className="bg-white border border-[#10243B]/10 rounded-2xl p-6 text-sm text-[#475569]">
                          No special offers uploaded yet. Use the form on the left to publish seasonal Dubai packages, honeymoon offers, visa guidance specials, or promo videos.
                        </div>
                      ) : (
                        bundle.specialOffers.map((o) => (
                          <div
                            key={o.id}
                            className="bg-white border border-[#10243B]/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="min-w-0 space-y-1">
                              <p className="text-xs font-semibold text-[#DC2626] uppercase tracking-wider">
                                {o.mediaType} · {o.badge} · {o.published ? 'Live on Site' : 'Hidden'}
                              </p>
                              <h3 className="font-display text-lg font-semibold text-[#10243B] truncate">
                                {o.title}
                              </h3>
                              <p className="text-xs text-[#475569] line-clamp-2">{o.description}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 text-xs font-semibold">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingOfferId(o.id);
                                  setOfferTitle(o.title);
                                  setOfferBadge(o.badge);
                                  setOfferDesc(o.description);
                                  setOfferMediaType((o.mediaType as ProjectMediaType) || 'image');
                                  setOfferMediaUrl(o.mediaUrl);
                                  setOfferThumbUrl(o.thumbnailUrl || '');
                                  setOfferSortOrder(String(o.sortOrder || 0));
                                  setOfferFeatured(o.featured);
                                  setOfferPublished(o.published);
                                  setOfferFormFeedback(null);
                                }}
                                className="text-[#10243B] hover:text-[#DC2626] cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await apiFetch(`/api/admin/offers/${o.id}`, {
                                      method: 'PUT',
                                      body: JSON.stringify({ published: !o.published }),
                                    });
                                    notify(o.published ? 'Offer hidden from public website.' : 'Offer published live.');
                                    await Promise.all([loadDashboard(), refreshPublicData()]);
                                  } catch (err: unknown) {
                                    notify(err instanceof Error ? err.message : 'Failed to update offer visibility.');
                                  }
                                }}
                                className="text-[#475569] hover:text-[#10243B] cursor-pointer"
                              >
                                {o.published ? 'Hide' : 'Publish'}
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await apiFetch(`/api/admin/offers/${o.id}`, { method: 'DELETE' });
                                    if (editingOfferId === o.id) resetOfferForm();
                                    notify('Special offer deleted.');
                                    await Promise.all([loadDashboard(), refreshPublicData()]);
                                  } catch (err: unknown) {
                                    notify(err instanceof Error ? err.message : 'Failed to delete special offer.');
                                  }
                                }}
                                className="text-red-600 hover:underline cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 3. FRONTEND CONTENT, WEBSITE LOGO, IMAGES & SOCIAL LINKS */}
                {(viewAllSections || tab === 'settings') && (
                  <form
                    onSubmit={handleSaveSettings}
                    className="space-y-6 max-w-5xl text-sm"
                  >
                    {/* Website Logo & Brand Identity */}
                    <div className="bg-white border border-[#10243B]/10 rounded-2xl p-6 space-y-5">
                      <div>
                        <h2 className="font-display text-xl font-semibold text-[#10243B]">
                          Website Logo &amp; Brand Header
                        </h2>
                        <p className="text-xs text-[#475569] mt-0.5">
                          Upload a custom logo image for the header, footer, and admin bar, or reset to the default crest.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-xl bg-[#FAF8F3] border border-[#10243B]/10">
                        <BrandMark
                          logoUrl={settingsDraft.logoUrl}
                          className="w-16 h-16 shrink-0"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap gap-2.5">
                            <label className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-[#10243B] text-white text-xs font-semibold cursor-pointer hover:bg-[#193B59]">
                              <Upload className="w-3.5 h-3.5 text-[#FF5252]" />
                              {uploadingField === 'logoUrl' ? 'Uploading Logo...' : 'Upload Website Logo'}
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                                className="hidden"
                                onChange={async (e) => {
                                  const inputEl = e.currentTarget;
                                  const f = inputEl.files?.[0];
                                  if (!f) return;
                                  const url = await uploadAssetFile(f, 'logoUrl', 'Website Logo', 'Branding', 'image');
                                  inputEl.value = '';
                                  if (url) {
                                    setSettingsDraft((prev) => ({ ...prev, logoUrl: url }));
                                    await persistLogoUrl(url, 'Website logo uploaded and published to live header & footer!');
                                  }
                                }}
                              />
                            </label>
                            {settingsDraft.logoUrl && (
                              <button
                                type="button"
                                disabled={savingSettings}
                                onClick={async () => {
                                  setSettingsDraft((prev) => ({ ...prev, logoUrl: '' }));
                                  await persistLogoUrl('', 'Reset website logo to the default Oasis crest.');
                                }}
                                className="px-4 py-2 min-h-[40px] rounded-xl border border-[#10243B]/15 bg-white text-xs font-semibold text-[#475569] hover:text-red-600 cursor-pointer disabled:opacity-60"
                              >
                                Reset to Default Crest
                              </button>
                            )}
                          </div>
                          <input
                            value={settingsDraft.logoUrl || ''}
                            onChange={(e) =>
                              setSettingsDraft((prev) => ({ ...prev, logoUrl: e.target.value }))
                            }
                            placeholder="Logo Image URL (leave empty to display the default Oasis SVG crest)"
                            className="w-full px-3 py-2 rounded-lg border border-[#10243B]/15 bg-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { key: 'shortName', label: 'Header Brand Title' },
                          { key: 'logoSubtitle', label: 'Header Brand Subtitle' },
                          { key: 'businessName', label: 'Full Registered Business Name' },
                        ].map((f) => (
                          <div key={f.key}>
                            <label className="block text-xs font-semibold text-[#475569] mb-1">{f.label}</label>
                            <input
                              value={settingsDraft[f.key] || ''}
                              onChange={(e) =>
                                setSettingsDraft((prev) => ({ ...prev, [f.key]: e.target.value }))
                              }
                              className="w-full px-3 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Editable Frontend Images */}
                    <div className="bg-white border border-[#10243B]/10 rounded-2xl p-6 space-y-5">
                      <div>
                        <h2 className="font-display text-xl font-semibold text-[#10243B]">
                          Frontend Key Photography &amp; Visuals
                        </h2>
                        <p className="text-xs text-[#475569] mt-0.5">
                          Upload replacement photos directly or paste HTTPS image URLs for every main website section.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { key: 'heroImageUrl', label: 'Homepage Hero Background Image' },
                          { key: 'conciergeImageUrl', label: 'Dubai Consultancy Lounge Image' },
                          { key: 'honeymoonImageUrl', label: 'Holiday & Honeymoon Feature Image' },
                          { key: 'desertImageUrl', label: 'Desert Luxury Visual (About / Story)' },
                          { key: 'europeImageUrl', label: 'Europe Advisory Visual' },
                        ].map((imgField) => (
                          <div key={imgField.key} className="p-4 rounded-xl bg-[#FAF8F3] border border-[#10243B]/10 space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <label className="text-xs font-semibold text-[#10243B]">{imgField.label}</label>
                              <label className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#10243B]/15 text-[11px] font-semibold text-[#10243B] cursor-pointer hover:border-[#C9A45C]">
                                <Upload className="w-3 h-3 text-[#DC2626]" />
                                {uploadingField === imgField.key ? 'Uploading...' : 'Upload Photo'}
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,image/gif"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const inputEl = e.currentTarget;
                                    const f = inputEl.files?.[0];
                                    if (!f) return;
                                    const u = await uploadAssetFile(f, imgField.key, imgField.label, 'Frontend Images', 'image');
                                    inputEl.value = '';
                                    if (u) setSettingsDraft((prev) => ({ ...prev, [imgField.key]: u }));
                                  }}
                                />
                              </label>
                            </div>
                            {settingsDraft[imgField.key] && (
                              <div className="aspect-[16/9] rounded-lg overflow-hidden border border-[#10243B]/10 bg-white">
                                <SafeImage
                                  src={settingsDraft[imgField.key]}
                                  alt={imgField.label}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <input
                              value={settingsDraft[imgField.key] || ''}
                              onChange={(e) =>
                                setSettingsDraft((prev) => ({ ...prev, [imgField.key]: e.target.value }))
                              }
                              placeholder="Image URL"
                              className="w-full px-3 py-2 rounded-lg border border-[#10243B]/15 bg-white text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Editable Frontend Copy Across Home, About, Story, Vision, CTA & Footer */}
                    <div className="bg-white border border-[#10243B]/10 rounded-2xl p-6 space-y-5">
                      <div>
                        <h2 className="font-display text-xl font-semibold text-[#10243B]">
                          Frontend Text &amp; Page Headings
                        </h2>
                        <p className="text-xs text-[#475569] mt-0.5">
                          Edit any headline, subheading, or paragraph across Home, About Us, Our Story, Our Vision, and Footer.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { key: 'heroEyebrow', label: 'Hero Eyebrow Tag' },
                          { key: 'heroHeadline', label: 'Hero Main Headline' },
                          { key: 'heroSubheadline', label: 'Hero Supporting Subheadline' },
                          { key: 'exploreEyebrow', label: 'Explore Section Eyebrow' },
                          { key: 'exploreHeading', label: 'Explore Section Heading' },
                          { key: 'welcomeEyebrow', label: 'Welcome Section Eyebrow' },
                          { key: 'welcomeHeading', label: 'Welcome Section Heading' },
                          { key: 'whyChooseEyebrow', label: 'Why Choose Oasis Eyebrow' },
                          { key: 'whyChooseHeading', label: 'Why Choose Oasis Heading' },
                          { key: 'popularServicesEyebrow', label: 'Popular Services Eyebrow' },
                          { key: 'popularServicesHeading', label: 'Popular Services Heading' },
                          { key: 'discoverEyebrow', label: 'Discover Dubai Eyebrow' },
                          { key: 'discoverHeading', label: 'Discover Dubai Heading' },
                          { key: 'honeymoonEyebrow', label: 'Honeymoon Section Eyebrow' },
                          { key: 'honeymoonHeading', label: 'Honeymoon Section Heading' },
                          { key: 'packagesEyebrow', label: 'Packages Section Eyebrow' },
                          { key: 'packagesHeading', label: 'Packages Section Heading' },
                          { key: 'howItWorksEyebrow', label: 'How It Works Eyebrow' },
                          { key: 'howItWorksHeading', label: 'How It Works Heading' },
                          { key: 'reviewsEyebrow', label: 'Reviews Section Eyebrow' },
                          { key: 'reviewsHeading', label: 'Reviews Section Heading' },
                          { key: 'faqEyebrow', label: 'FAQ Section Eyebrow' },
                          { key: 'faqHeading', label: 'FAQ Section Heading' },
                          { key: 'aboutHeroHeadline', label: 'About Us Page Headline' },
                          { key: 'storyHeroHeadline', label: 'Our Story Page Headline' },
                          { key: 'visionHeroHeadline', label: 'Our Vision Page Headline' },
                          { key: 'ctaHeading', label: 'Contact CTA Heading' },
                          { key: 'footerBlurb', label: 'Footer Brand Summary' },
                        ].map((f) => (
                          <div key={f.key}>
                            <label className="block text-xs font-semibold text-[#475569] mb-1">{f.label}</label>
                            <input
                              value={settingsDraft[f.key] || ''}
                              onChange={(e) =>
                                setSettingsDraft((prev) => ({ ...prev, [f.key]: e.target.value }))
                              }
                              className="w-full px-3 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { key: 'heroIntro', label: 'Hero Introduction Paragraph' },
                          { key: 'welcomeParagraph1', label: 'Welcome Paragraph 1' },
                          { key: 'welcomeParagraph2', label: 'Welcome Paragraph 2' },
                          { key: 'honeymoonBody', label: 'Honeymoon & Holiday Copy' },
                          { key: 'aboutHeroSubtitle', label: 'About Us Intro Summary' },
                          { key: 'aboutMission', label: 'Our Mission Statement' },
                          { key: 'aboutVision', label: 'Our Vision Statement' },
                          { key: 'storyHeroSubtitle', label: 'Our Story Intro Summary' },
                          { key: 'visionHeroSubtitle', label: 'Our Vision Intro Summary' },
                          { key: 'ctaSubheading', label: 'Contact CTA Supporting Text' },
                        ].map((f) => (
                          <div key={f.key}>
                            <label className="block text-xs font-semibold text-[#475569] mb-1">{f.label}</label>
                            <textarea
                              rows={3}
                              value={settingsDraft[f.key] || ''}
                              onChange={(e) =>
                                setSettingsDraft((prev) => ({ ...prev, [f.key]: e.target.value }))
                              }
                              className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact Info, Business Hours & Social Media Links */}
                    <div className="bg-white border border-[#10243B]/10 rounded-2xl p-6 space-y-5">
                      <div>
                        <h2 className="font-display text-xl font-semibold text-[#10243B]">
                          Contact Channels, Opening Hours &amp; Social Media Links
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { key: 'phoneDisplay', label: 'Display Phone Number' },
                          { key: 'phoneRaw', label: 'Dialable Phone (+971...)' },
                          { key: 'whatsappNumber', label: 'WhatsApp Number (digits only)' },
                          { key: 'email', label: 'Contact Email Address' },
                          { key: 'location', label: 'Location Label' },
                          { key: 'hoursWeekday', label: 'Mon–Sat Opening Hours' },
                          { key: 'hoursSunday', label: 'Sunday Hours' },
                          { key: 'facebookUrl', label: 'Facebook Page URL' },
                          { key: 'instagramUrl', label: 'Instagram Profile URL' },
                          { key: 'tiktokUrl', label: 'TikTok Profile URL' },
                          { key: 'youtubeUrl', label: 'YouTube Channel URL' },
                          { key: 'linkedinUrl', label: 'LinkedIn Page URL' },
                        ].map((f) => (
                          <div key={f.key}>
                            <label className="block text-xs font-semibold text-[#475569] mb-1">{f.label}</label>
                            <input
                              value={settingsDraft[f.key] || ''}
                              onChange={(e) =>
                                setSettingsDraft((prev) => ({ ...prev, [f.key]: e.target.value }))
                              }
                              className="w-full px-3 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15"
                            />
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#475569] mb-1">
                          Top Header Bar · Latest Update Ticker Announcement
                        </label>
                        <input
                          value={settingsDraft.latestUpdate || ''}
                          onChange={(e) => {
                            setSettingsDraft((prev) => ({ ...prev, latestUpdate: e.target.value }));
                            setLatestUpdateQuick(e.target.value);
                          }}
                          placeholder="Live ticker announcement displayed horizontally beside Dubai time & opening hours..."
                          className="w-full px-3 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#475569] mb-1">
                          Office Address &amp; Map Note
                        </label>
                        <input
                          value={settingsDraft.officeAddress || ''}
                          onChange={(e) =>
                            setSettingsDraft((prev) => ({ ...prev, officeAddress: e.target.value }))
                          }
                          className="w-full px-3 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15"
                        />
                      </div>

                      {settingsFeedback && (
                        <div
                          className={`px-4 py-3 rounded-xl border text-xs font-semibold ${
                            settingsFeedback.type === 'ok'
                              ? 'bg-[#15803D]/10 border-[#15803D]/30 text-[#15803D]'
                              : 'bg-[#DC2626]/10 border-[#DC2626]/30 text-[#DC2626]'
                          }`}
                        >
                          {settingsFeedback.msg}
                        </div>
                      )}

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={savingSettings || uploadingField !== null}
                          className="px-7 py-3 min-h-[44px] rounded-xl bg-[#10243B] text-white text-sm font-semibold shadow-sm hover:bg-[#193B59] cursor-pointer disabled:opacity-60"
                        >
                          {savingSettings ? 'Publishing All Website Changes...' : 'Publish All Website Changes'}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* 4. ENQUIRIES */}
                {(viewAllSections || tab === 'enquiries') && (
                  <div className="space-y-5">
                    <div className="bg-white border border-[#10243B]/10 rounded-2xl p-4 flex flex-wrap items-center gap-3 justify-between">
                      <input
                        type="search"
                        value={enqSearch}
                        onChange={(e) => setEnqSearch(e.target.value)}
                        placeholder="Search by client name, email, reference, or destination..."
                        className="flex-1 min-w-[240px] px-3.5 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15 text-sm"
                      />
                      <select
                        value={enqStatusFilter}
                        onChange={(e) => setEnqStatusFilter(e.target.value)}
                        className="px-3.5 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15 text-sm bg-white"
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                      <div className="xl:col-span-7 bg-white border border-[#10243B]/10 rounded-2xl overflow-hidden">
                        {filteredEnquiries.length === 0 ? (
                          <p className="p-6 text-sm text-[#475569]">No matching enquiries found.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-[#FAF8F3] text-[#475569] border-b border-[#10243B]/10">
                                <tr>
                                  <th className="py-3 px-3 font-semibold">Ref</th>
                                  <th className="py-3 px-3 font-semibold">Client</th>
                                  <th className="py-3 px-3 font-semibold">Service / Dest</th>
                                  <th className="py-3 px-3 font-semibold">Status</th>
                                  <th className="py-3 px-3 font-semibold text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#10243B]/10">
                                {filteredEnquiries.map((e) => (
                                  <tr
                                    key={e.id}
                                    className={`hover:bg-[#FAF8F3] ${
                                      selectedEnquiry?.id === e.id ? 'bg-[#FAF8F3]' : ''
                                    }`}
                                  >
                                    <td className="py-3 px-3 font-mono tabular-nums text-[#10243B]">{e.referenceNumber}</td>
                                    <td className="py-3 px-3">
                                      <p className="font-semibold text-[#10243B]">{e.fullName}</p>
                                      <p className="text-[#475569]">{e.phone}</p>
                                    </td>
                                    <td className="py-3 px-3">
                                      <p className="text-[#10243B]">{e.serviceRequired}</p>
                                      <p className="text-[#475569]">{e.destination}</p>
                                    </td>
                                    <td className="py-3 px-3 capitalize font-semibold text-[#DC2626]">{e.status}</td>
                                    <td className="py-3 px-3 text-right">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedEnquiry(e);
                                          setEnqStatusDraft(e.status);
                                          setEnqNotesDraft(e.adminNotes || '');
                                        }}
                                        className="text-[#10243B] font-semibold hover:text-[#DC2626] cursor-pointer"
                                      >
                                        Inspect
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      <div className="xl:col-span-5 bg-white border border-[#10243B]/10 rounded-2xl p-6">
                        {!selectedEnquiry ? (
                          <p className="text-sm text-[#475569]">
                            Select an enquiry from the table to view full contact information and update status.
                          </p>
                        ) : (
                          <form onSubmit={handleSaveEnquiry} className="space-y-4 text-sm">
                            <div className="flex items-start justify-between border-b border-[#10243B]/10 pb-3">
                              <div>
                                <p className="font-mono text-xs text-[#DC2626] tabular-nums">
                                  {selectedEnquiry.referenceNumber}
                                </p>
                                <h3 className="font-display text-xl font-semibold text-[#10243B]">
                                  {selectedEnquiry.fullName}
                                </h3>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteEnquiry(selectedEnquiry.id)}
                                className="text-xs text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </div>

                            <div className="space-y-1.5 text-xs text-[#334155]">
                              <p><strong>Email:</strong> {selectedEnquiry.email}</p>
                              <p><strong>Phone / WhatsApp:</strong> {selectedEnquiry.phone}</p>
                              <p><strong>Nationality:</strong> {selectedEnquiry.nationality}</p>
                              <p><strong>Residence:</strong> {selectedEnquiry.countryOfResidence}</p>
                              <p><strong>Service:</strong> {selectedEnquiry.serviceRequired}</p>
                              <p><strong>Destination:</strong> {selectedEnquiry.destination}</p>
                              <p><strong>Travel Date:</strong> {selectedEnquiry.preferredTravelDate}</p>
                              <p><strong>Travellers:</strong> {selectedEnquiry.numberOfTravellers}</p>
                              <p><strong>Budget:</strong> {selectedEnquiry.budgetRange || 'Not specified'}</p>
                            </div>

                            <div className="bg-[#FAF8F3] border border-[#10243B]/10 rounded-xl p-3 text-xs text-[#10243B] whitespace-pre-wrap">
                              {selectedEnquiry.message}
                            </div>

                            <div>
                              <label className="block text-xs font-semibold mb-1">Status</label>
                              <select
                                value={enqStatusDraft}
                                onChange={(e) => setEnqStatusDraft(e.target.value as EnquiryItem['status'])}
                                className="w-full px-3 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15 text-sm bg-white"
                              >
                                <option value="pending">Pending</option>
                                <option value="contacted">Contacted</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold mb-1">Internal Consultant Notes</label>
                              <textarea
                                rows={3}
                                value={enqNotesDraft}
                                onChange={(e) => setEnqNotesDraft(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15 text-sm"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full py-2.5 min-h-[42px] rounded-xl bg-[#10243B] text-white text-xs font-semibold hover:bg-[#193B59] cursor-pointer"
                            >
                              Save Status &amp; Notes
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. PACKAGES */}
                {(viewAllSections || tab === 'packages') && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <form
                      onSubmit={handleSavePackage}
                      className="lg:col-span-5 bg-white border border-[#10243B]/10 rounded-2xl p-6 space-y-3.5 text-sm"
                    >
                      <h2 className="font-display text-xl font-semibold text-[#10243B]">
                        {editingPkgId ? 'Edit Holiday Package' : 'Add Holiday Package'}
                      </h2>
                      <input
                        required
                        value={pkgTitle}
                        onChange={(e) => setPkgTitle(e.target.value)}
                        placeholder="Package Title"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          required
                          value={pkgCategory}
                          onChange={(e) => setPkgCategory(e.target.value)}
                          placeholder="Category"
                          className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                        />
                        <input
                          required
                          value={pkgDuration}
                          onChange={(e) => setPkgDuration(e.target.value)}
                          placeholder="Suggested Duration"
                          className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                        />
                      </div>
                      <textarea
                        required
                        rows={3}
                        value={pkgDesc}
                        onChange={(e) => setPkgDesc(e.target.value)}
                        placeholder="Package description..."
                        className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                      />
                      <textarea
                        rows={3}
                        value={pkgInclusions}
                        onChange={(e) => setPkgInclusions(e.target.value)}
                        placeholder="Inclusions (one per line)"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                      />
                      <input
                        value={pkgPriceNote}
                        onChange={(e) => setPkgPriceNote(e.target.value)}
                        placeholder="Price / Quotation note"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                      />
                      <input
                        value={pkgAvailability}
                        onChange={(e) => setPkgAvailability(e.target.value)}
                        placeholder="Availability status"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                      />
                      <div className="flex gap-2 items-center">
                        <input
                          required
                          value={pkgImage}
                          onChange={(e) => setPkgImage(e.target.value)}
                          placeholder="Image URL"
                          className="flex-1 px-3 py-2.5 rounded-xl border border-[#10243B]/15 text-xs"
                        />
                        <label className="px-3.5 py-2.5 rounded-xl bg-[#FAF8F3] border border-[#10243B]/15 text-xs font-semibold text-[#10243B] cursor-pointer hover:border-[#C9A45C]">
                          {uploadingField === 'pkgImage' ? 'Uploading...' : 'Upload'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              const u = await uploadAssetFile(f, 'pkgImage', pkgTitle || f.name, 'Packages', 'image');
                              if (u) setPkgImage(u);
                            }}
                          />
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-3 items-center text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pkgFeatured}
                            onChange={(e) => setPkgFeatured(e.target.checked)}
                          />
                          Featured on Homepage
                        </label>
                        <input
                          type="number"
                          value={pkgSortOrder}
                          onChange={(e) => setPkgSortOrder(e.target.value)}
                          placeholder="Sort Order"
                          className="px-3 py-2 rounded-xl border border-[#10243B]/15"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 min-h-[42px] rounded-xl bg-[#10243B] text-white text-xs font-semibold hover:bg-[#193B59] cursor-pointer"
                        >
                          {editingPkgId ? 'Update Package' : 'Create Package'}
                        </button>
                        {editingPkgId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPkgId(null);
                              setPkgTitle('');
                              setPkgDesc('');
                              setPkgInclusions('');
                              setPkgFeatured(true);
                              setPkgSortOrder('0');
                            }}
                            className="px-4 py-2.5 rounded-xl border border-[#10243B]/15 text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>

                    <div className="lg:col-span-7 space-y-3">
                      {bundle.packages.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white border border-[#10243B]/10 rounded-2xl p-4 flex items-center justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <p className="text-xs text-[#DC2626] font-semibold">
                              {p.category} · {p.suggestedDuration} {p.featured ? '· Featured' : ''}
                            </p>
                            <h3 className="font-display text-lg font-semibold text-[#10243B] truncate">
                              {p.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 text-xs font-semibold">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPkgId(p.id);
                                setPkgTitle(p.title);
                                setPkgCategory(p.category);
                                setPkgDuration(p.suggestedDuration);
                                setPkgDesc(p.description);
                                setPkgInclusions(parseStringList(p.inclusions).join('\n'));
                                setPkgPriceNote(p.priceNote);
                                setPkgAvailability(p.availabilityStatus);
                                setPkgImage(p.imageUrl);
                                setPkgFeatured(p.featured);
                                setPkgSortOrder(String(p.sortOrder || 0));
                              }}
                              className="text-[#10243B] hover:text-[#DC2626] cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await apiFetch(`/api/admin/packages/${p.id}`, { method: 'DELETE' });
                                  notify('Package deleted.');
                                  await Promise.all([loadDashboard(), refreshPublicData()]);
                                } catch (err: unknown) {
                                  notify(err instanceof Error ? err.message : 'Failed to delete package.');
                                }
                              }}
                              className="text-red-600 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. DESTINATIONS */}
                {(viewAllSections || tab === 'destinations') && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <form
                      onSubmit={handleSaveDestination}
                      className="lg:col-span-5 bg-white border border-[#10243B]/10 rounded-2xl p-6 space-y-3.5 text-sm"
                    >
                      <h2 className="font-display text-xl font-semibold text-[#10243B]">
                        {editingDestId ? 'Edit Destination' : 'Add Destination'}
                      </h2>
                      <input
                        required
                        value={destName}
                        onChange={(e) => setDestName(e.target.value)}
                        placeholder="Destination Name (e.g. Palm Jumeirah)"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={destRegion}
                          onChange={(e) => setDestRegion(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15 bg-white"
                        >
                          <option value="Dubai & UAE">Dubai &amp; UAE</option>
                          <option value="Europe">Europe</option>
                          <option value="Global Escapes">Global Escapes</option>
                        </select>
                        <input
                          required
                          value={destCountry}
                          onChange={(e) => setDestCountry(e.target.value)}
                          placeholder="Country"
                          className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                        />
                      </div>
                      <textarea
                        required
                        rows={3}
                        value={destDesc}
                        onChange={(e) => setDestDesc(e.target.value)}
                        placeholder="Short description..."
                        className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                      />
                      <input
                        value={destHighlights}
                        onChange={(e) => setDestHighlights(e.target.value)}
                        placeholder="Highlights (comma-separated)"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                      />
                      <div className="flex gap-2 items-center">
                        <input
                          required
                          value={destImage}
                          onChange={(e) => setDestImage(e.target.value)}
                          placeholder="Image URL"
                          className="flex-1 px-3 py-2.5 rounded-xl border border-[#10243B]/15 text-xs"
                        />
                        <label className="px-3.5 py-2.5 rounded-xl bg-[#FAF8F3] border border-[#10243B]/15 text-xs font-semibold text-[#10243B] cursor-pointer hover:border-[#C9A45C]">
                          {uploadingField === 'destImage' ? 'Uploading...' : 'Upload'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              const u = await uploadAssetFile(f, 'destImage', destName || f.name, 'Destinations', 'image');
                              if (u) setDestImage(u);
                            }}
                          />
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-3 items-center text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={destFeatured}
                            onChange={(e) => setDestFeatured(e.target.checked)}
                          />
                          Featured Highlight
                        </label>
                        <input
                          type="number"
                          value={destSortOrder}
                          onChange={(e) => setDestSortOrder(e.target.value)}
                          placeholder="Sort Order"
                          className="px-3 py-2 rounded-xl border border-[#10243B]/15"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 min-h-[42px] rounded-xl bg-[#10243B] text-white text-xs font-semibold hover:bg-[#193B59] cursor-pointer"
                        >
                          {editingDestId ? 'Update Destination' : 'Add Destination'}
                        </button>
                        {editingDestId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDestId(null);
                              setDestName('');
                              setDestDesc('');
                              setDestHighlights('');
                              setDestFeatured(true);
                              setDestSortOrder('0');
                            }}
                            className="px-4 py-2.5 rounded-xl border border-[#10243B]/15 text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>

                    <div className="lg:col-span-7 space-y-3">
                      {bundle.destinations.map((d) => (
                        <div
                          key={d.id}
                          className="bg-white border border-[#10243B]/10 rounded-2xl p-4 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <SafeImage
                              src={d.imageUrl}
                              alt={d.name}
                              className="w-14 h-12 rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs text-[#DC2626] font-semibold">
                                {d.region} · {d.country}
                              </p>
                              <h3 className="font-display text-lg font-semibold text-[#10243B] truncate">
                                {d.name}
                              </h3>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 text-xs font-semibold">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDestId(d.id);
                                setDestName(d.name);
                                setDestRegion(d.region);
                                setDestCountry(d.country);
                                setDestDesc(d.shortDescription);
                                setDestHighlights(parseStringList(d.highlights).join(', '));
                                setDestImage(d.imageUrl);
                                setDestFeatured(d.featured);
                                setDestSortOrder(String(d.sortOrder || 0));
                              }}
                              className="text-[#10243B] hover:text-[#DC2626] cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await apiFetch(`/api/admin/destinations/${d.id}`, { method: 'DELETE' });
                                  notify('Destination deleted.');
                                  await Promise.all([loadDashboard(), refreshPublicData()]);
                                } catch (err: unknown) {
                                  notify(err instanceof Error ? err.message : 'Failed to delete destination.');
                                }
                              }}
                              className="text-red-600 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. SERVICES (ADD, EDIT, DELETE + IMAGE UPLOAD, VIDEO UPLOAD, YOUTUBE LINK, GOOGLE DRIVE LINK) */}
                {(viewAllSections || tab === 'services') && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <form
                      onSubmit={handleSaveService}
                      className="lg:col-span-5 bg-white border border-[#10243B]/10 rounded-2xl p-6 space-y-4 text-sm"
                    >
                      <div>
                        <h2 className="font-display text-xl font-semibold text-[#10243B]">
                          {editingServiceId ? `Edit Service (${svcCode || 'Division'})` : 'Add New Service Division'}
                        </h2>
                        <p className="text-xs text-[#475569] mt-0.5">
                          Upload Image, Upload Video, embed YouTube Link, or embed Google Drive Link.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            { id: 'image', label: 'Image Upload', icon: ImageIcon },
                            { id: 'video', label: 'Video Upload', icon: Video },
                            { id: 'youtube', label: 'YouTube Link', icon: Youtube },
                            { id: 'gdrive', label: 'Google Drive', icon: HardDrive },
                          ] as const
                        ).map((mode) => {
                          const Icon = mode.icon;
                          const active = svcMediaType === mode.id;
                          return (
                            <button
                              key={mode.id}
                              type="button"
                              onClick={() => {
                                setSvcMediaType(mode.id);
                                setSvcFormFeedback(null);
                                const cur = svcMediaUrl.trim();
                                const matchesMode =
                                  (mode.id === 'youtube' && Boolean(extractYouTubeEmbedUrl(cur))) ||
                                  (mode.id === 'gdrive' && Boolean(extractGoogleDriveEmbedUrl(cur))) ||
                                  (mode.id === 'image' && cur && !extractYouTubeEmbedUrl(cur) && !extractGoogleDriveEmbedUrl(cur) && !/\.(mp4|webm|mov|m4v|mkv|avi)(\?|$)/i.test(cur)) ||
                                  (mode.id === 'video' && cur && /\.(mp4|webm|mov|m4v|mkv|avi)(\?|$)/i.test(cur));
                                if (!matchesMode) {
                                  setSvcMediaUrl(mode.id === 'image' ? svcImage : '');
                                }
                              }}
                              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-[42px] rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#10243B] text-[#FF5252] border-[#10243B]'
                                  : 'bg-[#FAF8F3] text-[#475569] border-[#10243B]/10 hover:text-[#10243B]'
                              }`}
                            >
                              <Icon className="w-4 h-4 shrink-0" />
                              <span>{mode.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <input
                          value={svcCode}
                          onChange={(e) => setSvcCode(e.target.value)}
                          placeholder="Code (e.g. J)"
                          className="px-3 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15"
                        />
                        <select
                          value={svcIconName}
                          onChange={(e) => setSvcIconName(e.target.value)}
                          className="px-3 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15 bg-white text-xs"
                        >
                          <option value="Compass">Compass</option>
                          <option value="Plane">Flights</option>
                          <option value="FileCheck2">Visa / Docs</option>
                          <option value="Globe2">Global</option>
                          <option value="Building2">Hotels</option>
                          <option value="CarFront">Transport</option>
                          <option value="HeartHandshake">Honeymoon</option>
                          <option value="Briefcase">Business</option>
                          <option value="ShieldCheck">Advisory</option>
                        </select>
                        <input
                          type="number"
                          value={svcSortOrder}
                          onChange={(e) => setSvcSortOrder(e.target.value)}
                          placeholder="Order"
                          className="px-3 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15"
                        />
                      </div>

                      <input
                        required
                        value={svcTitle}
                        onChange={(e) => setSvcTitle(e.target.value)}
                        placeholder="Service Title (e.g. VIP Concierge & Fast-Track)"
                        className="w-full px-3.5 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15"
                      />

                      <input
                        required
                        value={svcCategory}
                        onChange={(e) => setSvcCategory(e.target.value)}
                        placeholder="Category (e.g. VIP Travel & Arrivals)"
                        className="w-full px-3.5 py-2.5 min-h-[42px] rounded-xl border border-[#10243B]/15"
                      />

                      <textarea
                        required
                        rows={3}
                        value={svcDesc}
                        onChange={(e) => setSvcDesc(e.target.value)}
                        placeholder="Service description shown on homepage and services directory..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#10243B]/15"
                      />

                      <textarea
                        rows={4}
                        value={svcItems}
                        onChange={(e) => setSvcItems(e.target.value)}
                        placeholder="Included bullet points (one per line)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#10243B]/15"
                      />

                      {svcMediaType === 'image' && (
                        <div className="space-y-2.5 p-3.5 rounded-xl bg-[#FAF8F3] border border-[#10243B]/10">
                          <label className="block text-xs font-semibold text-[#10243B]">
                            Upload Service Image (JPEG, PNG, WebP, GIF, SVG · max 8 MB)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const inputEl = e.currentTarget;
                              const file = inputEl.files?.[0];
                              if (!file) return;
                              setSvcFormFeedback(null);
                              const url = await uploadAssetFile(
                                file,
                                'svc-image',
                                svcTitle || file.name,
                                svcCategory || 'Services',
                                'image'
                              );
                              inputEl.value = '';
                              if (url) {
                                setSvcMediaUrl(url);
                                setSvcImage(url);
                                setSvcFormFeedback({ type: 'ok', msg: 'Service photo uploaded and ready to publish.' });
                              } else {
                                setSvcFormFeedback({ type: 'error', msg: 'Image upload failed. Please try another file.' });
                              }
                            }}
                            className="w-full text-xs cursor-pointer"
                          />
                          {uploadingField === 'svc-image' && (
                            <p className="text-xs text-[#DC2626] font-medium">Uploading service photo...</p>
                          )}
                          <input
                            value={svcMediaUrl || svcImage}
                            onChange={(e) => {
                              setSvcMediaUrl(e.target.value);
                              setSvcImage(e.target.value);
                            }}
                            placeholder="Or paste HTTPS / /uploads/... Image URL"
                            className="w-full px-3 py-2 rounded-lg border border-[#10243B]/15 bg-white text-xs"
                          />
                          {(svcMediaUrl || svcImage) && (
                            <div className="aspect-[16/9] rounded-lg overflow-hidden border border-[#10243B]/10 bg-white">
                              <SafeImage
                                src={svcMediaUrl || svcImage}
                                alt="Service preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {svcMediaType === 'video' && (
                        <div className="space-y-2.5 p-3.5 rounded-xl bg-[#FAF8F3] border border-[#10243B]/10">
                          <label className="block text-xs font-semibold text-[#10243B]">
                            Upload Service Video (MP4, WebM, MOV, M4V · max 50 MB)
                          </label>
                          <input
                            type="file"
                            accept="video/*,.mp4,.mov,.webm,.m4v,.mkv,.avi"
                            onChange={async (e) => {
                              const inputEl = e.currentTarget;
                              const file = inputEl.files?.[0];
                              if (!file) return;
                              setSvcFormFeedback(null);
                              const url = await uploadAssetFile(
                                file,
                                'svc-video',
                                svcTitle || file.name,
                                svcCategory || 'Service Video',
                                'video'
                              );
                              inputEl.value = '';
                              if (url) {
                                setSvcMediaUrl(url);
                                setSvcFormFeedback({ type: 'ok', msg: 'Service video uploaded and ready to publish.' });
                              } else {
                                setSvcFormFeedback({ type: 'error', msg: 'Video upload failed. Check size/format and retry.' });
                              }
                            }}
                            className="w-full text-xs cursor-pointer"
                          />
                          {uploadingField === 'svc-video' && (
                            <p className="text-xs text-[#DC2626] font-medium">Uploading service video...</p>
                          )}
                          <input
                            value={svcMediaUrl}
                            onChange={(e) => setSvcMediaUrl(e.target.value)}
                            placeholder="Or paste HTTPS / /uploads/... Video URL"
                            className="w-full px-3 py-2 rounded-lg border border-[#10243B]/15 bg-white text-xs"
                          />
                          {svcMediaUrl && (
                            <video controls className="w-full aspect-[16/9] rounded-lg bg-[#10243B]" src={svcMediaUrl} />
                          )}
                        </div>
                      )}

                      {svcMediaType === 'youtube' && (
                        <div className="space-y-2.5 p-3.5 rounded-xl bg-[#FAF8F3] border border-[#10243B]/10">
                          <label className="block text-xs font-semibold text-[#10243B]">
                            YouTube Video or Shorts URL
                          </label>
                          <input
                            value={svcMediaUrl}
                            onChange={(e) => setSvcMediaUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                            className="w-full px-3 py-2 rounded-lg border border-[#10243B]/15 bg-white text-xs"
                          />
                          {svcYouTubePreview ? (
                            <iframe
                              src={svcYouTubePreview}
                              title="Service YouTube preview"
                              className="w-full aspect-[16/9] rounded-lg border border-[#10243B]/10"
                              allowFullScreen
                            />
                          ) : svcMediaUrl ? (
                            <p className="text-xs text-red-600">Enter a valid youtube.com or youtu.be URL.</p>
                          ) : null}
                        </div>
                      )}

                      {svcMediaType === 'gdrive' && (
                        <div className="space-y-2.5 p-3.5 rounded-xl bg-[#FAF8F3] border border-[#10243B]/10">
                          <label className="block text-xs font-semibold text-[#10243B]">
                            Google Drive Share Link (Anyone with link can view)
                          </label>
                          <input
                            value={svcMediaUrl}
                            onChange={(e) => setSvcMediaUrl(e.target.value)}
                            placeholder="https://drive.google.com/file/d/FILE_ID/view"
                            className="w-full px-3 py-2 rounded-lg border border-[#10243B]/15 bg-white text-xs"
                          />
                          {svcDrivePreview ? (
                            <iframe
                              src={svcDrivePreview}
                              title="Service Google Drive preview"
                              className="w-full aspect-[16/9] rounded-lg border border-[#10243B]/10"
                            />
                          ) : svcMediaUrl ? (
                            <p className="text-xs text-red-600">
                              Paste a Google Drive share URL containing /file/d/... or ?id=...
                            </p>
                          ) : null}
                        </div>
                      )}

                      {svcFormFeedback && (
                        <p
                          className={`p-3 rounded-xl text-xs font-medium border ${
                            svcFormFeedback.type === 'error'
                              ? 'bg-red-50 border-red-200 text-red-700'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          }`}
                        >
                          {svcFormFeedback.msg}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={uploadingField?.startsWith('svc-')}
                          className="flex-1 py-2.5 min-h-[42px] rounded-xl bg-[#10243B] text-white text-xs font-semibold hover:bg-[#193B59] disabled:opacity-60 cursor-pointer"
                        >
                          {uploadingField?.startsWith('svc-')
                            ? 'Uploading Media... Please Wait'
                            : editingServiceId
                              ? 'Update Service Division'
                              : 'Publish New Service'}
                        </button>
                        {editingServiceId && (
                          <button
                            type="button"
                            onClick={resetServiceForm}
                            className="px-4 py-2.5 rounded-xl border border-[#10243B]/15 text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>

                    <div className="lg:col-span-7 space-y-3">
                      {bundle.services.map((s) => (
                        <div
                          key={s.id}
                          className="bg-white border border-[#10243B]/10 rounded-2xl p-4 flex items-center justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <p className="text-xs text-[#DC2626] font-semibold">
                              Division {s.code} · {s.category} · {(s.mediaType || 'image').toUpperCase()}
                            </p>
                            <h3 className="font-display text-lg font-semibold text-[#10243B] truncate">
                              {s.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 text-xs font-semibold">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingServiceId(s.id);
                                setSvcCode(s.code);
                                setSvcTitle(s.title);
                                setSvcCategory(s.category);
                                setSvcDesc(s.description);
                                setSvcItems(parseStringList(s.items).join('\n'));
                                setSvcIconName(s.iconName || 'Compass');
                                setSvcMediaType((s.mediaType as ProjectMediaType) || 'image');
                                setSvcMediaUrl(s.mediaUrl || s.imageUrl || '');
                                setSvcImage(s.imageUrl || '');
                                setSvcSortOrder(String(s.sortOrder || 0));
                              }}
                              className="text-[#10243B] hover:text-[#DC2626] cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await apiFetch(`/api/admin/services/${s.id}`, { method: 'DELETE' });
                                  if (editingServiceId === s.id) resetServiceForm();
                                  notify('Service division deleted.');
                                  await Promise.all([loadDashboard(), refreshPublicData()]);
                                } catch (err: unknown) {
                                  notify(err instanceof Error ? err.message : 'Failed to delete service.');
                                }
                              }}
                              className="text-red-600 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. CUSTOMER REVIEWS */}
                {(viewAllSections || tab === 'reviews') && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <form
                      onSubmit={handleSaveTestimonial}
                      className="lg:col-span-5 bg-white border border-[#10243B]/10 rounded-2xl p-6 space-y-3 text-sm"
                    >
                      <h2 className="font-display text-xl font-semibold text-[#10243B]">
                        {editingRevId ? 'Edit Customer Review' : 'Add Authorised Customer Review'}
                      </h2>
                      <input
                        required
                        value={revAuthor}
                        onChange={(e) => setRevAuthor(e.target.value)}
                        placeholder="Client Name"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          required
                          value={revOrigin}
                          onChange={(e) => setRevOrigin(e.target.value)}
                          placeholder="Origin (e.g. Lagos, Nigeria)"
                          className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                        />
                        <input
                          required
                          value={revService}
                          onChange={(e) => setRevService(e.target.value)}
                          placeholder="Service Used"
                          className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                        />
                      </div>
                      <select
                        value={revRating}
                        onChange={(e) => setRevRating(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15 bg-white"
                      >
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                      </select>
                      <textarea
                        required
                        rows={3}
                        value={revQuote}
                        onChange={(e) => setRevQuote(e.target.value)}
                        placeholder="Verified client quote..."
                        className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                      />
                      <input
                        value={revSummary}
                        onChange={(e) => setRevSummary(e.target.value)}
                        placeholder="Experience summary (optional)"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                      />
                      <input
                        value={revLink}
                        onChange={(e) => setRevLink(e.target.value)}
                        placeholder="Verified external link (optional)"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                      />
                      <label className="flex items-center gap-2 text-xs text-[#475569]">
                        <input
                          type="checkbox"
                          checked={revIsPlaceholder}
                          onChange={(e) => setRevIsPlaceholder(e.target.checked)}
                        />
                        Mark as Sample Placeholder
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 min-h-[42px] rounded-xl bg-[#10243B] text-white text-xs font-semibold hover:bg-[#193B59] cursor-pointer"
                        >
                          {editingRevId ? 'Update Customer Review' : 'Publish Customer Review'}
                        </button>
                        {editingRevId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRevId(null);
                              setRevAuthor('');
                              setRevOrigin('');
                              setRevService('');
                              setRevRating('5');
                              setRevQuote('');
                              setRevSummary('');
                              setRevIsPlaceholder(false);
                              setRevLink('');
                            }}
                            className="px-4 py-2.5 rounded-xl border border-[#10243B]/15 text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>

                    <div className="lg:col-span-7 space-y-3">
                      {bundle.testimonials.map((t) => (
                        <div
                          key={t.id}
                          className="bg-white border border-[#10243B]/10 rounded-2xl p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#10243B]">
                              {t.authorName} · {t.origin}
                            </span>
                            <div className="flex items-center gap-3 font-semibold">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingRevId(t.id);
                                  setRevAuthor(t.authorName);
                                  setRevOrigin(t.origin);
                                  setRevService(t.serviceUsed);
                                  setRevRating(String(t.rating));
                                  setRevQuote(t.quote);
                                  setRevSummary(t.experienceSummary);
                                  setRevIsPlaceholder(t.isSamplePlaceholder);
                                  setRevLink(t.verifiedLink || '');
                                }}
                                className="text-[#10243B] hover:text-[#DC2626] cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await apiFetch(`/api/admin/testimonials/${t.id}`, {
                                      method: 'PUT',
                                      body: JSON.stringify({ published: !t.published }),
                                    });
                                    notify(t.published ? 'Review hidden from public site.' : 'Review published live.');
                                    await Promise.all([loadDashboard(), refreshPublicData()]);
                                  } catch (err: unknown) {
                                    notify(err instanceof Error ? err.message : 'Failed to update review visibility.');
                                  }
                                }}
                                className="text-[#10243B] hover:text-[#DC2626] cursor-pointer"
                              >
                                {t.published ? 'Hide' : 'Publish'}
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await apiFetch(`/api/admin/testimonials/${t.id}`, { method: 'DELETE' });
                                    if (editingRevId === t.id) setEditingRevId(null);
                                    notify('Review deleted.');
                                    await Promise.all([loadDashboard(), refreshPublicData()]);
                                  } catch (err: unknown) {
                                    notify(err instanceof Error ? err.message : 'Failed to delete review.');
                                  }
                                }}
                                className="text-red-600 cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-[#475569]">“{t.quote}”</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 9. FAQS */}
                {(viewAllSections || tab === 'faqs') && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <form
                      onSubmit={handleSaveFaq}
                      className="lg:col-span-5 bg-white border border-[#10243B]/10 rounded-2xl p-6 space-y-3 text-sm"
                    >
                      <h2 className="font-display text-xl font-semibold text-[#10243B]">
                        {editingFaqId ? 'Edit FAQ Entry' : 'Add FAQ'}
                      </h2>
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          required
                          value={faqCategory}
                          onChange={(e) => setFaqCategory(e.target.value)}
                          placeholder="Category"
                          className="col-span-2 px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                        />
                        <input
                          type="number"
                          value={faqSortOrder}
                          onChange={(e) => setFaqSortOrder(e.target.value)}
                          placeholder="Order"
                          className="px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                        />
                      </div>
                      <input
                        required
                        value={faqQuestion}
                        onChange={(e) => setFaqQuestion(e.target.value)}
                        placeholder="Question"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                      />
                      <textarea
                        required
                        rows={4}
                        value={faqAnswer}
                        onChange={(e) => setFaqAnswer(e.target.value)}
                        placeholder="Answer..."
                        className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 min-h-[42px] rounded-xl bg-[#10243B] text-white text-xs font-semibold hover:bg-[#193B59] cursor-pointer"
                        >
                          {editingFaqId ? 'Update FAQ Entry' : 'Add FAQ Entry'}
                        </button>
                        {editingFaqId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingFaqId(null);
                              setFaqQuestion('');
                              setFaqAnswer('');
                              setFaqSortOrder('0');
                            }}
                            className="px-4 py-2.5 rounded-xl border border-[#10243B]/15 text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>

                    <div className="lg:col-span-7 space-y-3">
                      {bundle.faqs.map((f) => (
                        <div
                          key={f.id}
                          className="bg-white border border-[#10243B]/10 rounded-2xl p-4 flex items-start justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <p className="text-xs text-[#DC2626] font-semibold">{f.category}</p>
                            <h3 className="text-sm font-semibold text-[#10243B] mt-0.5">{f.question}</h3>
                            <p className="text-xs text-[#475569] mt-1">{f.answer}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 text-xs font-semibold">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFaqId(f.id);
                                setFaqCategory(f.category);
                                setFaqQuestion(f.question);
                                setFaqAnswer(f.answer);
                                setFaqSortOrder(String(f.sortOrder || 0));
                              }}
                              className="text-[#10243B] hover:text-[#DC2626] cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await apiFetch(`/api/admin/faqs/${f.id}`, { method: 'DELETE' });
                                  if (editingFaqId === f.id) setEditingFaqId(null);
                                  notify('FAQ removed.');
                                  await Promise.all([loadDashboard(), refreshPublicData()]);
                                } catch (err: unknown) {
                                  notify(err instanceof Error ? err.message : 'Failed to delete FAQ.');
                                }
                              }}
                              className="text-red-600 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 10. MEDIA LIBRARY */}
                {(viewAllSections || tab === 'media') && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <form
                      onSubmit={handleMediaUpload}
                      className="lg:col-span-5 bg-white border border-[#10243B]/10 rounded-2xl p-6 space-y-3.5 text-sm"
                    >
                      <h2 className="font-display text-xl font-semibold text-[#10243B]">
                        Upload Photo or Video to Media Library
                      </h2>
                      <input
                        required
                        value={mediaTitle}
                        onChange={(e) => setMediaTitle(e.target.value)}
                        placeholder="Media Title"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                      />
                      <input
                        required
                        value={mediaCategory}
                        onChange={(e) => setMediaCategory(e.target.value)}
                        placeholder="Category (e.g. Dubai, Hotels, Honeymoon)"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                      />
                      <input
                        value={mediaAlt}
                        onChange={(e) => setMediaAlt(e.target.value)}
                        placeholder="Alt description"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                      />
                      <div>
                        <label className="block text-xs font-medium text-[#475569] mb-1">
                          Upload File (Image ≤ 8 MB or Video ≤ 50 MB)
                        </label>
                        <input
                          type="file"
                          accept="image/*,video/*,.mp4,.mov,.webm,.m4v,.mkv,.avi"
                          onChange={handleMediaFileSelect}
                          className="w-full text-xs cursor-pointer"
                        />
                        {mediaFileName && (
                          <p className="text-[11px] text-emerald-700 mt-1">Selected: {mediaFileName}</p>
                        )}
                      </div>
                      {!mediaDataUrl && (
                        <input
                          value={mediaExternalUrl}
                          onChange={(e) => setMediaExternalUrl(e.target.value)}
                          placeholder="Or enter verified HTTPS media URL"
                          className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                        />
                      )}
                      <button
                        type="submit"
                        className="w-full py-2.5 min-h-[42px] rounded-xl bg-[#10243B] text-white text-xs font-semibold hover:bg-[#193B59] cursor-pointer"
                      >
                        Save to Media Library
                      </button>
                    </form>

                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {bundle.mediaAssets.map((m) => (
                        <div
                          key={m.id}
                          className="bg-white border border-[#10243B]/10 rounded-2xl overflow-hidden text-xs"
                        >
                          <div className="aspect-[16/10] overflow-hidden bg-[#FAF8F3]">
                            {/\.(mp4|webm|mov)(\?|$)/i.test(m.url) ? (
                              <video src={m.url} controls className="w-full h-full object-cover" />
                            ) : (
                              <SafeImage src={m.url} alt={m.altText} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="p-3.5 space-y-1.5">
                            <p className="font-semibold text-[#10243B] truncate">{m.title}</p>
                            <p className="text-[#475569] truncate font-mono text-[11px]">{m.url}</p>
                            <div className="flex items-center justify-between pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(m.url);
                                  notify('URL copied to clipboard.');
                                }}
                                className="inline-flex items-center gap-1 text-[#10243B] hover:text-[#DC2626] font-semibold cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                Copy URL
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await apiFetch(`/api/admin/media/${m.id}`, { method: 'DELETE' });
                                    notify('Media removed.');
                                    await loadDashboard();
                                  } catch (err: unknown) {
                                    notify(err instanceof Error ? err.message : 'Failed to remove media.');
                                  }
                                }}
                                className="text-red-600 font-semibold cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 11. PASSWORDS, CHANGE PASSWORD & ASSIGN MANAGER ACCESS */}
                {(viewAllSections || tab === 'security') && (
                  <div className="space-y-8 max-w-5xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      {/* Change Own Password */}
                      <form
                        onSubmit={handleChangePassword}
                        className="bg-white border border-[#10243B]/10 rounded-2xl p-6 space-y-4 text-sm"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#FAF8F3] border border-[#10243B]/10 text-[#10243B] flex items-center justify-center">
                            <KeyRound className="w-4 h-4 text-[#DC2626]" />
                          </div>
                          <div>
                            <h2 className="font-display text-xl font-semibold text-[#10243B]">
                              Change My Password
                            </h2>
                            <p className="text-xs text-[#475569]">
                              Account: <strong>{passwordUser?.username || 'admin'}</strong>
                            </p>
                          </div>
                        </div>

                        {passwordUser && (
                          <div>
                            <label className="block text-xs font-semibold text-[#475569] mb-1">
                              Current Password
                            </label>
                            <input
                              type="password"
                              required
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Enter current password"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#10243B]/15"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-semibold text-[#475569] mb-1">
                            New Password (min. 6 characters)
                          </label>
                          <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#10243B]/15"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#475569] mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            required
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#10243B]/15"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 min-h-[44px] rounded-xl bg-[#10243B] text-white text-xs font-semibold hover:bg-[#193B59] cursor-pointer"
                        >
                          Update Password
                        </button>
                      </form>

                      {/* Assign Password to Manager (Full Dashboard Access) */}
                      <form
                        onSubmit={handleAddManager}
                        className="bg-white border border-[#10243B]/10 rounded-2xl p-6 space-y-4 text-sm"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#FAF8F3] border border-[#10243B]/10 text-[#10243B] flex items-center justify-center">
                            <UserPlus className="w-4 h-4 text-[#DC2626]" />
                          </div>
                          <div>
                            <h2 className="font-display text-xl font-semibold text-[#10243B]">
                              Assign Password to a Manager
                            </h2>
                            <p className="text-xs text-[#475569]">
                              Assigned managers receive full access to manage the Admin Dashboard.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#475569] mb-1">
                              Manager Username
                            </label>
                            <input
                              required
                              value={mgrUsername}
                              onChange={(e) => setMgrUsername(e.target.value)}
                              placeholder="e.g. manager1 or sarah.dubai"
                              className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#475569] mb-1">
                              Manager Full Name
                            </label>
                            <input
                              required
                              value={mgrDisplayName}
                              onChange={(e) => setMgrDisplayName(e.target.value)}
                              placeholder="e.g. Sarah Ahmed"
                              className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#475569] mb-1">
                              Assign Password
                            </label>
                            <input
                              type="password"
                              required
                              value={mgrPassword}
                              onChange={(e) => setMgrPassword(e.target.value)}
                              placeholder="Min. 6 characters"
                              className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#475569] mb-1">
                              Role &amp; Access Level
                            </label>
                            <select
                              value={mgrRole}
                              onChange={(e) => setMgrRole(e.target.value as 'manager' | 'super_admin')}
                              className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15 bg-white"
                            >
                              <option value="manager">Manager (Full Dashboard Access)</option>
                              <option value="super_admin">Primary Admin (Full Access)</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 min-h-[44px] rounded-xl bg-[#C9A45C] text-[#10243B] text-xs font-semibold hover:bg-[#b5914a] cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          Create / Update Manager Password
                        </button>
                      </form>
                    </div>

                    {/* Password & Manager Accounts Table */}
                    <div className="bg-white border border-[#10243B]/10 rounded-2xl overflow-hidden">
                      <div className="px-6 py-4 border-b border-[#10243B]/10">
                        <h3 className="font-display text-lg font-semibold text-[#10243B]">
                          Password &amp; Manager Accounts
                        </h3>
                        <p className="text-xs text-[#475569]">
                          All active accounts can sign in via <strong>/#</strong> with full Admin Dashboard control.
                        </p>
                      </div>
                      {bundle.managers.length === 0 ? (
                        <p className="p-6 text-xs text-[#475569]">
                          No password accounts saved in database yet. Assign a manager above or change your password to create one.
                        </p>
                      ) : (
                        <div className="divide-y divide-[#10243B]/10">
                          {bundle.managers.map((m) => (
                            <div
                              key={m.id}
                              className="p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                            >
                              <div>
                                <p className="font-semibold text-[#10243B] text-sm">
                                  {m.displayName}{' '}
                                  <span className="font-mono text-xs font-normal text-[#DC2626]">(@{m.username})</span>
                                </p>
                                <p className="text-[#475569] mt-0.5">
                                  Role: <strong className="text-[#10243B]">{m.role}</strong> ·{' '}
                                  {m.isActive ? 'Active (Full Access)' : 'Suspended'}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <input
                                  type="password"
                                  value={resetPwdMap[m.id] || ''}
                                  onChange={(e) =>
                                    setResetPwdMap((prev) => ({ ...prev, [m.id]: e.target.value }))
                                  }
                                  placeholder="New password..."
                                  className="px-3 py-1.5 rounded-lg border border-[#10243B]/15 text-xs w-36"
                                />
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const pw = resetPwdMap[m.id] || '';
                                    if (pw.length < 6) {
                                      notify('Reset password must be at least 6 characters.');
                                      return;
                                    }
                                    try {
                                      await apiFetch(`/api/admin/managers/${m.id}`, {
                                        method: 'PATCH',
                                        body: JSON.stringify({ newPassword: pw }),
                                      });
                                      setResetPwdMap((prev) => ({ ...prev, [m.id]: '' }));
                                      notify(`Password updated for ${m.username}.`);
                                    } catch (err: unknown) {
                                      notify(err instanceof Error ? err.message : 'Failed to reset password.');
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-[#FAF8F3] border border-[#10243B]/15 text-[#10243B] font-semibold cursor-pointer hover:border-[#C9A45C]"
                                >
                                  Reset Password
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await apiFetch(`/api/admin/managers/${m.id}`, {
                                        method: 'PATCH',
                                        body: JSON.stringify({ isActive: !m.isActive }),
                                      });
                                      notify('Manager status updated.');
                                      await loadDashboard();
                                    } catch (err: unknown) {
                                      notify(err instanceof Error ? err.message : 'Failed to update manager status.');
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-lg border border-[#10243B]/15 font-medium cursor-pointer"
                                >
                                  {m.isActive ? 'Suspend' : 'Activate'}
                                </button>
                                {m.username !== passwordUser?.username && m.username !== 'admin' && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        await apiFetch(`/api/admin/managers/${m.id}`, { method: 'DELETE' });
                                        notify('Manager account removed.');
                                        await loadDashboard();
                                      } catch (err: unknown) {
                                        notify(err instanceof Error ? err.message : 'Failed to remove manager.');
                                      }
                                    }}
                                    className="px-2.5 py-1.5 text-red-600 font-semibold hover:underline cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Google Sign-In Admins */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      <form
                        onSubmit={handleAddAdmin}
                        className="lg:col-span-5 bg-white border border-[#10243B]/10 rounded-2xl p-6 space-y-3.5 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-[#DC2626]" />
                          <h3 className="font-display text-lg font-semibold text-[#10243B]">
                            Authorise Google Email
                          </h3>
                        </div>
                        <p className="text-xs text-[#475569]">
                          Optionally allow a colleague to also enter via Google Sign-In.
                        </p>
                        <input
                          type="email"
                          required
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          placeholder="colleague@gmail.com"
                          className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15"
                        />
                        <select
                          value={newAdminRole}
                          onChange={(e) => setNewAdminRole(e.target.value as 'admin' | 'super_admin')}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#10243B]/15 bg-white"
                        >
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-[#10243B] text-white text-xs font-semibold hover:bg-[#193B59] cursor-pointer"
                        >
                          <Plus className="w-4 h-4 text-[#FF5252]" />
                          Add Authorised Google Email
                        </button>
                      </form>

                      <div className="lg:col-span-7 bg-white border border-[#10243B]/10 rounded-2xl divide-y divide-[#10243B]/10">
                        {bundle.admins.map((a) => (
                          <div key={a.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                            <div>
                              <p className="font-semibold text-[#10243B]">{a.email}</p>
                              <p className="text-[#475569]">
                                Role: {a.role} · {a.isActive ? 'Active' : 'Suspended'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await apiFetch(`/api/admin/admins/${a.id}`, {
                                      method: 'PATCH',
                                      body: JSON.stringify({ isActive: !a.isActive }),
                                    });
                                    notify('Administrator status updated.');
                                    await loadDashboard();
                                  } catch (err: unknown) {
                                    notify(err instanceof Error ? err.message : 'Failed to update administrator.');
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg border border-[#10243B]/15 cursor-pointer"
                              >
                                {a.isActive ? 'Suspend' : 'Activate'}
                              </button>
                              {a.email !== authUser?.email?.toLowerCase() && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await apiFetch(`/api/admin/admins/${a.id}`, { method: 'DELETE' });
                                      notify('Administrator removed.');
                                      await loadDashboard();
                                    } catch (err: unknown) {
                                      notify(err instanceof Error ? err.message : 'Failed to remove administrator.');
                                    }
                                  }}
                                  className="text-red-600 font-semibold hover:underline cursor-pointer"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </main>
        </div>
      </div>
    </>
  );
}
