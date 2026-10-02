// Business facts shown on the site. Values marked PLACEHOLDER are unresolved client facts
// ({{TOKEN}} in the blueprint). They are filled in at the end of the build — never invent them.
export const PLACEHOLDER = '[заглушка]';

export const BUSINESS = {
  brand: 'Вівчарик',
  // Approved tagline, exact (CLAUDE.md). The claim attaches to the manufacturing.
  tagline: 'Понад 30 років виробляємо натуральні вовняні вироби в Карпатах.',
  locality: 'с. Яворів, Косівський район',
  // Round 18: fixed hours (earlier rounds: «графік гнучкий»). Saturday and Sunday are days off.
  hours: 'пн–пт, 11:00–19:00',
  hoursText: 'Працюємо пн–пт з 11:00 до 19:00, субота й неділя — вихідні.',
  domain: 'vivcharuk.com', // round 18: the domain actually registered (Porkbun)
  publicEmail: 'info@vivcharuk.com', // the Porkbun mailbox to create
  legalEntityName: 'ФОП Гондурак Любов Юріївна', // round 18
  legalId: '2531703749', // РНОКПП of the ФОП (round 18)
  // Payment by bank transfer (round 18); shown on the order page with the order number as purpose.
  iban: 'UA223003350000000260092276708',
  factoryAddress: 'вул. Петруші, 1, с. Яворів, Косівський р-н, Івано-Франківська обл., 78644', // round 18
  street: 'вул. Петруші, 1',
  postalCode: '78644', // round 18; public postal index of с. Яворів, Косівський р-н
  phones: ['+38 067 997 34 50'],
  // Round 18: one phone for calls and Viber, Telegram, WhatsApp — Іван's (number: round 2, round 9 part 5 #5).
  contactPeople: [{ name: 'Іван', phone: '+38 067 997 34 50' }],
  messengerPhone: '+38 067 997 34 50',
  // Google Business Profile (round 13 N2, N3): «Читати в Google» and the review form.
  googleProfileUrl: '[Google-профіль — заглушка]', // {{GOOGLE_PROFILE_URL}}
  googleReviewUrl: '[Google-відгук — заглушка]', // {{GOOGLE_REVIEW_URL}}
  googleRating: '[рейтинг]', // {{GOOGLE_RATING}}, from the profile once it exists
  googleReviewCount: '[кількість]', // {{GOOGLE_REVIEW_COUNT}}
  // «Прокласти маршрут» until the Google profile link exists (contacts page, homepage S9).
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Яворів, Косівський район, Івано-Франківська область')}`,
} as const;

export const isPlaceholder = (v: string) => v.startsWith('[');
const digits = (phone: string) => phone.replace(/\D/g, '');
/** tel:, Viber, Telegram and WhatsApp links; null while the number is still a placeholder. */
export const contactLinks = (phone: string) =>
  isPlaceholder(phone) ? null : {
    tel: `tel:+${digits(phone)}`,
    viber: `viber://chat?number=%2B${digits(phone)}`,
    telegram: `https://t.me/+${digits(phone)}`,
    whatsapp: `https://wa.me/${digits(phone)}`,
  };
