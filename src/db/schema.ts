import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').notNull().default('user'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const authorizedAdmins = pgTable('authorized_admins', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('admin'),
  addedBy: text('added_by'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const enquiries = pgTable('enquiries', {
  id: serial('id').primaryKey(),
  referenceNumber: text('reference_number').notNull().unique(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  nationality: text('nationality').notNull(),
  countryOfResidence: text('country_of_residence').notNull(),
  serviceRequired: text('service_required').notNull(),
  destination: text('destination').notNull(),
  preferredTravelDate: text('preferred_travel_date').notNull(),
  numberOfTravellers: integer('number_of_travellers').notNull().default(1),
  budgetRange: text('budget_range'),
  message: text('message').notNull(),
  channel: text('channel').notNull().default('web'),
  status: text('status').notNull().default('pending'),
  adminNotes: text('admin_notes'),
  emailDispatched: boolean('email_dispatched').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const destinations = pgTable('destinations', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  region: text('region').notNull(),
  country: text('country').notNull(),
  shortDescription: text('short_description').notNull(),
  highlights: text('highlights').notNull(),
  imageUrl: text('image_url').notNull(),
  featured: boolean('featured').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const packages = pgTable('packages', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  suggestedDuration: text('suggested_duration').notNull(),
  inclusions: text('inclusions').notNull(),
  priceNote: text('price_note').notNull().default('Custom quotation upon enquiry'),
  availabilityStatus: text('availability_status').notNull().default('Available for Custom Quote'),
  imageUrl: text('image_url').notNull(),
  featured: boolean('featured').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  category: text('category').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  items: text('items').notNull(),
  iconName: text('icon_name').notNull(),
  mediaType: text('media_type').notNull().default('image'),
  mediaUrl: text('media_url'),
  imageUrl: text('image_url'),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const testimonials = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  authorName: text('author_name').notNull(),
  origin: text('origin').notNull(),
  serviceUsed: text('service_used').notNull(),
  rating: integer('rating').notNull().default(5),
  quote: text('quote').notNull(),
  experienceSummary: text('experience_summary').notNull(),
  isSamplePlaceholder: boolean('is_sample_placeholder').notNull().default(true),
  verifiedLink: text('verified_link'),
  published: boolean('published').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const faqs = pgTable('faqs', {
  id: serial('id').primaryKey(),
  category: text('category').notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  published: boolean('published').notNull().default(true),
});

export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const mediaAssets = pgTable('media_assets', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  url: text('url').notNull(),
  altText: text('alt_text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const designProjects = pgTable('design_projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  mediaType: text('media_type').notNull().default('image'),
  mediaUrl: text('media_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  featured: boolean('featured').notNull().default(true),
  published: boolean('published').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const dashboardUsers = pgTable('dashboard_users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  displayName: text('display_name').notNull(),
  role: text('role').notNull().default('manager'),
  passwordHash: text('password_hash').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  addedBy: text('added_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const specialOffers = pgTable('special_offers', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  badge: text('badge').notNull().default('Special Offer'),
  description: text('description').notNull(),
  mediaType: text('media_type').notNull().default('image'),
  mediaUrl: text('media_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  featured: boolean('featured').notNull().default(true),
  published: boolean('published').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

