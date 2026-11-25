import { asc, desc, eq } from 'drizzle-orm';
import { db, pool } from './index.ts';
import {
  authorizedAdmins,
  dashboardUsers,
  designProjects,
  destinations,
  enquiries,
  faqs,
  mediaAssets,
  packages,
  services,
  siteSettings,
  specialOffers,
  testimonials,
  users,
} from './schema.ts';
import {
  CONCIERGE_IMAGE,
  DESERT_IMAGE,
  EUROPE_IMAGE,
  HERO_IMAGE,
  HONEYMOON_IMAGE,
  INITIAL_DESIGN_PROJECTS,
  INITIAL_DESTINATIONS,
  INITIAL_FAQS,
  INITIAL_MEDIA_ASSETS,
  INITIAL_PACKAGES,
  INITIAL_SERVICES,
  INITIAL_SITE_SETTINGS,
  INITIAL_SPECIAL_OFFERS,
  INITIAL_TESTIMONIALS,
} from './seedData.ts';

let seedPromise: Promise<void> | null = null;
let dashboardTablePromise: Promise<void> | null = null;
const SEED_IMAGE_SYNC_VERSION = '3';

export async function ensureDashboardUsersTable(): Promise<void> {
  if (dashboardTablePromise) return dashboardTablePromise;
  dashboardTablePromise = (async () => {
    try {
      await pool.query('SELECT 1 FROM dashboard_users LIMIT 1');
    } catch (checkError: unknown) {
      const code = (checkError as { code?: string })?.code;
      if (code === '42P01') {
        try {
          await pool.query(`
            CREATE TABLE IF NOT EXISTS dashboard_users (
              id SERIAL PRIMARY KEY,
              username TEXT NOT NULL UNIQUE,
              display_name TEXT NOT NULL,
              role TEXT NOT NULL DEFAULT 'manager',
              password_hash TEXT NOT NULL,
              is_active BOOLEAN NOT NULL DEFAULT TRUE,
              added_by TEXT,
              created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
          `);
        } catch (createError: unknown) {
          dashboardTablePromise = null;
          throw createError;
        }
      } else {
        dashboardTablePromise = null;
        throw checkError;
      }
    }
  })();
  return dashboardTablePromise;
}

export async function ensureSeeded(): Promise<void> {
  if (seedPromise) {
    return seedPromise;
  }
  seedPromise = (async () => {
    try {
      await ensureDashboardUsersTable();
      // Seed authorized owner email from platform metadata + env if configured
      const ownerEmails = ['hyginustina46@gmail.com'];
      if (process.env.ADMIN_EMAILS) {
        for (const em of process.env.ADMIN_EMAILS.split(',')) {
          const clean = em.trim().toLowerCase();
          if (clean) ownerEmails.push(clean);
        }
      }
      for (const email of ownerEmails) {
        await db
          .insert(authorizedAdmins)
          .values({
            email: email.toLowerCase(),
            role: 'super_admin',
            addedBy: 'system',
            isActive: true,
          })
          .onConflictDoNothing();
      }

      // Seed site settings if empty (and backfill any newly introduced keys)
      const existingSettings = await db.select().from(siteSettings);
      const existingSettingKeys = new Set(existingSettings.map((s) => s.key));
      for (const [key, value] of Object.entries(INITIAL_SITE_SETTINGS)) {
        if (!existingSettingKeys.has(key)) {
          await db.insert(siteSettings).values({ key, value }).onConflictDoNothing();
        }
      }

      // Seed services if empty
      const existingServices = await db.select().from(services);
      if (existingServices.length === 0) {
        for (const item of INITIAL_SERVICES) {
          await db.insert(services).values(item).onConflictDoNothing();
        }
      }

      // Seed destinations if empty
      const existingDestinations = await db.select().from(destinations);
      if (existingDestinations.length === 0) {
        for (const item of INITIAL_DESTINATIONS) {
          await db.insert(destinations).values(item).onConflictDoNothing();
        }
      }

      // Seed packages if empty
      const existingPackages = await db.select().from(packages);
      if (existingPackages.length === 0) {
        for (const item of INITIAL_PACKAGES) {
          await db.insert(packages).values(item).onConflictDoNothing();
        }
      }

      // Seed sample testimonials if empty
      const existingTestimonials = await db.select().from(testimonials);
      if (existingTestimonials.length === 0) {
        for (const item of INITIAL_TESTIMONIALS) {
          await db.insert(testimonials).values(item);
        }
      }

      // Seed FAQs if empty
      const existingFaqs = await db.select().from(faqs);
      if (existingFaqs.length === 0) {
        for (const item of INITIAL_FAQS) {
          await db.insert(faqs).values(item);
        }
      }

      // Seed media assets if empty
      const existingMedia = await db.select().from(mediaAssets);
      if (existingMedia.length === 0) {
        for (const item of INITIAL_MEDIA_ASSETS) {
          await db.insert(mediaAssets).values(item);
        }
      }

      // Seed design projects if empty
      const existingProjects = await db.select().from(designProjects);
      if (existingProjects.length === 0) {
        for (const item of INITIAL_DESIGN_PROJECTS) {
          await db.insert(designProjects).values(item);
        }
      }

      // Seed special offers once per database
      const seededOffersFlag = existingSettings.find((s) => s.key === 'seed_special_offers_v1');
      if (!seededOffersFlag) {
        const existingOffers = await db.select().from(specialOffers);
        if (existingOffers.length === 0) {
          for (const item of INITIAL_SPECIAL_OFFERS) {
            await db.insert(specialOffers).values(item);
          }
        }
        await db
          .insert(siteSettings)
          .values({ key: 'seed_special_offers_v1', value: '1', updatedAt: new Date() })
          .onConflictDoNothing();
      }

      // Versioned idempotent sync for existing databases seeded with older image assignments
      const syncSetting = existingSettings.find((s) => s.key === 'seed_image_sync_version');
      if (syncSetting?.value !== SEED_IMAGE_SYNC_VERSION) {
        const legacySharedImages = new Set([
          HERO_IMAGE,
          DESERT_IMAGE,
          HONEYMOON_IMAGE,
          EUROPE_IMAGE,
          CONCIERGE_IMAGE,
        ]);
        const legacyServiceImages = new Set([
          ...legacySharedImages,
          '/src/assets/images/palm_jumeirah_aerial_1795375303536.jpg',
          '/src/assets/images/dubai_frame_sunset_1795375303761.jpg',
          '/src/assets/images/museum_future_dubai_1795375332106.jpg',
          '/src/assets/images/abu_dhabi_mosque_1795375304484.jpg',
        ]);

        const destBySlug = new Map(existingDestinations.map((row) => [row.slug, row]));
        for (const item of INITIAL_DESTINATIONS) {
          const existing = destBySlug.get(item.slug);
          if (!existing) {
            await db.insert(destinations).values(item).onConflictDoNothing();
          } else if (legacySharedImages.has(existing.imageUrl) && existing.imageUrl !== item.imageUrl) {
            await db
              .update(destinations)
              .set({ imageUrl: item.imageUrl })
              .where(eq(destinations.id, existing.id));
          }
        }

        const pkgBySlug = new Map(existingPackages.map((row) => [row.slug, row]));
        for (const item of INITIAL_PACKAGES) {
          const existing = pkgBySlug.get(item.slug);
          if (!existing) {
            await db.insert(packages).values(item).onConflictDoNothing();
          } else if (legacySharedImages.has(existing.imageUrl) && existing.imageUrl !== item.imageUrl) {
            await db
              .update(packages)
              .set({ imageUrl: item.imageUrl })
              .where(eq(packages.id, existing.id));
          }
        }

        const svcByCode = new Map(existingServices.map((row) => [row.code, row]));
        for (const item of INITIAL_SERVICES) {
          const existing = svcByCode.get(item.code);
          if (!existing) {
            await db.insert(services).values(item).onConflictDoNothing();
          } else if (
            existing.imageUrl &&
            legacyServiceImages.has(existing.imageUrl) &&
            existing.imageUrl !== item.imageUrl
          ) {
            await db
              .update(services)
              .set({ imageUrl: item.imageUrl })
              .where(eq(services.id, existing.id));
          }
        }

        const existingUrls = new Set(existingMedia.map((m) => m.url));
        for (const asset of INITIAL_MEDIA_ASSETS) {
          if (!existingUrls.has(asset.url)) {
            await db.insert(mediaAssets).values(asset);
          }
        }

        await db
          .insert(siteSettings)
          .values({ key: 'seed_image_sync_version', value: SEED_IMAGE_SYNC_VERSION, updatedAt: new Date() })
          .onConflictDoUpdate({
            target: siteSettings.key,
            set: { value: SEED_IMAGE_SYNC_VERSION, updatedAt: new Date() },
          });
      }
    } catch (error) {
      seedPromise = null;
      console.error('Database seed error:', error);
      throw new Error('Failed to initialize application content.', { cause: error });
    }
  })();
  return seedPromise;
}

export async function upsertUserProfile(uid: string, email: string, displayName?: string | null) {
  try {
    const cleanEmail = email.toLowerCase();
    const adminRecord = await db
      .select()
      .from(authorizedAdmins)
      .where(eq(authorizedAdmins.email, cleanEmail));
    const role = adminRecord.length > 0 && adminRecord[0].isActive ? adminRecord[0].role : 'user';

    const result = await db
      .insert(users)
      .values({
        uid,
        email: cleanEmail,
        displayName: displayName || null,
        role,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: cleanEmail,
          displayName: displayName || null,
          role,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('upsertUserProfile failed:', error);
    throw new Error('Failed to synchronize user profile.', { cause: error });
  }
}

export async function isAuthorizedAdminEmail(email: string): Promise<{ authorized: boolean; role: string }> {
  try {
    const cleanEmail = email.toLowerCase();
    const envAdmins = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (cleanEmail === 'hyginustina46@gmail.com' || envAdmins.includes(cleanEmail)) {
      return { authorized: true, role: 'super_admin' };
    }

    const rows = await db
      .select()
      .from(authorizedAdmins)
      .where(eq(authorizedAdmins.email, cleanEmail));
    if (rows.length > 0 && rows[0].isActive) {
      return { authorized: true, role: rows[0].role };
    }
    return { authorized: false, role: 'user' };
  } catch (error) {
    console.error('isAuthorizedAdminEmail failed:', error);
    throw new Error('Failed to verify administrator permissions.', { cause: error });
  }
}

export async function getPublicBootstrap() {
  try {
    await ensureSeeded();
    const [
      settingsRows,
      serviceRows,
      destinationRows,
      packageRows,
      testimonialRows,
      faqRows,
      mediaRows,
      projectRows,
      offerRows,
    ] = await Promise.all([
      db.select().from(siteSettings),
      db.select().from(services).orderBy(asc(services.sortOrder), asc(services.id)),
      db.select().from(destinations).orderBy(asc(destinations.sortOrder), asc(destinations.id)),
      db.select().from(packages).orderBy(asc(packages.sortOrder), asc(packages.id)),
      db
        .select()
        .from(testimonials)
        .where(eq(testimonials.published, true))
        .orderBy(desc(testimonials.id)),
      db.select().from(faqs).where(eq(faqs.published, true)).orderBy(asc(faqs.sortOrder), asc(faqs.id)),
      db.select().from(mediaAssets).orderBy(desc(mediaAssets.id)),
      db
        .select()
        .from(designProjects)
        .where(eq(designProjects.published, true))
        .orderBy(asc(designProjects.sortOrder), desc(designProjects.id)),
      db
        .select()
        .from(specialOffers)
        .where(eq(specialOffers.published, true))
        .orderBy(asc(specialOffers.sortOrder), desc(specialOffers.id)),
    ]);

    const settings: Record<string, string> = {};
    for (const row of settingsRows) {
      settings[row.key] = row.value;
    }

    return {
      settings,
      services: serviceRows,
      destinations: destinationRows,
      packages: packageRows,
      testimonials: testimonialRows,
      faqs: faqRows,
      mediaAssets: mediaRows,
      designProjects: projectRows,
      specialOffers: offerRows,
    };
  } catch (error) {
    console.error('getPublicBootstrap failed:', error);
    throw new Error('Unable to load website content at this moment.', { cause: error });
  }
}

export async function createEnquiryRecord(input: {
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
  budgetRange?: string;
  message: string;
  channel: string;
  emailDispatched: boolean;
}) {
  try {
    const result = await db
      .insert(enquiries)
      .values({
        referenceNumber: input.referenceNumber,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        nationality: input.nationality,
        countryOfResidence: input.countryOfResidence,
        serviceRequired: input.serviceRequired,
        destination: input.destination,
        preferredTravelDate: input.preferredTravelDate,
        numberOfTravellers: input.numberOfTravellers,
        budgetRange: input.budgetRange || null,
        message: input.message,
        channel: input.channel,
        status: 'pending',
        emailDispatched: input.emailDispatched,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('createEnquiryRecord failed:', error);
    throw new Error('Failed to save your enquiry. Please try WhatsApp or email directly.', { cause: error });
  }
}

export async function markEnquiryEmailDispatched(id: number, dispatched: boolean) {
  try {
    await db
      .update(enquiries)
      .set({ emailDispatched: dispatched, updatedAt: new Date() })
      .where(eq(enquiries.id, id));
  } catch (error) {
    console.error('markEnquiryEmailDispatched failed:', error);
  }
}

export async function getAllEnquiries() {
  try {
    return await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
  } catch (error) {
    console.error('getAllEnquiries failed:', error);
    throw new Error('Failed to fetch customer enquiries.', { cause: error });
  }
}

export async function updateEnquiryStatus(id: number, status: string, adminNotes?: string) {
  try {
    const result = await db
      .update(enquiries)
      .set({
        status,
        ...(adminNotes !== undefined ? { adminNotes } : {}),
        updatedAt: new Date(),
      })
      .where(eq(enquiries.id, id))
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error('updateEnquiryStatus failed:', error);
    throw new Error('Failed to update enquiry record.', { cause: error });
  }
}

export async function deleteEnquiryRecord(id: number) {
  try {
    await db.delete(enquiries).where(eq(enquiries.id, id));
  } catch (error) {
    console.error('deleteEnquiryRecord failed:', error);
    throw new Error('Failed to delete enquiry record.', { cause: error });
  }
}

export async function getAdminDashboardBundle() {
  try {
    await ensureSeeded();
    const [
      enquiryRows,
      destinationRows,
      packageRows,
      serviceRows,
      testimonialRows,
      faqRows,
      settingsRows,
      mediaRows,
      adminRows,
      projectRows,
      offerRows,
      dashboardUserRows,
    ] = await Promise.all([
      db.select().from(enquiries).orderBy(desc(enquiries.createdAt)),
      db.select().from(destinations).orderBy(asc(destinations.sortOrder), asc(destinations.id)),
      db.select().from(packages).orderBy(asc(packages.sortOrder), asc(packages.id)),
      db.select().from(services).orderBy(asc(services.sortOrder), asc(services.id)),
      db.select().from(testimonials).orderBy(desc(testimonials.id)),
      db.select().from(faqs).orderBy(asc(faqs.sortOrder), asc(faqs.id)),
      db.select().from(siteSettings),
      db.select().from(mediaAssets).orderBy(desc(mediaAssets.id)),
      db.select().from(authorizedAdmins).orderBy(asc(authorizedAdmins.id)),
      db.select().from(designProjects).orderBy(asc(designProjects.sortOrder), desc(designProjects.id)),
      db.select().from(specialOffers).orderBy(asc(specialOffers.sortOrder), desc(specialOffers.id)),
      db
        .select({
          id: dashboardUsers.id,
          username: dashboardUsers.username,
          displayName: dashboardUsers.displayName,
          role: dashboardUsers.role,
          isActive: dashboardUsers.isActive,
          addedBy: dashboardUsers.addedBy,
          createdAt: dashboardUsers.createdAt,
          updatedAt: dashboardUsers.updatedAt,
        })
        .from(dashboardUsers)
        .orderBy(asc(dashboardUsers.id)),
    ]);

    const settings: Record<string, string> = {};
    for (const row of settingsRows) {
      settings[row.key] = row.value;
    }

    return {
      enquiries: enquiryRows,
      destinations: destinationRows,
      packages: packageRows,
      services: serviceRows,
      testimonials: testimonialRows,
      faqs: faqRows,
      settings,
      mediaAssets: mediaRows,
      admins: adminRows,
      designProjects: projectRows,
      specialOffers: offerRows,
      managers: dashboardUserRows,
    };
  } catch (error) {
    console.error('getAdminDashboardBundle failed:', error);
    throw new Error('Failed to load administrator dashboard data.', { cause: error });
  }
}

export async function createDestinationRecord(data: {
  slug: string;
  name: string;
  region: string;
  country: string;
  shortDescription: string;
  highlights: string;
  imageUrl: string;
  featured: boolean;
  sortOrder: number;
}) {
  try {
    const res = await db.insert(destinations).values(data).returning();
    return res[0];
  } catch (error) {
    console.error('createDestinationRecord failed:', error);
    throw new Error('Failed to create destination.', { cause: error });
  }
}

export async function updateDestinationRecord(
  id: number,
  data: Partial<{
    name: string;
    region: string;
    country: string;
    shortDescription: string;
    highlights: string;
    imageUrl: string;
    featured: boolean;
    sortOrder: number;
  }>
) {
  try {
    const res = await db.update(destinations).set(data).where(eq(destinations.id, id)).returning();
    return res[0] || null;
  } catch (error) {
    console.error('updateDestinationRecord failed:', error);
    throw new Error('Failed to update destination.', { cause: error });
  }
}

export async function deleteDestinationRecord(id: number) {
  try {
    await db.delete(destinations).where(eq(destinations.id, id));
  } catch (error) {
    console.error('deleteDestinationRecord failed:', error);
    throw new Error('Failed to delete destination.', { cause: error });
  }
}

export async function createPackageRecord(data: {
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
}) {
  try {
    const res = await db.insert(packages).values(data).returning();
    return res[0];
  } catch (error) {
    console.error('createPackageRecord failed:', error);
    throw new Error('Failed to create holiday package.', { cause: error });
  }
}

export async function updatePackageRecord(
  id: number,
  data: Partial<{
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
  }>
) {
  try {
    const res = await db.update(packages).set(data).where(eq(packages.id, id)).returning();
    return res[0] || null;
  } catch (error) {
    console.error('updatePackageRecord failed:', error);
    throw new Error('Failed to update holiday package.', { cause: error });
  }
}

export async function deletePackageRecord(id: number) {
  try {
    await db.delete(packages).where(eq(packages.id, id));
  } catch (error) {
    console.error('deletePackageRecord failed:', error);
    throw new Error('Failed to delete holiday package.', { cause: error });
  }
}

export async function createServiceRecord(data: {
  code: string;
  category: string;
  title: string;
  description: string;
  items: string;
  iconName: string;
  mediaType: string;
  mediaUrl: string | null;
  imageUrl: string | null;
  sortOrder: number;
}) {
  try {
    const res = await db.insert(services).values(data).returning();
    return res[0];
  } catch (error) {
    console.error('createServiceRecord failed:', error);
    throw new Error('Failed to create service division.', { cause: error });
  }
}

export async function updateServiceRecord(
  id: number,
  data: Partial<{
    code: string;
    category: string;
    title: string;
    description: string;
    items: string;
    iconName: string;
    mediaType: string;
    mediaUrl: string | null;
    imageUrl: string | null;
    sortOrder: number;
  }>
) {
  try {
    const res = await db.update(services).set(data).where(eq(services.id, id)).returning();
    return res[0] || null;
  } catch (error) {
    console.error('updateServiceRecord failed:', error);
    throw new Error('Failed to update service.', { cause: error });
  }
}

export async function deleteServiceRecord(id: number) {
  try {
    await db.delete(services).where(eq(services.id, id));
  } catch (error) {
    console.error('deleteServiceRecord failed:', error);
    throw new Error('Failed to delete service division.', { cause: error });
  }
}

export async function createTestimonialRecord(data: {
  authorName: string;
  origin: string;
  serviceUsed: string;
  rating: number;
  quote: string;
  experienceSummary: string;
  isSamplePlaceholder: boolean;
  verifiedLink?: string;
  published: boolean;
}) {
  try {
    const res = await db.insert(testimonials).values(data).returning();
    return res[0];
  } catch (error) {
    console.error('createTestimonialRecord failed:', error);
    throw new Error('Failed to save testimonial.', { cause: error });
  }
}

export async function updateTestimonialRecord(
  id: number,
  data: Partial<{
    authorName: string;
    origin: string;
    serviceUsed: string;
    rating: number;
    quote: string;
    experienceSummary: string;
    isSamplePlaceholder: boolean;
    verifiedLink: string;
    published: boolean;
  }>
) {
  try {
    const res = await db.update(testimonials).set(data).where(eq(testimonials.id, id)).returning();
    return res[0] || null;
  } catch (error) {
    console.error('updateTestimonialRecord failed:', error);
    throw new Error('Failed to update testimonial.', { cause: error });
  }
}

export async function deleteTestimonialRecord(id: number) {
  try {
    await db.delete(testimonials).where(eq(testimonials.id, id));
  } catch (error) {
    console.error('deleteTestimonialRecord failed:', error);
    throw new Error('Failed to delete testimonial.', { cause: error });
  }
}

export async function createFaqRecord(data: {
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
  published: boolean;
}) {
  try {
    const res = await db.insert(faqs).values(data).returning();
    return res[0];
  } catch (error) {
    console.error('createFaqRecord failed:', error);
    throw new Error('Failed to create FAQ.', { cause: error });
  }
}

export async function updateFaqRecord(
  id: number,
  data: Partial<{
    category: string;
    question: string;
    answer: string;
    sortOrder: number;
    published: boolean;
  }>
) {
  try {
    const res = await db.update(faqs).set(data).where(eq(faqs.id, id)).returning();
    return res[0] || null;
  } catch (error) {
    console.error('updateFaqRecord failed:', error);
    throw new Error('Failed to update FAQ.', { cause: error });
  }
}

export async function deleteFaqRecord(id: number) {
  try {
    await db.delete(faqs).where(eq(faqs.id, id));
  } catch (error) {
    console.error('deleteFaqRecord failed:', error);
    throw new Error('Failed to delete FAQ.', { cause: error });
  }
}

export async function upsertSiteSettings(entries: Record<string, string>) {
  try {
    for (const [key, value] of Object.entries(entries)) {
      await db
        .insert(siteSettings)
        .values({ key, value, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: { value, updatedAt: new Date() },
        });
    }
  } catch (error) {
    console.error('upsertSiteSettings failed:', error);
    throw new Error('Failed to save site settings.', { cause: error });
  }
}

export async function createMediaAssetRecord(data: {
  title: string;
  category: string;
  url: string;
  altText: string;
}) {
  try {
    const res = await db.insert(mediaAssets).values(data).returning();
    return res[0];
  } catch (error) {
    console.error('createMediaAssetRecord failed:', error);
    throw new Error('Failed to save media record.', { cause: error });
  }
}

export async function deleteMediaAssetRecord(id: number) {
  try {
    const existing = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id));
    await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
    return existing[0] || null;
  } catch (error) {
    console.error('deleteMediaAssetRecord failed:', error);
    throw new Error('Failed to remove media asset.', { cause: error });
  }
}

export async function addAuthorizedAdmin(email: string, role: string, addedBy: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const res = await db
      .insert(authorizedAdmins)
      .values({ email: cleanEmail, role, addedBy, isActive: true })
      .onConflictDoUpdate({
        target: authorizedAdmins.email,
        set: { role, isActive: true, addedBy },
      })
      .returning();
    return res[0];
  } catch (error) {
    console.error('addAuthorizedAdmin failed:', error);
    throw new Error('Failed to add authorized administrator.', { cause: error });
  }
}

export async function updateAuthorizedAdmin(id: number, isActive: boolean, role?: string) {
  try {
    const res = await db
      .update(authorizedAdmins)
      .set({ isActive, ...(role ? { role } : {}) })
      .where(eq(authorizedAdmins.id, id))
      .returning();
    return res[0] || null;
  } catch (error) {
    console.error('updateAuthorizedAdmin failed:', error);
    throw new Error('Failed to update administrator account.', { cause: error });
  }
}

export async function deleteAuthorizedAdmin(id: number) {
  try {
    await db.delete(authorizedAdmins).where(eq(authorizedAdmins.id, id));
  } catch (error) {
    console.error('deleteAuthorizedAdmin failed:', error);
    throw new Error('Failed to remove administrator account.', { cause: error });
  }
}

// Design Projects CRUD
export async function createDesignProjectRecord(data: {
  title: string;
  category: string;
  description: string;
  mediaType: string;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
}) {
  try {
    const res = await db.insert(designProjects).values(data).returning();
    return res[0];
  } catch (error) {
    console.error('createDesignProjectRecord failed:', error);
    throw new Error('Failed to save design project.', { cause: error });
  }
}

export async function updateDesignProjectRecord(
  id: number,
  data: Partial<{
    title: string;
    category: string;
    description: string;
    mediaType: string;
    mediaUrl: string;
    thumbnailUrl: string | null;
    featured: boolean;
    published: boolean;
    sortOrder: number;
  }>
) {
  try {
    const res = await db.update(designProjects).set(data).where(eq(designProjects.id, id)).returning();
    return res[0] || null;
  } catch (error) {
    console.error('updateDesignProjectRecord failed:', error);
    throw new Error('Failed to update design project.', { cause: error });
  }
}

export async function deleteDesignProjectRecord(id: number) {
  try {
    await db.delete(designProjects).where(eq(designProjects.id, id));
  } catch (error) {
    console.error('deleteDesignProjectRecord failed:', error);
    throw new Error('Failed to delete design project.', { cause: error });
  }
}

// Special Offers CRUD
export async function createSpecialOfferRecord(data: {
  title: string;
  badge: string;
  description: string;
  mediaType: string;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
}) {
  try {
    const res = await db.insert(specialOffers).values(data).returning();
    return res[0];
  } catch (error) {
    console.error('createSpecialOfferRecord failed:', error);
    throw new Error('Failed to save special offer.', { cause: error });
  }
}

export async function updateSpecialOfferRecord(
  id: number,
  data: Partial<{
    title: string;
    badge: string;
    description: string;
    mediaType: string;
    mediaUrl: string;
    thumbnailUrl: string | null;
    featured: boolean;
    published: boolean;
    sortOrder: number;
  }>
) {
  try {
    const res = await db.update(specialOffers).set(data).where(eq(specialOffers.id, id)).returning();
    return res[0] || null;
  } catch (error) {
    console.error('updateSpecialOfferRecord failed:', error);
    throw new Error('Failed to update special offer.', { cause: error });
  }
}

export async function deleteSpecialOfferRecord(id: number) {
  try {
    await db.delete(specialOffers).where(eq(specialOffers.id, id));
  } catch (error) {
    console.error('deleteSpecialOfferRecord failed:', error);
    throw new Error('Failed to delete special offer.', { cause: error });
  }
}

// Dashboard Password & Manager Accounts
export async function findDashboardUserByUsername(username: string) {
  try {
    await ensureDashboardUsersTable();
    const clean = username.trim().toLowerCase();
    const rows = await db.select().from(dashboardUsers).where(eq(dashboardUsers.username, clean));
    return rows[0] || null;
  } catch (error) {
    console.error('findDashboardUserByUsername failed:', error);
    throw new Error('Failed to look up dashboard user.', { cause: error });
  }
}

export async function hasAnyDashboardSuperAdmin(): Promise<boolean> {
  try {
    await ensureDashboardUsersTable();
    const rows = await db
      .select({ id: dashboardUsers.id })
      .from(dashboardUsers)
      .where(eq(dashboardUsers.role, 'super_admin'));
    return rows.length > 0;
  } catch (error) {
    console.error('hasAnyDashboardSuperAdmin failed:', error);
    return false;
  }
}

export async function createOrClaimSuperAdmin(username: string, displayName: string, passwordHash: string) {
  try {
    await ensureDashboardUsersTable();
    const clean = username.trim().toLowerCase();
    const res = await db
      .insert(dashboardUsers)
      .values({
        username: clean,
        displayName,
        role: 'super_admin',
        passwordHash,
        isActive: true,
        addedBy: 'setup',
      })
      .onConflictDoNothing()
      .returning();
    return res[0] || null;
  } catch (error) {
    console.error('createOrClaimSuperAdmin failed:', error);
    throw new Error('Failed to save administrator credentials.', { cause: error });
  }
}

export async function upsertDashboardUserPassword(
  username: string,
  displayName: string,
  role: string,
  passwordHash: string,
  addedBy: string
) {
  try {
    await ensureDashboardUsersTable();
    const clean = username.trim().toLowerCase();
    const res = await db
      .insert(dashboardUsers)
      .values({
        username: clean,
        displayName,
        role,
        passwordHash,
        isActive: true,
        addedBy,
      })
      .onConflictDoUpdate({
        target: dashboardUsers.username,
        set: {
          displayName,
          role,
          passwordHash,
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning({
        id: dashboardUsers.id,
        username: dashboardUsers.username,
        displayName: dashboardUsers.displayName,
        role: dashboardUsers.role,
        isActive: dashboardUsers.isActive,
        addedBy: dashboardUsers.addedBy,
        createdAt: dashboardUsers.createdAt,
        updatedAt: dashboardUsers.updatedAt,
      });
    return res[0];
  } catch (error) {
    console.error('upsertDashboardUserPassword failed:', error);
    throw new Error('Failed to save dashboard user credentials.', { cause: error });
  }
}

export async function updateDashboardUserById(
  id: number,
  updates: Partial<{ displayName: string; isActive: boolean; passwordHash: string; role: string }>
) {
  try {
    const res = await db
      .update(dashboardUsers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(dashboardUsers.id, id))
      .returning({
        id: dashboardUsers.id,
        username: dashboardUsers.username,
        displayName: dashboardUsers.displayName,
        role: dashboardUsers.role,
        isActive: dashboardUsers.isActive,
        addedBy: dashboardUsers.addedBy,
        createdAt: dashboardUsers.createdAt,
        updatedAt: dashboardUsers.updatedAt,
      });
    return res[0] || null;
  } catch (error) {
    console.error('updateDashboardUserById failed:', error);
    throw new Error('Failed to update manager account.', { cause: error });
  }
}

export async function deleteDashboardUserById(id: number) {
  try {
    await db.delete(dashboardUsers).where(eq(dashboardUsers.id, id));
  } catch (error) {
    console.error('deleteDashboardUserById failed:', error);
    throw new Error('Failed to delete manager account.', { cause: error });
  }
}

