// Round 11 U3: category circles are illustrations in the shepherd's style, keyed by category key.
const files = import.meta.glob<string>('./art/categories/*.svg', { query: '?raw', import: 'default', eager: true });

export const categoryArt = (key: string | null | undefined) => (key ? files[`./art/categories/${key}.svg`] : undefined);
