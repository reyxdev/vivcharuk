import sanitizeHtml from 'sanitize-html';

// Inbound HTML is cleaned once, at ingest; raw HTML is never rendered (25 §25.8c). The panel shows the
// result in a sandboxed frame without scripts. Remote images are parked in data-remote-src until the
// reader clicks «Показати картинки» (round 19 D1 #33); inline cid: images keep their id in data-cid.
export function cleanHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      'a', 'b', 'strong', 'i', 'em', 'u', 's', 'br', 'p', 'div', 'span', 'blockquote', 'pre', 'code', 'hr',
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
      'img', 'font', 'center', 'small', 'sup', 'sub',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['alt', 'width', 'height', 'data-remote-src', 'data-cid', 'style'],
      td: ['colspan', 'rowspan', 'align', 'valign', 'width', 'style', 'bgcolor'],
      th: ['colspan', 'rowspan', 'align', 'valign', 'width', 'style', 'bgcolor'],
      table: ['width', 'align', 'cellpadding', 'cellspacing', 'border', 'style', 'bgcolor'],
      font: ['color', 'size', 'face'],
      '*': ['style', 'align', 'dir'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedStyles: {
      '*': {
        color: [/^[#a-z0-9(),.\s%]+$/i], 'background-color': [/^[#a-z0-9(),.\s%]+$/i],
        'text-align': [/^(left|right|center|justify)$/], 'font-weight': [/^\w+$/], 'font-style': [/^\w+$/],
        'font-size': [/^[\d.]+(px|pt|em|rem|%)$/], 'text-decoration': [/^[\w\s-]+$/],
        padding: [/^[\d.\s]+(px|em|%)?[\d.\spxem%]*$/], margin: [/^[\d.\s]+(px|em|%)?[\d.\spxem%auto-]*$/],
        width: [/^[\d.]+(px|%)$/], 'max-width': [/^[\d.]+(px|%)$/], height: [/^[\d.]+px$/], border: [/^[\w\s#().,%-]+$/],
      },
    },
    transformTags: {
      a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer nofollow' } }),
      img: (tagName, attribs) => {
        const src = attribs.src ?? '';
        const { src: _drop, ...rest } = attribs;
        if (/^cid:/i.test(src)) return { tagName, attribs: { ...rest, 'data-cid': src.slice(4).replace(/^<|>$/g, '') } };
        if (/^https?:/i.test(src)) return { tagName, attribs: { ...rest, 'data-remote-src': src } };
        return { tagName, attribs: rest };
      },
    },
    exclusiveFilter: (frame) => frame.tag === 'img' && !frame.attribs['data-cid'] && !frame.attribs['data-remote-src'],
  });
}

const BRANDS: Array<[RegExp, string[]]> = [
  [/porkbun/i, ['porkbun.com']],
  [/wayforpay/i, ['wayforpay.com']],
  [/нова\s*пошта|nova\s*poshta|novaposhta/i, ['novaposhta.ua', 'novapost.com']],
  [/приват|privat/i, ['privatbank.ua']],
  [/monobank|монобанк/i, ['monobank.ua']],
  [/resend/i, ['resend.com', 'resend.dev']],
  [/prom\.ua|пром/i, ['prom.ua']],
  [/google|gmail/i, ['google.com', 'gmail.com']],
  [/вівчарик|vivcharuk/i, ['vivcharuk.com']],
];

const domainOf = (email: string) => email.split('@')[1]?.toLowerCase() ?? '';
const sameSite = (domain: string, allowed: string) => domain === allowed || domain.endsWith(`.${allowed}`);

/** Signals for the yellow «підозрілий лист» mark (round 19 D1 #34). Advisory only: nothing is blocked. */
export function verdict(input: { fromEmail: string; fromName?: string | null; text: string; html?: string | null; authResults?: string | null }) {
  const reasons: string[] = [];
  const auth = (input.authResults ?? '').toLowerCase();
  const pick = (k: string) => auth.match(new RegExp(`${k}=(\\w+)`))?.[1] ?? null;
  const spf = pick('spf'), dkim = pick('dkim'), dmarc = pick('dmarc');
  if (dmarc === 'fail') reasons.push('Адреса відправника не пройшла перевірку (DMARC)');
  else if (spf === 'fail' && dkim !== 'pass') reasons.push('Адреса відправника не пройшла перевірку (SPF)');

  const fromDomain = domainOf(input.fromEmail);
  for (const [name, domains] of BRANDS) {
    if (name.test(input.fromName ?? '') && !domains.some((d) => sameSite(fromDomain, d))) {
      reasons.push(`Ім'я відправника схоже на відому компанію, а адреса — ні (${fromDomain})`);
      break;
    }
  }
  if (fromDomain === 'vivcharuk.com' && dkim !== 'pass' && spf !== 'pass') reasons.push('Лист нібито від нашого домену, але без підтвердження');

  const body = `${input.text}\n${input.html ?? ''}`;
  if (/(пароль|password|парол|verify your account|підтвердіть (ваш )?(акаунт|обліковий)|account (suspended|locked)|оплатіть терміново|ваш акаунт буде)/i.test(body) && /https?:\/\//i.test(body)) {
    reasons.push('Просить пароль або термінову дію за посиланням');
  }
  for (const m of (input.html ?? '').matchAll(/<a[^>]+href="https?:\/\/([^/"]+)[^"]*"[^>]*>\s*(?:https?:\/\/)?([a-z0-9.-]+\.[a-z]{2,})/gi)) {
    const [, hrefHost, textHost] = m;
    if (hrefHost && textHost && !sameSite(hrefHost.toLowerCase(), textHost.toLowerCase().replace(/^www\./, ''))) {
      reasons.push(`Посилання показує ${textHost}, а веде на ${hrefHost}`);
      break;
    }
  }
  return { spf, dkim, dmarc, suspicious: reasons.length > 0, reasons };
}

/** Plain text of an HTML body, for search and previews. */
export const htmlToText = (html: string) => sanitizeHtml(html.replace(/<(br|\/p|\/div|\/li|\/tr)[^>]*>/gi, '\n'), { allowedTags: [], allowedAttributes: {} }).replace(/\n{3,}/g, '\n\n').trim();
