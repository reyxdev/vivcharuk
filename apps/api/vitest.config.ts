import { defineConfig, loadEnv } from 'vite';

// Tests never reach real mail servers: the shop mailbox and the site's SMTP are blanked, whatever .env holds.
export default defineConfig(({ mode }) => ({
  test: {
    env: { ...loadEnv(mode, '../../', ''), MAILBOX_PASSWORD: '', SMTP_HOST: '', SMTP_PASS: '', TELEGRAM_BOT_TOKEN: '' },
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'], testTimeout: 30_000,
  },
}));
