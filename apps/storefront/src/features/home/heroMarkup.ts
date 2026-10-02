// The hero art is ~840 KB of SVG. It is written into the server-rendered HTML only — the client bundle
// no longer carries a second copy (it used to: ~2 MB to parse on a phone). When the home page is
// reached by client-side navigation, the same art is fetched once as a static, long-cached file.
import heroUrl from './art/hero.svg?url';

export const heroServerMarkup: string = import.meta.env.SSR ? (await import('./art/hero.svg?raw')).default : '';
export { heroUrl };
