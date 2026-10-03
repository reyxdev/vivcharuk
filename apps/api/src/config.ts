import { fileURLToPath } from 'node:url';
import { z } from 'zod';

// Loaded once at import; the process refuses to boot on a missing or malformed variable (27 §27.13).
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  ROLE: z.enum(['api', 'worker', 'both']).default('both'),
  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().int().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  COOKIE_SECRET: z.string().min(32),
  // Invitation and password-reset tokens (24 §24.8): a separate secret, so leaking one does not forge the other.
  STAFF_TOKEN_SECRET: z.string().min(32),
  // 32-byte key, base64, for AEAD of TOTP secrets at rest (24 §24.11). {{KMS_KEY_REF}} in production.
  MFA_ENCRYPTION_KEY: z.string().refine((v) => Buffer.from(v, 'base64').length === 32, 'must be 32 bytes, base64'),
  ADMIN_BASE_PATH: z.string().default('/admin'),
  SITE_URL: z.string().url().default('http://localhost:3000'),
  // Development stand-ins. Never enable in production: the tariffs are tokens with no default
  // (18 §18.6) and WayForPay's wire format is unverified until V6–V11 (26 §26.14.1).
  SHIPPING_TEST_RATES: z.enum(['0', '1']).default('0'),
  PAYMENTS_STUB: z.enum(['0', '1']).default('0'),
  NOVA_POSHTA_API_KEY: z.string().optional().default(''),
  // Media storage (Cloudinary, 26 §26.13). Empty = photo uploads off; the photo requirement does not block publishing.
  CLOUDINARY_URL: z.string().optional().default(''),
  // Local media (photos and videos as files, served at /media/). Default: <repo>/media.
  MEDIA_DIR: z.string().optional().default(''),
  // Outgoing mail through the shop's own mailbox (round 18: Porkbun email hosting, smtp.porkbun.com,
  // 587 STARTTLS or 465). Empty SMTP_HOST = no sending: in development messages go to mail-outbox/.
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  MAIL_FROM: z.string().optional().default(''),
  MAIL_REPLY_TO: z.string().optional().default(''),
  // Round 19 D1: «Пошта» in the panel reads the shop mailbox over IMAP and replies over its SMTP as a
  // person (Porkbun). Empty MAILBOX_PASSWORD = the panel's mail sync is off.
  MAILBOX_ADDRESS: z.string().optional().default('info@vivcharuk.com'),
  MAILBOX_PASSWORD: z.string().optional().default(''),
  MAILBOX_IMAP_HOST: z.string().optional().default('imap.porkbun.com'),
  MAILBOX_IMAP_PORT: z.coerce.number().int().default(993),
  MAILBOX_SMTP_HOST: z.string().optional().default('smtp.porkbun.com'),
  MAILBOX_SMTP_PORT: z.coerce.number().int().default(587),
  // Originals and attachments of mail, outside the public media folder. Default: <repo>/mail-store.
  MAIL_DIR: z.string().optional().default(''),
  // Telegram bot (round 9 §P5.4). Token is a secret; the chat id lives in Setting `notifications.telegram_chat_id`. Empty = off.
  TELEGRAM_BOT_TOKEN: z.string().optional().default(''),
  // Where panel links in notifications point.
  ADMIN_URL: z.string().url().default('http://127.0.0.1:3000/admin'),
  // Round 24 G022: IndexNow key (8–128 letters, digits or dashes); empty = off. Pings only in production.
  INDEXNOW_KEY: z.string().regex(/^[A-Za-z0-9-]{8,128}$/, '8–128 letters, digits or dashes').or(z.literal('')).optional().default(''),
  // 2026-10-03: Google Business Profile hours sync — an OAuth client (Web) from the client's own Google
  // Cloud project. Empty = the «Google Карти» card says the server is not set up.
  GOOGLE_BP_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_BP_CLIENT_SECRET: z.string().optional().default(''),
  // The locales the site serves (the storefront reads the same variable at build time, D39): the
  // Merchant feeds and IndexNow follow it.
  VITE_ENABLED_LOCALES: z.string().optional().default('uk'),
  // ONEKNIGHT (round 16): empty = integration off.
  ONEKNIGHT_API_URL: z.string().optional().default(''),
  ONEKNIGHT_SECRET_KEY: z.string().optional().default(''),
  ONEKNIGHT_WEBHOOK_SECRET: z.string().optional().default(''),
});

const env = serverEnvSchema.parse(process.env);
// 26 §26.16.1: a configured mail server with no sender address fails at start, not in silence later.
if (env.SMTP_HOST && !env.MAIL_FROM) throw new Error('MAIL_FROM is required when SMTP_HOST is set (e.g. «Вівчарик <info@your-domain>»)');

export const config = {
  env: env.NODE_ENV,
  isProd: env.NODE_ENV === 'production',
  role: env.ROLE,
  host: env.HOST,
  port: env.PORT,
  db: { url: env.DATABASE_URL },
  jwt: { accessSecret: env.JWT_ACCESS_SECRET, staffTokenSecret: env.STAFF_TOKEN_SECRET },
  cookieSecret: env.COOKIE_SECRET,
  mfaKey: Buffer.from(env.MFA_ENCRYPTION_KEY, 'base64'),
  adminBasePath: env.ADMIN_BASE_PATH,
  siteUrl: env.SITE_URL,
  indexNowKey: env.INDEXNOW_KEY,
  googleBusiness: { clientId: env.GOOGLE_BP_CLIENT_ID, clientSecret: env.GOOGLE_BP_CLIENT_SECRET },
  enabledLocales: [...new Set(['uk', ...env.VITE_ENABLED_LOCALES.split(',').map((x) => x.trim())])].filter((x): x is 'uk' | 'en' | 'pl' | 'de' => ['uk', 'en', 'pl', 'de'].includes(x)),
  shipping: { testRates: env.SHIPPING_TEST_RATES === '1' && env.NODE_ENV !== 'production', npApiKey: env.NOVA_POSHTA_API_KEY },
  telegram: { botToken: env.TELEGRAM_BOT_TOKEN },
  adminUrl: env.ADMIN_URL,
  mail: { host: env.SMTP_HOST, port: env.SMTP_PORT, user: env.SMTP_USER, pass: env.SMTP_PASS, from: env.MAIL_FROM, replyTo: env.MAIL_REPLY_TO || env.MAIL_FROM },
  mailbox: {
    address: env.MAILBOX_ADDRESS.toLowerCase(), password: env.MAILBOX_PASSWORD,
    imap: { host: env.MAILBOX_IMAP_HOST, port: env.MAILBOX_IMAP_PORT },
    smtp: { host: env.MAILBOX_SMTP_HOST, port: env.MAILBOX_SMTP_PORT },
    dir: env.MAIL_DIR || fileURLToPath(new URL('../../../mail-store/', import.meta.url)),
  },
  media: { enabled: env.CLOUDINARY_URL !== '', url: env.CLOUDINARY_URL, dir: env.MEDIA_DIR || fileURLToPath(new URL('../../../media/', import.meta.url)) },
  payments: { stub: env.PAYMENTS_STUB === '1' && env.NODE_ENV !== 'production' },
  oneknight: {
    apiUrl: env.ONEKNIGHT_API_URL,
    secretKey: env.ONEKNIGHT_SECRET_KEY,
    webhookSecret: env.ONEKNIGHT_WEBHOOK_SECRET,
  },
} as const;
