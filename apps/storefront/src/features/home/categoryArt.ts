// Round 11 U3: category circles are illustrations in the shepherd's style, keyed by category key.
const files = import.meta.glob<string>('./art/categories/*.svg', { query: '?raw', import: 'default', eager: true });

// Groups without their own drawing borrow a related one (round 22 K20: «Постіль» split off «Подушки»).
const BORROWED: Record<string, string> = { postil: 'podushky-ta-postil' };

export const categoryArt = (key: string | null | undefined) => (key ? files[`./art/categories/${key}.svg`] ?? files[`./art/categories/${BORROWED[key]}.svg`] : undefined);
