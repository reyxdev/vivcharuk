// Error codes → Ukrainian copy. Clients never display the server's `message` (26 §26.8).
const MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Неправильна пошта або пароль.',
  MFA_INVALID: 'Код не підходить. Перевірте час на телефоні й спробуйте ще раз.',
  TOKEN_EXPIRED: 'Час на введення коду минув. Увійдіть ще раз.',
  RATE_LIMITED: 'Забагато спроб. Зачекайте хвилину.',
  VALIDATION_FAILED: 'Перевірте введені дані.',
  PERMISSION_DENIED: 'Недостатньо прав для цієї дії.',
};
export const messageFor = (code: string) => MESSAGES[code] ?? 'Щось пішло не так. Спробуйте ще раз.';
