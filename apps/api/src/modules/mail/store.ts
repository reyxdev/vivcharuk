import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { config } from '../../config';

// Mail originals and attachments on the server's disk (round 19 D1: no R2). Never under the public
// media folder: files are served only through the permission-checked panel endpoint.
const root = () => config.mailbox.dir;

export function saveFile(rel: string, data: Buffer) {
  const full = path.join(root(), rel);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, data, { mode: 0o600 });
}

export function readStored(rel: string) {
  const full = path.resolve(root(), rel);
  if (!full.startsWith(path.resolve(root()) + path.sep)) throw new Error('path outside MAIL_DIR');
  return readFileSync(full);
}

export function removeStored(rel: string) {
  rmSync(path.join(root(), rel), { force: true });
}

export const sha256 = (b: Buffer) => createHash('sha256').update(b).digest('hex');

/** Attachment risk by name and type: shown, but downloads of these warn first. */
export function riskOf(filename: string, contentType: string): string | null {
  const ext = filename.toLowerCase().split('.').pop() ?? '';
  if (['exe', 'msi', 'bat', 'cmd', 'com', 'scr', 'js', 'vbs', 'jar', 'ps1', 'apk', 'lnk', 'iso', 'hta'].includes(ext)) return 'executable';
  if (['docm', 'xlsm', 'pptm'].includes(ext)) return 'macro';
  if (['zip', 'rar', '7z', 'gz', 'tar'].includes(ext) || /zip|rar|compressed/.test(contentType)) return 'archive';
  return null;
}

/** Photos and PDF are shown in the panel (round 19 D1 #16); everything else downloads. */
export const isViewable = (contentType: string) => /^image\/(jpeg|png|gif|webp|heic|heif)$/.test(contentType) || contentType === 'application/pdf';
