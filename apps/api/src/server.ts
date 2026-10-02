import { config } from './config';
import { buildApp } from './app';
import { startJobs } from './modules/jobs/jobs';
import { startMailSync } from './modules/mail/imap';
import { startTelegramBot } from './modules/notifications/telegram';

const app = await buildApp();
if (config.role !== 'worker') await app.listen({ host: config.host, port: config.port });
if (config.role !== 'api') {
  await startJobs((m) => app.log.info(m));
  startMailSync((m) => app.log.info(m));
  startTelegramBot((m) => app.log.info(m));
}
