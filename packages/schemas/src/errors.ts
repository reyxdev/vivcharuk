import { z } from 'zod';

// The §26.8 error envelope. `code` is the contract; `message` is a convenience.
export const errorCode = z.enum([
  'MALFORMED_BODY',
  'AUTH_REQUIRED',
  'TOKEN_EXPIRED',
  'MFA_REQUIRED',
  'MFA_INVALID',
  'INVALID_CREDENTIALS',
  'ACCOUNT_LOCKED',
  'PERMISSION_DENIED',
  'NOT_FOUND',
  'PRODUCT_NOT_FOUND',
  'IDEMPOTENCY_KEY_CONFLICT',
  'PRICE_CHANGED',
  'RESOURCE_GONE',
  'VALIDATION_FAILED',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
  'UPSTREAM_UNAVAILABLE',
  'SERVICE_UNAVAILABLE',
]);
export type ErrorCode = z.infer<typeof errorCode>;

export const fieldError = z.object({
  path: z.string(),
  code: z.string(),
  params: z.record(z.string(), z.unknown()).optional(),
});

export const errorEnvelope = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    params: z.record(z.string(), z.unknown()).optional(),
    fieldErrors: z.array(fieldError).optional(),
    requestId: z.string(),
  }),
});
export type ErrorEnvelope = z.infer<typeof errorEnvelope>;
