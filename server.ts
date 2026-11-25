import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  addAuthorizedAdmin,
  createDesignProjectRecord,
  createDestinationRecord,
  createEnquiryRecord,
  createFaqRecord,
  createMediaAssetRecord,
  createOrClaimSuperAdmin,
  createPackageRecord,
  createServiceRecord,
  createSpecialOfferRecord,
  createTestimonialRecord,
  deleteAuthorizedAdmin,
  deleteDashboardUserById,
  deleteDesignProjectRecord,
  deleteDestinationRecord,
  deleteEnquiryRecord,
  deleteFaqRecord,
  deleteMediaAssetRecord,
  deletePackageRecord,
  deleteServiceRecord,
  deleteSpecialOfferRecord,
  deleteTestimonialRecord,
  ensureSeeded,
  findDashboardUserByUsername,
  getAdminDashboardBundle,
  getAllEnquiries,
  getPublicBootstrap,
  hasAnyDashboardSuperAdmin,
  markEnquiryEmailDispatched,
  updateAuthorizedAdmin,
  updateDashboardUserById,
  updateDesignProjectRecord,
  updateDestinationRecord,
  updateEnquiryStatus,
  updateFaqRecord,
  updatePackageRecord,
  updateServiceRecord,
  updateSpecialOfferRecord,
  updateTestimonialRecord,
  upsertDashboardUserPassword,
  upsertSiteSettings,
} from './src/db/repository.ts';
import { dispatchEnquiryEmails } from './src/lib/mailer.ts';
import {
  extractGoogleDriveEmbedUrl,
  extractYouTubeEmbedUrl,
  isSafeHttpOrLocalUrl,
  normalizeExternalMediaUrl,
} from './src/lib/mediaEmbeds.ts';
import {
  hashPassword,
  signAdminSessionToken,
  verifyConstantTimeSecret,
  verifyPasswordHash,
} from './src/lib/passwordAuth.ts';
import { AuthRequest, requireAdmin, requireAuth } from './src/middleware/auth.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = Boolean(process.env.VERCEL);
const UPLOADS_DIR = isVercel ? path.resolve('/tmp', 'oasis-uploads') : path.resolve(__dirname, 'uploads');

try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('Could not initialize local uploads directory:', err);
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.set('trust proxy', 1);
app.disable('x-powered-by');

// Basic security headers compatible with embedded preview iframes
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use('/api/admin/media/upload', express.json({ limit: '85mb' }));
app.use(express.json({ limit: '8mb' }));
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));

const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many enquiry submissions. Please wait a few minutes or contact us on WhatsApp.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait a few minutes and try again.' },
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded for administration requests.' },
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 35,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI assistant requests. Please try again in a few minutes or chat on WhatsApp.' },
});

function sanitizeSlug(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64) || `item-${Date.now()}`
  );
}

function escapeCsvCell(value: unknown): string {
  const str = String(value ?? '');
  const safe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${safe.replace(/"/g, '""')}"`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length >= 7 && digits.length <= 16;
}

function isSafeMediaUrl(url: string): boolean {
  return isSafeHttpOrLocalUrl(url);
}

function validateProjectMedia(mediaType: string, rawUrl: string): { valid: boolean; normalizedUrl: string; error?: string } {
  const normalized = normalizeExternalMediaUrl(rawUrl);
  if (!normalized) return { valid: false, normalizedUrl: '', error: 'Media URL or uploaded file is required.' };
  if (mediaType === 'youtube') {
    const embed = extractYouTubeEmbedUrl(normalized);
    if (!embed) {
      return { valid: false, normalizedUrl: '', error: 'Please provide a valid YouTube video or Shorts URL.' };
    }
    return { valid: true, normalizedUrl: normalized };
  }
  if (mediaType === 'gdrive') {
    const embed = extractGoogleDriveEmbedUrl(normalized);
    if (!embed) {
      return {
        valid: false,
        normalizedUrl: '',
        error: 'Please provide a valid Google Drive share link (drive.google.com/file/d/... or drive/folders/...).',
      };
    }
    return { valid: true, normalizedUrl: normalized };
  }
  if (mediaType === 'image' || mediaType === 'video') {
    if (!isSafeMediaUrl(normalized)) {
      return { valid: false, normalizedUrl: '', error: 'Please upload a valid file or enter an HTTPS media URL.' };
    }
    return { valid: true, normalizedUrl: normalized };
  }
  return { valid: false, normalizedUrl: '', error: 'Unsupported media type.' };
}

// Health endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'oasis-travel-dubai' });
});

// SEO: robots.txt & sitemap.xml
app.get('/robots.txt', (req: Request, res: Response) => {
  const baseUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
  res.type('text/plain');
  res.send(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /api/admin',
      '',
      `Sitemap: ${baseUrl}/sitemap.xml`,
    ].join('\n')
  );
});

app.get('/sitemap.xml', (req: Request, res: Response) => {
  const baseUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
  const routes = [
    '/',
    '/about',
    '/story',
    '/services',
    '/destinations',
    '/packages',
    '/vision',
    '/reviews',
    '/faq',
    '/contact',
    '/legal',
  ];
  const lastmod = new Date().toISOString().split('T')[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route === '/' || route === '/packages' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
  res.type('application/xml');
  res.send(xml);
});

// Public content bootstrap
app.get('/api/public/bootstrap', async (_req: Request, res: Response) => {
  try {
    const data = await getPublicBootstrap();
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to load website content.';
    res.status(500).json({ error: message });
  }
});

// Public customer enquiry submission
app.post('/api/enquiries', enquiryLimiter, async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const fullName = String(body.fullName || '').trim();
    const email = String(body.email || '').trim();
    const phone = String(body.phone || '').trim();
    const nationality = String(body.nationality || '').trim();
    const countryOfResidence = String(body.countryOfResidence || '').trim();
    const serviceRequired = String(body.serviceRequired || '').trim();
    const destination = String(body.destination || '').trim();
    const preferredTravelDate = String(body.preferredTravelDate || '').trim();
    const numberOfTravellers = Number(body.numberOfTravellers || 1);
    const budgetRange = body.budgetRange ? String(body.budgetRange).trim().slice(0, 120) : undefined;
    const message = String(body.message || '').trim();
    const channel = ['web', 'whatsapp', 'email'].includes(String(body.channel)) ? String(body.channel) : 'web';

    if (fullName.length < 2 || fullName.length > 120) {
      return res.status(400).json({ error: 'Please provide your full name (at least 2 characters).' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Please provide a valid mobile telephone number including country code.' });
    }
    if (!nationality || !countryOfResidence) {
      return res.status(400).json({ error: 'Please enter both your nationality and country of residence.' });
    }
    if (!serviceRequired || !destination || !preferredTravelDate) {
      return res.status(400).json({ error: 'Please select a service, destination, and preferred travel date.' });
    }
    if (!Number.isInteger(numberOfTravellers) || numberOfTravellers < 1 || numberOfTravellers > 200) {
      return res.status(400).json({ error: 'Number of travellers must be between 1 and 200.' });
    }
    if (message.length < 5 || message.length > 4000) {
      return res.status(400).json({ error: 'Please provide brief details about your enquiry (at least 5 characters).' });
    }

    const referenceNumber = `OAS-${new Date().getFullYear()}-${crypto.randomInt(1000, 9999)}`;

    const record = await createEnquiryRecord({
      referenceNumber,
      fullName,
      email,
      phone,
      nationality,
      countryOfResidence,
      serviceRequired,
      destination,
      preferredTravelDate,
      numberOfTravellers,
      budgetRange,
      message,
      channel,
      emailDispatched: false,
    });

    const mailResult = await dispatchEnquiryEmails({
      referenceNumber,
      fullName,
      email,
      phone,
      nationality,
      countryOfResidence,
      serviceRequired,
      destination,
      preferredTravelDate,
      numberOfTravellers,
      budgetRange,
      message,
    });

    if (mailResult.dispatched && record) {
      await markEnquiryEmailDispatched(record.id, true);
    }

    const whatsappSummary = [
      `Hello Oasis Travel Consultancy Dubai,`,
      `Enquiry Ref: ${referenceNumber}`,
      `Name: ${fullName}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Nationality: ${nationality} | Residence: ${countryOfResidence}`,
      `Service: ${serviceRequired}`,
      `Destination: ${destination}`,
      `Travel Date: ${preferredTravelDate}`,
      `Travellers: ${numberOfTravellers}`,
      budgetRange ? `Budget: ${budgetRange}` : null,
      `Details: ${message}`,
    ]
      .filter(Boolean)
      .join('\n');

    res.status(201).json({
      success: true,
      referenceNumber,
      emailDispatched: mailResult.dispatched,
      mailMode: mailResult.mode,
      whatsappUrl: `https://wa.me/971525509694?text=${encodeURIComponent(whatsappSummary)}`,
    });
  } catch (error: unknown) {
    console.error('Enquiry submission error:', error);
    const message = error instanceof Error ? error.message : 'Unable to submit enquiry right now.';
    res.status(500).json({ error: message });
  }
});

// Public WhatsApp AI Travel Concierge (@google/genai)
app.post('/api/ai/assistant', aiLimiter, async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return res.status(503).json({
        error: 'The AI travel concierge is temporarily unavailable. Please tap Continue on WhatsApp to speak directly with our Dubai team.',
      });
    }

    const rawMessages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const normalizedMessages = rawMessages
      .slice(-10)
      .map((m: unknown) => {
        const obj = (m && typeof m === 'object' ? m : {}) as Record<string, unknown>;
        const role = obj.role === 'model' ? 'model' : 'user';
        const text = String(obj.text || '').trim().slice(0, 1200);
        return { role, text };
      })
      .filter((m: { role: string; text: string }) => Boolean(m.text));

    if (normalizedMessages.length === 0) {
      return res.status(400).json({ error: 'Please enter a travel question.' });
    }

    const bootstrap = await getPublicBootstrap();
    const st = bootstrap.settings;
    const waNumber = (st.whatsappNumber || '971525509694').replace(/[^0-9]/g, '');

    const serviceList = bootstrap.services.map((svc) => `- ${svc.title} (${svc.category}): ${svc.description}`).join('\n');
    const packageList = bootstrap.packages.map((p) => `- ${p.title} (${p.category}, ${p.suggestedDuration})`).join('\n');
    const destList = bootstrap.destinations.map((d) => `${d.name} (${d.region})`).join(', ');
    const faqList = bootstrap.faqs
      .slice(0, 8)
      .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
      .join('\n');

    const systemInstruction = [
      `You are the official WhatsApp Travel Concierge for ${st.businessName || 'Oasis Travel and Tourism Consultancy Dubai'} in ${st.location || 'Dubai, United Arab Emirates'}.`,
      `Office Hours: ${st.hoursWeekday || 'Monday – Saturday: 8:00 AM – 8:00 PM (GST)'} (${st.hoursSunday || 'Sunday: Closed'}). Email: ${st.email || 'Oasistravel46@gmail.com'}.`,
      `Tone: Warm, professional, concise, trustworthy, and culturally attentive to travellers from Nigeria, across Africa, and worldwide.`,
      `Rules:`,
      `1. Never guarantee visa approval, job offers, work permits, or traffic fine cancellations; state clearly that all visa and official decisions rest with relevant government authorities.`,
      `2. Never invent fixed airline or hotel prices; explain that every package is custom-quoted transparently upon enquiry.`,
      `3. Keep replies concise (2–4 short paragraphs or clear bullet points) suited for mobile & WhatsApp chat, and invite the user to click "Continue on WhatsApp" to send their summary directly to the Oasis desk.`,
      `Our Services:\n${serviceList}`,
      `Featured Packages:\n${packageList}`,
      `Destinations Covered: ${destList}`,
      `Key FAQs:\n${faqList}`,
    ].join('\n\n');

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const contents = normalizedMessages.map((m: { role: string; text: string }) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    let response: Awaited<ReturnType<typeof ai.models.generateContent>> | null = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        });
        break;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err || '');
        const isTransient = /503|high demand|unavailable|overloaded|429|RESOURCE_EXHAUSTED/i.test(msg);
        if (!isTransient || attempt === 2) throw err;
        await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
      }
    }

    const reply = (response?.text || '').trim();
    if (!reply) {
      return res.status(502).json({
        error: 'No response was generated. Please try again or continue directly on WhatsApp.',
      });
    }

    const lastUserPrompt = [...normalizedMessages].reverse().find((m) => m.role === 'user')?.text || '';
    const waPrefill = `Hello Oasis Travel and Tourism Consultancy Dubai, I was chatting with your website concierge about: "${lastUserPrompt}"`;

    res.json({
      reply,
      whatsappUrl: `https://wa.me/${waNumber}?text=${encodeURIComponent(waPrefill)}`,
    });
  } catch (error: unknown) {
    console.error('WhatsApp AI Assistant error:', error);
    const rawMsg = error instanceof Error ? error.message : 'Unable to reach the travel assistant right now.';
    const friendlyMsg =
      /503|high demand|UNAVAILABLE/i.test(rawMsg)
        ? 'Our AI travel assistant is temporarily busy due to high demand. Please retry in a moment or tap Continue on WhatsApp to chat directly with our Dubai team.'
        : /API_KEY_INVALID|PERMISSION_DENIED|403|401/i.test(rawMsg)
          ? 'The AI travel assistant configuration needs attention in Settings > Secrets. Please tap Continue on WhatsApp to chat directly with our Dubai team.'
          : rawMsg.startsWith('{')
            ? 'Our AI travel assistant could not respond just now. Please tap Continue on WhatsApp to chat directly with our Dubai team.'
            : rawMsg;
    res.status(/503|high demand|UNAVAILABLE/i.test(rawMsg) ? 503 : 502).json({ error: friendlyMsg });
  }
});

// ================= ADMIN / MANAGER PASSWORD AUTH ROUTES =================
function getConfiguredEnvPasscode(): string {
  const raw = (process.env.ADMIN_PASSCODE || '').trim();
  if (!raw) return '';
  if (
    raw.length >= 2 &&
    ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'")))
  ) {
    return raw.slice(1, -1).trim();
  }
  return raw;
}

function normalizeDashboardUsername(raw: unknown): string {
  const clean = String(raw || 'admin').trim().toLowerCase() || 'admin';
  if (clean === 'administrator' || clean === 'super_admin' || clean === 'hyginustina46@gmail.com') {
    return 'admin';
  }
  return clean;
}

app.get('/api/auth/status', async (_req: Request, res: Response) => {
  const envPasscode = getConfiguredEnvPasscode();
  try {
    await ensureSeeded();
    const hasClaimedAdmin = await hasAnyDashboardSuperAdmin();
    res.json({
      envPasscodeConfigured: Boolean(envPasscode),
      hasClaimedAdmin,
      requiresSetup: !envPasscode && !hasClaimedAdmin,
      dbConnected: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to check database connection.';
    res.json({
      envPasscodeConfigured: Boolean(envPasscode),
      hasClaimedAdmin: false,
      requiresSetup: !envPasscode,
      dbConnected: false,
      dbError: message,
    });
  }
});

app.post('/api/auth/setup', authLimiter, async (req: Request, res: Response) => {
  try {
    await ensureSeeded();
    const envPasscode = getConfiguredEnvPasscode();
    if (envPasscode) {
      return res.status(403).json({
        error: 'Administrator passcode is managed by server environment configuration.',
      });
    }
    const alreadyClaimed = await hasAnyDashboardSuperAdmin();
    if (alreadyClaimed) {
      return res.status(403).json({
        error: 'Initial administrator password has already been set. Please sign in.',
      });
    }
    const password = String(req.body?.password || '');
    const displayName = String(req.body?.displayName || 'Primary Administrator').trim().slice(0, 80);
    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({ error: 'Password must be between 6 and 128 characters.' });
    }
    const created = await createOrClaimSuperAdmin('admin', displayName || 'Primary Administrator', hashPassword(password));
    if (!created) {
      return res.status(409).json({ error: 'Administrator account already claimed. Please sign in.' });
    }
    const token = signAdminSessionToken({
      sub: 'admin',
      username: 'admin',
      displayName: created.displayName,
      role: created.role,
      source: 'password',
    });
    res.status(201).json({
      token,
      user: {
        username: created.username,
        displayName: created.displayName,
        role: created.role,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to complete administrator setup.';
    res.status(500).json({ error: message });
  }
});

app.post('/api/auth/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const rawUsername = String(req.body?.username || 'admin').trim().toLowerCase() || 'admin';
    const normalizedUsername = normalizeDashboardUsername(rawUsername);
    const password = String(req.body?.password || '');
    if (!password) {
      return res.status(400).json({ error: 'Please enter your password.' });
    }

    const envPasscode = getConfiguredEnvPasscode();

    // Server-configured env passcode always grants Primary Admin access
    if (envPasscode && normalizedUsername === 'admin' && verifyConstantTimeSecret(password, envPasscode)) {
      const token = signAdminSessionToken({
        sub: 'admin',
        username: 'admin',
        displayName: 'Primary Administrator',
        role: 'super_admin',
        source: 'env_passcode',
      });
      return res.json({
        token,
        user: {
          username: 'admin',
          displayName: 'Primary Administrator',
          role: 'super_admin',
        },
      });
    }

    await ensureSeeded();

    // Check PostgreSQL password/manager accounts (checking exact username first, then normalized 'admin' alias)
    let userRecord = await findDashboardUserByUsername(rawUsername);
    if (!userRecord && normalizedUsername !== rawUsername) {
      userRecord = await findDashboardUserByUsername(normalizedUsername);
    }
    if (!userRecord || !userRecord.isActive) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
    if (!verifyPasswordHash(password, userRecord.passwordHash)) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = signAdminSessionToken({
      sub: userRecord.username,
      username: userRecord.username,
      displayName: userRecord.displayName,
      role: userRecord.role,
      source: 'password',
    });
    res.json({
      token,
      user: {
        username: userRecord.username,
        displayName: userRecord.displayName,
        role: userRecord.role,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Sign-in failed.';
    res.status(500).json({ error: message });
  }
});

// ================= PROTECTED ADMIN API ROUTES =================
app.use('/api/admin', adminLimiter, requireAuth, requireAdmin);

app.get('/api/admin/me', (req: AuthRequest, res: Response) => {
  res.json({
    uid: req.user?.uid || req.dashboardAccount?.username || 'admin',
    email: req.user?.email || req.dashboardAccount?.username || 'admin',
    username: req.dashboardAccount?.username || req.user?.email || 'admin',
    name: req.dashboardAccount?.displayName || req.user?.name || req.user?.email || 'Administrator',
    role: req.adminRole || 'admin',
    source: req.dashboardAccount?.source || 'google',
    envPasscodeActive: Boolean(getConfiguredEnvPasscode()),
  });
});

app.post('/api/admin/change-password', async (req: AuthRequest, res: Response) => {
  try {
    const currentPassword = String(req.body?.currentPassword || '');
    const newPassword = String(req.body?.newPassword || '');
    if (newPassword.length < 6 || newPassword.length > 128) {
      return res.status(400).json({ error: 'New password must be between 6 and 128 characters.' });
    }

    const targetUsername = req.dashboardAccount?.username || 'admin';
    const envPasscode = getConfiguredEnvPasscode();

    if (req.dashboardAccount) {
      if (req.dashboardAccount.source === 'env_passcode') {
        if (!envPasscode || !verifyConstantTimeSecret(currentPassword, envPasscode)) {
          return res.status(400).json({ error: 'Current password is incorrect.' });
        }
      } else {
        const dbUser = await findDashboardUserByUsername(targetUsername);
        if (!dbUser || !verifyPasswordHash(currentPassword, dbUser.passwordHash)) {
          return res.status(400).json({ error: 'Current password is incorrect.' });
        }
      }
    }

    const saved = await upsertDashboardUserPassword(
      targetUsername,
      req.dashboardAccount?.displayName || req.user?.name || 'Primary Administrator',
      targetUsername === 'admin' ? 'super_admin' : req.adminRole || 'manager',
      hashPassword(newPassword),
      req.dashboardAccount?.username || req.user?.email || 'admin'
    );

    res.json({
      success: true,
      account: saved,
      envOverrideNote:
        Boolean(envPasscode) && targetUsername === 'admin'
          ? 'Database password saved. Note that ADMIN_PASSCODE environment secret also remains active for Primary Admin sign-in.'
          : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to change password.';
    res.status(500).json({ error: message });
  }
});

app.get('/api/admin/dashboard', async (_req: AuthRequest, res: Response) => {
  try {
    const bundle = await getAdminDashboardBundle();
    res.json(bundle);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load dashboard data.';
    res.status(500).json({ error: message });
  }
});

app.get('/api/admin/enquiries/export', async (_req: AuthRequest, res: Response) => {
  try {
    const rows = await getAllEnquiries();
    const headers = [
      'Reference',
      'Status',
      'Full Name',
      'Email',
      'Phone',
      'Nationality',
      'Country of Residence',
      'Service Required',
      'Destination',
      'Travel Date',
      'Travellers',
      'Budget Range',
      'Channel',
      'Message',
      'Admin Notes',
      'Created At',
    ];
    const csvLines = [
      headers.map(escapeCsvCell).join(','),
      ...rows.map((r) =>
        [
          r.referenceNumber,
          r.status,
          r.fullName,
          r.email,
          r.phone,
          r.nationality,
          r.countryOfResidence,
          r.serviceRequired,
          r.destination,
          r.preferredTravelDate,
          r.numberOfTravellers,
          r.budgetRange || '',
          r.channel,
          r.message,
          r.adminNotes || '',
          r.createdAt ? new Date(r.createdAt).toISOString() : '',
        ]
          .map(escapeCsvCell)
          .join(',')
      ),
    ];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="oasis-enquiries-export.csv"');
    res.send(csvLines.join('\n'));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to export enquiries.';
    res.status(500).json({ error: message });
  }
});

app.patch('/api/admin/enquiries/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid enquiry ID.' });
    }
    const allowedStatuses = ['pending', 'contacted', 'processing', 'completed', 'cancelled'];
    const status = String(req.body?.status || '').trim();
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid enquiry status.' });
    }
    const adminNotes = req.body?.adminNotes !== undefined ? String(req.body.adminNotes).slice(0, 2000) : undefined;
    const updated = await updateEnquiryStatus(id, status, adminNotes);
    if (!updated) return res.status(404).json({ error: 'Enquiry not found.' });
    res.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update enquiry.';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/admin/enquiries/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid enquiry ID.' });
    }
    await deleteEnquiryRecord(id);
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete enquiry.';
    res.status(500).json({ error: message });
  }
});

// Destinations CRUD
app.post('/api/admin/destinations', async (req: AuthRequest, res: Response) => {
  try {
    const { name, region, country, shortDescription, highlights, imageUrl, featured, sortOrder } = req.body || {};
    if (!name || !region || !country || !shortDescription || !isSafeMediaUrl(String(imageUrl || ''))) {
      return res.status(400).json({ error: 'Please complete all required destination fields with a valid image URL.' });
    }
    const created = await createDestinationRecord({
      slug: sanitizeSlug(String(name)) + '-' + crypto.randomInt(100, 999),
      name: String(name).trim(),
      region: String(region).trim(),
      country: String(country).trim(),
      shortDescription: String(shortDescription).trim(),
      highlights: Array.isArray(highlights) ? JSON.stringify(highlights) : String(highlights || '[]'),
      imageUrl: String(imageUrl).trim(),
      featured: Boolean(featured),
      sortOrder: Number(sortOrder || 0),
    });
    res.status(201).json(created);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create destination.';
    res.status(500).json({ error: message });
  }
});

app.put('/api/admin/destinations/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ID.' });
    const body = req.body || {};
    if (body.imageUrl !== undefined && !isSafeMediaUrl(String(body.imageUrl))) {
      return res.status(400).json({ error: 'Invalid image URL.' });
    }
    const updated = await updateDestinationRecord(id, {
      ...(body.name !== undefined ? { name: String(body.name).trim() } : {}),
      ...(body.region !== undefined ? { region: String(body.region).trim() } : {}),
      ...(body.country !== undefined ? { country: String(body.country).trim() } : {}),
      ...(body.shortDescription !== undefined ? { shortDescription: String(body.shortDescription).trim() } : {}),
      ...(body.highlights !== undefined
        ? { highlights: Array.isArray(body.highlights) ? JSON.stringify(body.highlights) : String(body.highlights) }
        : {}),
      ...(body.imageUrl !== undefined ? { imageUrl: String(body.imageUrl).trim() } : {}),
      ...(body.featured !== undefined ? { featured: Boolean(body.featured) } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) } : {}),
    });
    if (!updated) return res.status(404).json({ error: 'Destination not found.' });
    res.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update destination.';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/admin/destinations/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ID.' });
    await deleteDestinationRecord(id);
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete destination.';
    res.status(500).json({ error: message });
  }
});

// Packages CRUD
app.post('/api/admin/packages', async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      category,
      description,
      suggestedDuration,
      inclusions,
      priceNote,
      availabilityStatus,
      imageUrl,
      featured,
      sortOrder,
    } = req.body || {};
    if (!title || !category || !description || !suggestedDuration || !isSafeMediaUrl(String(imageUrl || ''))) {
      return res.status(400).json({ error: 'Please complete all required package fields with a valid image URL.' });
    }
    const created = await createPackageRecord({
      slug: sanitizeSlug(String(title)) + '-' + crypto.randomInt(100, 999),
      title: String(title).trim(),
      category: String(category).trim(),
      description: String(description).trim(),
      suggestedDuration: String(suggestedDuration).trim(),
      inclusions: Array.isArray(inclusions) ? JSON.stringify(inclusions) : String(inclusions || '[]'),
      priceNote: String(priceNote || 'Custom quotation upon enquiry').trim(),
      availabilityStatus: String(availabilityStatus || 'Enquiry & Custom Quote').trim(),
      imageUrl: String(imageUrl).trim(),
      featured: Boolean(featured),
      sortOrder: Number(sortOrder || 0),
    });
    res.status(201).json(created);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create package.';
    res.status(500).json({ error: message });
  }
});

app.put('/api/admin/packages/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ID.' });
    const body = req.body || {};
    if (body.imageUrl !== undefined && !isSafeMediaUrl(String(body.imageUrl))) {
      return res.status(400).json({ error: 'Invalid image URL.' });
    }
    const updated = await updatePackageRecord(id, {
      ...(body.title !== undefined ? { title: String(body.title).trim() } : {}),
      ...(body.category !== undefined ? { category: String(body.category).trim() } : {}),
      ...(body.description !== undefined ? { description: String(body.description).trim() } : {}),
      ...(body.suggestedDuration !== undefined ? { suggestedDuration: String(body.suggestedDuration).trim() } : {}),
      ...(body.inclusions !== undefined
        ? { inclusions: Array.isArray(body.inclusions) ? JSON.stringify(body.inclusions) : String(body.inclusions) }
        : {}),
      ...(body.priceNote !== undefined ? { priceNote: String(body.priceNote).trim() } : {}),
      ...(body.availabilityStatus !== undefined
        ? { availabilityStatus: String(body.availabilityStatus).trim() }
        : {}),
      ...(body.imageUrl !== undefined ? { imageUrl: String(body.imageUrl).trim() } : {}),
      ...(body.featured !== undefined ? { featured: Boolean(body.featured) } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) } : {}),
    });
    if (!updated) return res.status(404).json({ error: 'Package not found.' });
    res.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update package.';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/admin/packages/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ID.' });
    await deletePackageRecord(id);
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete package.';
    res.status(500).json({ error: message });
  }
});

// Services CRUD (supports image upload, video upload, YouTube link, Google Drive link)
app.post('/api/admin/services', async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body || {};
    const title = String(body.title || '').trim();
    const category = String(body.category || '').trim();
    const description = String(body.description || '').trim();
    if (!title || !category || !description) {
      return res.status(400).json({ error: 'Service title, category, and description are required.' });
    }
    const rawCode = String(body.code || '').trim().toUpperCase().slice(0, 12);
    const code = rawCode || `S${crypto.randomInt(10, 99)}`;
    const mediaType = ['image', 'video', 'youtube', 'gdrive'].includes(String(body.mediaType))
      ? String(body.mediaType)
      : 'image';
    const rawMediaUrl = String(body.mediaUrl || (mediaType === 'image' ? body.imageUrl : '') || '').trim();
    let finalMediaUrl = rawMediaUrl;
    if (rawMediaUrl) {
      const check = validateProjectMedia(mediaType, rawMediaUrl);
      if (!check.valid) return res.status(400).json({ error: check.error || 'Invalid service media.' });
      finalMediaUrl = check.normalizedUrl;
    } else if (mediaType !== 'image') {
      return res.status(400).json({
        error:
          mediaType === 'youtube'
            ? 'Please enter a valid YouTube link for this service.'
            : mediaType === 'gdrive'
              ? 'Please enter a valid Google Drive link for this service.'
              : 'Please upload a video file or enter a video URL.',
      });
    }
    const cleanImageUrl =
      body.imageUrl && isSafeMediaUrl(String(body.imageUrl))
        ? normalizeExternalMediaUrl(String(body.imageUrl))
        : mediaType === 'image' && finalMediaUrl
          ? finalMediaUrl
          : '/src/assets/images/hero_dubai_skyline_1795373922438.jpg';

    const created = await createServiceRecord({
      code,
      category,
      title,
      description,
      items: Array.isArray(body.items) ? JSON.stringify(body.items) : String(body.items || '[]'),
      iconName: String(body.iconName || 'Compass').trim() || 'Compass',
      mediaType,
      mediaUrl: finalMediaUrl || cleanImageUrl,
      imageUrl: cleanImageUrl,
      sortOrder: Number(body.sortOrder ?? 0),
    });
    res.status(201).json(created);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create service.';
    res.status(500).json({ error: message });
  }
});

app.put('/api/admin/services/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ID.' });
    const body = req.body || {};
    const mediaType = body.mediaType !== undefined ? String(body.mediaType).trim() : undefined;
    let normalizedMediaUrl: string | null | undefined = undefined;
    if (body.mediaUrl !== undefined) {
      const trimmedMedia = String(body.mediaUrl).trim();
      if (trimmedMedia) {
        const check = validateProjectMedia(mediaType || 'image', trimmedMedia);
        if (!check.valid) return res.status(400).json({ error: check.error || 'Invalid service media.' });
        normalizedMediaUrl = check.normalizedUrl;
      } else {
        normalizedMediaUrl = null;
      }
    }
    if (body.imageUrl !== undefined && String(body.imageUrl).trim() && !isSafeMediaUrl(String(body.imageUrl))) {
      return res.status(400).json({ error: 'Invalid service image URL.' });
    }
    const cleanImageUrl =
      body.imageUrl !== undefined
        ? normalizeExternalMediaUrl(String(body.imageUrl)) || null
        : mediaType === 'image' && normalizedMediaUrl
          ? normalizedMediaUrl
          : undefined;

    const updated = await updateServiceRecord(id, {
      ...(body.code !== undefined && String(body.code).trim()
        ? { code: String(body.code).trim().toUpperCase().slice(0, 12) }
        : {}),
      ...(body.category !== undefined ? { category: String(body.category).trim() } : {}),
      ...(body.title !== undefined ? { title: String(body.title).trim() } : {}),
      ...(body.description !== undefined ? { description: String(body.description).trim() } : {}),
      ...(body.items !== undefined
        ? { items: Array.isArray(body.items) ? JSON.stringify(body.items) : String(body.items) }
        : {}),
      ...(body.iconName !== undefined ? { iconName: String(body.iconName).trim() || 'Compass' } : {}),
      ...(mediaType !== undefined ? { mediaType } : {}),
      ...(normalizedMediaUrl !== undefined ? { mediaUrl: normalizedMediaUrl } : {}),
      ...(cleanImageUrl !== undefined ? { imageUrl: cleanImageUrl } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) } : {}),
    });
    if (!updated) return res.status(404).json({ error: 'Service not found.' });
    res.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update service.';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/admin/services/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ID.' });
    await deleteServiceRecord(id);
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete service.';
    res.status(500).json({ error: message });
  }
});

// Testimonials CRUD
app.post('/api/admin/testimonials', async (req: AuthRequest, res: Response) => {
  try {
    const { authorName, origin, serviceUsed, rating, quote, experienceSummary, isSamplePlaceholder, verifiedLink, published } =
      req.body || {};
    if (!authorName || !origin || !serviceUsed || !quote) {
      return res.status(400).json({ error: 'Please provide author name, origin, service, and quote.' });
    }
    const created = await createTestimonialRecord({
      authorName: String(authorName).trim(),
      origin: String(origin).trim(),
      serviceUsed: String(serviceUsed).trim(),
      rating: Math.min(5, Math.max(1, Number(rating || 5))),
      quote: String(quote).trim(),
      experienceSummary: String(experienceSummary || '').trim(),
      isSamplePlaceholder: Boolean(isSamplePlaceholder),
      verifiedLink: verifiedLink && isSafeMediaUrl(String(verifiedLink)) ? String(verifiedLink).trim() : '',
      published: published !== false,
    });
    res.status(201).json(created);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add testimonial.';
    res.status(500).json({ error: message });
  }
});

app.put('/api/admin/testimonials/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ID.' });
    const body = req.body || {};
    const updated = await updateTestimonialRecord(id, {
      ...(body.authorName !== undefined ? { authorName: String(body.authorName).trim() } : {}),
      ...(body.origin !== undefined ? { origin: String(body.origin).trim() } : {}),
      ...(body.serviceUsed !== undefined ? { serviceUsed: String(body.serviceUsed).trim() } : {}),
      ...(body.rating !== undefined ? { rating: Math.min(5, Math.max(1, Number(body.rating))) } : {}),
      ...(body.quote !== undefined ? { quote: String(body.quote).trim() } : {}),
      ...(body.experienceSummary !== undefined ? { experienceSummary: String(body.experienceSummary).trim() } : {}),
      ...(body.isSamplePlaceholder !== undefined ? { isSamplePlaceholder: Boolean(body.isSamplePlaceholder) } : {}),
      ...(body.verifiedLink !== undefined ? { verifiedLink: String(body.verifiedLink).trim() } : {}),
      ...(body.published !== undefined ? { published: Boolean(body.published) } : {}),
    });
    if (!updated) return res.status(404).json({ error: 'Testimonial not found.' });
    res.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update testimonial.';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/admin/testimonials/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ID.' });
    await deleteTestimonialRecord(id);
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete testimonial.';
    res.status(500).json({ error: message });
  }
});

// FAQs CRUD
app.post('/api/admin/faqs', async (req: AuthRequest, res: Response) => {
  try {
    const { category, question, answer, sortOrder, published } = req.body || {};
    if (!category || !question || !answer) {
      return res.status(400).json({ error: 'Category, question, and answer are required.' });
    }
    const created = await createFaqRecord({
      category: String(category).trim(),
      question: String(question).trim(),
      answer: String(answer).trim(),
      sortOrder: Number(sortOrder || 0),
      published: published !== false,
    });
    res.status(201).json(created);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create FAQ.';
    res.status(500).json({ error: message });
  }
});

app.put('/api/admin/faqs/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ID.' });
    const body = req.body || {};
    const updated = await updateFaqRecord(id, {
      ...(body.category !== undefined ? { category: String(body.category).trim() } : {}),
      ...(body.question !== undefined ? { question: String(body.question).trim() } : {}),
      ...(body.answer !== undefined ? { answer: String(body.answer).trim() } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) } : {}),
      ...(body.published !== undefined ? { published: Boolean(body.published) } : {}),
    });
    if (!updated) return res.status(404).json({ error: 'FAQ not found.' });
    res.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update FAQ.';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/admin/faqs/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ID.' });
    await deleteFaqRecord(id);
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete FAQ.';
    res.status(500).json({ error: message });
  }
});

// Site Settings & Business Hours
app.put('/api/admin/settings', async (req: AuthRequest, res: Response) => {
  try {
    const incoming = req.body?.settings;
    if (!incoming || typeof incoming !== 'object') {
      return res.status(400).json({ error: 'Invalid settings payload.' });
    }
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(incoming)) {
      if (typeof k === 'string' && typeof v === 'string' && k.length <= 64) {
        clean[k] = v.slice(0, 2000);
      }
    }
    await upsertSiteSettings(clean);
    res.json({ success: true, settings: clean });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update site settings.';
    res.status(500).json({ error: message });
  }
});

// Secure Media Upload (supports all common image & video formats + path confinement)
app.post('/api/admin/media/upload', async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, altText, dataUrl, externalUrl, fileName, skipLibrary } = req.body || {};
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required.' });
    }

    let finalUrl = '';
    let detectedKind: 'image' | 'video' = 'image';

    if (dataUrl && typeof dataUrl === 'string') {
      const trimmedDataUrl = dataUrl.trim();
      const base64Marker = ';base64,';
      const markerIdx = trimmedDataUrl.toLowerCase().indexOf(base64Marker);
      const headerPart = markerIdx > 0 ? trimmedDataUrl.slice(0, markerIdx) : '';
      const rawBase64 = markerIdx > 0 ? trimmedDataUrl.slice(markerIdx + base64Marker.length) : '';
      if (!headerPart.toLowerCase().startsWith('data:') || !/^[A-Za-z0-9+/=\s]+$/.test(rawBase64)) {
        return res.status(400).json({
          error: 'Could not read uploaded file encoding. Please select an image or video file.',
        });
      }
      const rawMime = (headerPart.slice(5).split(';')[0] || '').toLowerCase().trim();
      const base64Data = rawBase64.replace(/\s+/g, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const fileExt = path.extname(String(fileName || title || '')).toLowerCase();
      const extToInfo: Record<string, { ext: string; kind: 'image' | 'video' }> = {
        '.jpg': { ext: '.jpg', kind: 'image' },
        '.jpeg': { ext: '.jpg', kind: 'image' },
        '.png': { ext: '.png', kind: 'image' },
        '.webp': { ext: '.webp', kind: 'image' },
        '.gif': { ext: '.gif', kind: 'image' },
        '.svg': { ext: '.svg', kind: 'image' },
        '.avif': { ext: '.avif', kind: 'image' },
        '.bmp': { ext: '.bmp', kind: 'image' },
        '.heic': { ext: '.heic', kind: 'image' },
        '.heif': { ext: '.heif', kind: 'image' },
        '.mp4': { ext: '.mp4', kind: 'video' },
        '.m4v': { ext: '.m4v', kind: 'video' },
        '.mov': { ext: '.mov', kind: 'video' },
        '.webm': { ext: '.webm', kind: 'video' },
        '.mkv': { ext: '.mkv', kind: 'video' },
        '.avi': { ext: '.avi', kind: 'video' },
        '.ogv': { ext: '.ogv', kind: 'video' },
        '.3gp': { ext: '.3gp', kind: 'video' },
        '.mpeg': { ext: '.mpeg', kind: 'video' },
      };

      const mimeMap: Record<string, { ext: string; kind: 'image' | 'video' }> = {
        'image/jpeg': { ext: '.jpg', kind: 'image' },
        'image/jpg': { ext: '.jpg', kind: 'image' },
        'image/pjpeg': { ext: '.jpg', kind: 'image' },
        'image/png': { ext: '.png', kind: 'image' },
        'image/webp': { ext: '.webp', kind: 'image' },
        'image/gif': { ext: '.gif', kind: 'image' },
        'image/svg+xml': { ext: '.svg', kind: 'image' },
        'image/avif': { ext: '.avif', kind: 'image' },
        'image/bmp': { ext: '.bmp', kind: 'image' },
        'image/heic': { ext: '.heic', kind: 'image' },
        'image/heif': { ext: '.heif', kind: 'image' },
        'video/mp4': { ext: '.mp4', kind: 'video' },
        'video/x-m4v': { ext: '.m4v', kind: 'video' },
        'video/m4v': { ext: '.m4v', kind: 'video' },
        'video/webm': { ext: '.webm', kind: 'video' },
        'video/quicktime': { ext: '.mov', kind: 'video' },
        'video/x-matroska': { ext: '.mkv', kind: 'video' },
        'video/x-msvideo': { ext: '.avi', kind: 'video' },
        'video/avi': { ext: '.avi', kind: 'video' },
        'video/ogg': { ext: '.ogv', kind: 'video' },
        'video/3gpp': { ext: '.3gp', kind: 'video' },
        'video/mpeg': { ext: '.mpeg', kind: 'video' },
      };

      let resolved = mimeMap[rawMime] || extToInfo[fileExt];
      if (!resolved && rawMime.startsWith('image/')) {
        resolved = { ext: '.png', kind: 'image' };
      } else if (!resolved && rawMime.startsWith('video/')) {
        resolved = { ext: '.mp4', kind: 'video' };
      }
      if (!resolved) {
        return res.status(400).json({
          error: 'Supported formats: JPG, PNG, WebP, GIF, SVG images or MP4, MOV, WebM, M4V videos.',
        });
      }

      detectedKind = resolved.kind;
      const maxBytes = detectedKind === 'video' ? 50 * 1024 * 1024 : 8 * 1024 * 1024;
      if (buffer.length > maxBytes) {
        return res.status(400).json({
          error: detectedKind === 'video' ? 'Video size must be 50 MB or smaller.' : 'Image size must be 8 MB or smaller.',
        });
      }

      const safeFilename = `oasis-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${resolved.ext}`;
      const supabaseRestUrl = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
      const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
      const storageBucket = (process.env.SUPABASE_STORAGE_BUCKET || 'oasis-media').trim();

      if (supabaseRestUrl && supabaseServiceKey) {
        const mimeForUpload =
          rawMime || (detectedKind === 'video' ? `video/${resolved.ext.slice(1)}` : `image/${resolved.ext === '.jpg' ? 'jpeg' : resolved.ext.slice(1)}`);
        const uploadRes = await fetch(
          `${supabaseRestUrl}/storage/v1/object/${encodeURIComponent(storageBucket)}/${encodeURIComponent(safeFilename)}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${supabaseServiceKey}`,
              apikey: supabaseServiceKey,
              'Content-Type': mimeForUpload,
              'x-upsert': 'true',
            },
            body: buffer,
          }
        );
        if (uploadRes.ok) {
          finalUrl = `${supabaseRestUrl}/storage/v1/object/public/${encodeURIComponent(storageBucket)}/${encodeURIComponent(safeFilename)}`;
        }
      }

      if (!finalUrl && isVercel && detectedKind === 'image' && ['.png', '.jpg', '.webp', '.gif'].includes(resolved.ext) && buffer.length <= 2 * 1024 * 1024) {
        const safeMime = resolved.ext === '.jpg' ? 'image/jpeg' : `image/${resolved.ext.slice(1)}`;
        finalUrl = `data:${safeMime};base64,${buffer.toString('base64')}`;
      }

      if (!finalUrl) {
        const resolvedPath = path.resolve(UPLOADS_DIR, safeFilename);
        if (!resolvedPath.startsWith(UPLOADS_DIR + path.sep)) {
          return res.status(400).json({ error: 'Invalid file destination.' });
        }
        fs.writeFileSync(resolvedPath, buffer);
        finalUrl = `/uploads/${safeFilename}`;
      }
    } else if (externalUrl && isSafeMediaUrl(String(externalUrl))) {
      finalUrl = normalizeExternalMediaUrl(String(externalUrl));
    } else {
      return res.status(400).json({ error: 'Provide an uploaded file or a valid HTTPS URL.' });
    }

    if (skipLibrary) {
      return res.status(201).json({
        url: finalUrl,
        mediaType: detectedKind,
        title: String(title).trim(),
        category: String(category).trim(),
      });
    }

    const record = await createMediaAssetRecord({
      title: String(title).trim(),
      category: String(category).trim(),
      url: finalUrl,
      altText: String(altText || title).trim(),
    });
    res.status(201).json({ ...record, mediaType: detectedKind });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to upload file.';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/admin/media/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ID.' });
    const removed = await deleteMediaAssetRecord(id);
    if (removed && removed.url.startsWith('/uploads/')) {
      const filename = path.basename(removed.url);
      const target = path.resolve(UPLOADS_DIR, filename);
      if (target.startsWith(UPLOADS_DIR + path.sep) && fs.existsSync(target)) {
        fs.unlinkSync(target);
      }
    }
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to remove media asset.';
    res.status(500).json({ error: message });
  }
});

// Design Projects CRUD (Image Upload, Video Upload, YouTube Link, Google Drive Link)

app.post('/api/admin/projects', async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, description, mediaType, mediaUrl, thumbnailUrl, featured, published, sortOrder } =
      req.body || {};
    const type = String(mediaType || 'image').trim();
    const check = validateProjectMedia(type, String(mediaUrl || ''));
    if (!title || !category || !description || !check.valid) {
      return res.status(400).json({ error: check.error || 'Please complete all required project fields.' });
    }
    const cleanThumb =
      thumbnailUrl && isSafeMediaUrl(String(thumbnailUrl)) ? normalizeExternalMediaUrl(String(thumbnailUrl)) : null;
    const created = await createDesignProjectRecord({
      title: String(title).trim(),
      category: String(category).trim(),
      description: String(description).trim(),
      mediaType: type,
      mediaUrl: check.normalizedUrl,
      thumbnailUrl: cleanThumb,
      featured: featured !== false,
      published: published !== false,
      sortOrder: Number(sortOrder || 0),
    });
    res.status(201).json(created);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create design project.';
    res.status(500).json({ error: message });
  }
});

app.put('/api/admin/projects/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ID.' });
    const body = req.body || {};
    let normalizedUrl: string | undefined = undefined;
    if (body.mediaUrl !== undefined) {
      const check = validateProjectMedia(String(body.mediaType || 'image'), String(body.mediaUrl));
      if (!check.valid) return res.status(400).json({ error: check.error || 'Invalid project media.' });
      normalizedUrl = check.normalizedUrl;
    }
    const updated = await updateDesignProjectRecord(id, {
      ...(body.title !== undefined ? { title: String(body.title).trim() } : {}),
      ...(body.category !== undefined ? { category: String(body.category).trim() } : {}),
      ...(body.description !== undefined ? { description: String(body.description).trim() } : {}),
      ...(body.mediaType !== undefined ? { mediaType: String(body.mediaType).trim() } : {}),
      ...(normalizedUrl !== undefined ? { mediaUrl: normalizedUrl } : {}),
      ...(body.thumbnailUrl !== undefined
        ? {
            thumbnailUrl:
              body.thumbnailUrl && isSafeMediaUrl(String(body.thumbnailUrl))
                ? normalizeExternalMediaUrl(String(body.thumbnailUrl))
                : null,
          }
        : {}),
      ...(body.featured !== undefined ? { featured: Boolean(body.featured) } : {}),
      ...(body.published !== undefined ? { published: Boolean(body.published) } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) } : {}),
    });
    if (!updated) return res.status(404).json({ error: 'Design project not found.' });
    res.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update design project.';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/admin/projects/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ID.' });
    await deleteDesignProjectRecord(id);
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete design project.';
    res.status(500).json({ error: message });
  }
});

// Special Offers CRUD (Image Upload, Video Upload, YouTube Link, Google Drive Link)
app.post('/api/admin/offers', async (req: AuthRequest, res: Response) => {
  try {
    const { title, badge, description, mediaType, mediaUrl, thumbnailUrl, featured, published, sortOrder } =
      req.body || {};
    const type = String(mediaType || 'image').trim();
    const check = validateProjectMedia(type, String(mediaUrl || ''));
    if (!String(title || '').trim() || !String(description || '').trim() || !check.valid) {
      return res.status(400).json({
        error: check.error || 'Offer title, description, and valid media (image, video, YouTube, or Google Drive) are required.',
      });
    }
    const cleanThumb =
      thumbnailUrl && isSafeMediaUrl(String(thumbnailUrl)) ? normalizeExternalMediaUrl(String(thumbnailUrl)) : null;
    const created = await createSpecialOfferRecord({
      title: String(title).trim(),
      badge: String(badge || 'Special Offer').trim().slice(0, 60) || 'Special Offer',
      description: String(description).trim(),
      mediaType: type,
      mediaUrl: check.normalizedUrl,
      thumbnailUrl: cleanThumb,
      featured: featured !== false,
      published: published !== false,
      sortOrder: Number(sortOrder || 0),
    });
    res.status(201).json(created);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create special offer.';
    res.status(500).json({ error: message });
  }
});

app.put('/api/admin/offers/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ID.' });
    const body = req.body || {};
    let normalizedUrl: string | undefined = undefined;
    if (body.mediaUrl !== undefined) {
      const check = validateProjectMedia(String(body.mediaType || 'image'), String(body.mediaUrl));
      if (!check.valid) return res.status(400).json({ error: check.error || 'Invalid special offer media.' });
      normalizedUrl = check.normalizedUrl;
    }
    const updated = await updateSpecialOfferRecord(id, {
      ...(body.title !== undefined ? { title: String(body.title).trim() } : {}),
      ...(body.badge !== undefined ? { badge: String(body.badge).trim().slice(0, 60) || 'Special Offer' } : {}),
      ...(body.description !== undefined ? { description: String(body.description).trim() } : {}),
      ...(body.mediaType !== undefined ? { mediaType: String(body.mediaType).trim() } : {}),
      ...(normalizedUrl !== undefined ? { mediaUrl: normalizedUrl } : {}),
      ...(body.thumbnailUrl !== undefined
        ? {
            thumbnailUrl:
              body.thumbnailUrl && isSafeMediaUrl(String(body.thumbnailUrl))
                ? normalizeExternalMediaUrl(String(body.thumbnailUrl))
                : null,
          }
        : {}),
      ...(body.featured !== undefined ? { featured: Boolean(body.featured) } : {}),
      ...(body.published !== undefined ? { published: Boolean(body.published) } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) } : {}),
    });
    if (!updated) return res.status(404).json({ error: 'Special offer not found.' });
    res.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update special offer.';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/admin/offers/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ID.' });
    await deleteSpecialOfferRecord(id);
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete special offer.';
    res.status(500).json({ error: message });
  }
});

// Manager Password Accounts (Full Admin Dashboard Access)
app.post('/api/admin/managers', async (req: AuthRequest, res: Response) => {
  try {
    const username = String(req.body?.username || '').trim().toLowerCase();
    const displayName = String(req.body?.displayName || '').trim();
    const password = String(req.body?.password || '');
    const role = ['super_admin', 'manager'].includes(String(req.body?.role))
      ? String(req.body.role)
      : 'manager';

    if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
      return res.status(400).json({
        error: 'Manager username must be 3–40 characters (letters, numbers, dots, underscores, or hyphens).',
      });
    }
    if (!displayName) {
      return res.status(400).json({ error: 'Please enter the manager’s display name.' });
    }
    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({ error: 'Assigned password must be between 6 and 128 characters.' });
    }

    const saved = await upsertDashboardUserPassword(
      username,
      displayName,
      role,
      hashPassword(password),
      req.dashboardAccount?.username || req.user?.email || 'admin'
    );
    res.status(201).json(saved);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save manager account.';
    res.status(500).json({ error: message });
  }
});

app.patch('/api/admin/managers/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ID.' });
    const updates: Partial<{ displayName: string; isActive: boolean; passwordHash: string; role: string }> = {};
    if (req.body?.displayName !== undefined) updates.displayName = String(req.body.displayName).trim();
    if (req.body?.isActive !== undefined) updates.isActive = Boolean(req.body.isActive);
    if (req.body?.role && ['super_admin', 'manager'].includes(String(req.body.role))) {
      updates.role = String(req.body.role);
    }
    if (req.body?.newPassword !== undefined && String(req.body.newPassword).length > 0) {
      const pw = String(req.body.newPassword);
      if (pw.length < 6 || pw.length > 128) {
        return res.status(400).json({ error: 'New password must be between 6 and 128 characters.' });
      }
      updates.passwordHash = hashPassword(pw);
    }
    const updated = await updateDashboardUserById(id, updates);
    if (!updated) return res.status(404).json({ error: 'Manager account not found.' });
    res.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update manager account.';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/admin/managers/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ID.' });
    await deleteDashboardUserById(id);
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete manager account.';
    res.status(500).json({ error: message });
  }
});

// Authorized Admin Accounts management
app.post('/api/admin/admins', async (req: AuthRequest, res: Response) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const role = ['super_admin', 'admin'].includes(String(req.body?.role)) ? String(req.body.role) : 'admin';
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid Google account email address.' });
    }
    const created = await addAuthorizedAdmin(email, role, req.user?.email || 'admin');
    res.status(201).json(created);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add administrator account.';
    res.status(500).json({ error: message });
  }
});

app.patch('/api/admin/admins/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ID.' });
    const isActive = Boolean(req.body?.isActive);
    const role = req.body?.role && ['super_admin', 'admin'].includes(String(req.body.role)) ? String(req.body.role) : undefined;
    const updated = await updateAuthorizedAdmin(id, isActive, role);
    if (!updated) return res.status(404).json({ error: 'Admin account not found.' });
    res.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update administrator account.';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/admin/admins/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ID.' });
    await deleteAuthorizedAdmin(id);
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to remove administrator account.';
    res.status(500).json({ error: message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Oasis Travel & Tourism server running on port ${PORT}`);
  });
}

if (!process.env.VERCEL && !process.env.VERCEL_ENV) {
  startServer();
}

export default app;
export { app };

