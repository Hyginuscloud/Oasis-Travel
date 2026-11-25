export interface ServiceItem {
  id: number;
  code: string;
  category: string;
  title: string;
  description: string;
  items: string;
  iconName: string;
  mediaType?: ProjectMediaType | string;
  mediaUrl?: string | null;
  imageUrl: string | null;
  sortOrder: number;
}

export interface DestinationItem {
  id: number;
  slug: string;
  name: string;
  region: string;
  country: string;
  shortDescription: string;
  highlights: string;
  imageUrl: string;
  featured: boolean;
  sortOrder: number;
}

export interface PackageItem {
  id: number;
  slug: string;
  title: string;
  category: string;
  description: string;
  suggestedDuration: string;
  inclusions: string;
  priceNote: string;
  availabilityStatus: string;
  imageUrl: string;
  featured: boolean;
  sortOrder: number;
}

export interface TestimonialItem {
  id: number;
  authorName: string;
  origin: string;
  serviceUsed: string;
  rating: number;
  quote: string;
  experienceSummary: string;
  isSamplePlaceholder: boolean;
  verifiedLink: string | null;
  published: boolean;
}

export interface FaqItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
  published: boolean;
}

export interface MediaAssetItem {
  id: number;
  title: string;
  category: string;
  url: string;
  altText: string;
}

export interface EnquiryItem {
  id: number;
  referenceNumber: string;
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  countryOfResidence: string;
  serviceRequired: string;
  destination: string;
  preferredTravelDate: string;
  numberOfTravellers: number;
  budgetRange: string | null;
  message: string;
  channel: string;
  status: 'pending' | 'contacted' | 'processing' | 'completed' | 'cancelled';
  adminNotes: string | null;
  emailDispatched: boolean;
  createdAt: string;
}

export interface AdminAccountItem {
  id: number;
  email: string;
  role: string;
  addedBy: string | null;
  isActive: boolean;
  createdAt: string;
}

export type ProjectMediaType = 'image' | 'video' | 'youtube' | 'gdrive';

export interface DesignProjectItem {
  id: number;
  title: string;
  category: string;
  description: string;
  mediaType: ProjectMediaType;
  mediaUrl: string;
  thumbnailUrl: string | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface SpecialOfferItem {
  id: number;
  title: string;
  badge: string;
  description: string;
  mediaType: ProjectMediaType;
  mediaUrl: string;
  thumbnailUrl: string | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface DashboardUserItem {
  id: number;
  username: string;
  displayName: string;
  role: 'super_admin' | 'manager' | string;
  isActive: boolean;
  addedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicBootstrapData {
  settings: Record<string, string>;
  services: ServiceItem[];
  destinations: DestinationItem[];
  packages: PackageItem[];
  testimonials: TestimonialItem[];
  faqs: FaqItem[];
  mediaAssets: MediaAssetItem[];
  designProjects: DesignProjectItem[];
  specialOffers: SpecialOfferItem[];
}

export interface EnquiryPrefill {
  serviceRequired?: string;
  destination?: string;
  subjectLabel?: string;
}

export function parseStringList(raw: string | string[] | null | undefined): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}
