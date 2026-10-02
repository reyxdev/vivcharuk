// Ukrainian → Latin, KMU 2010 (official passport transliteration), for URL slugs (03 §3.5.4 rule 2).
const MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie', ж: 'zh', з: 'z', и: 'y', і: 'i', ї: 'i', й: 'i',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch',
  ш: 'sh', щ: 'shch', ь: '', ю: 'iu', я: 'ia', "'": '', 'ʼ': '', '’': '',
};
// At the start of a word є ї й ю я are written ye yi y yu ya.
const INITIAL: Record<string, string> = { є: 'ye', ї: 'yi', й: 'y', ю: 'yu', я: 'ya' };

export function slugify(text: string) {
  const lower = text.toLowerCase().replace(/зг/g, 'zgh');
  let out = '';
  let prevLetter = false;
  for (const ch of lower) {
    const isUk = ch in MAP;
    const latin = isUk ? (!prevLetter && INITIAL[ch] ? INITIAL[ch]! : MAP[ch]!) : /[a-z0-9]/.test(ch) ? ch : '-';
    out += latin;
    prevLetter = isUk || /[a-z]/.test(ch);
  }
  return out.replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}
