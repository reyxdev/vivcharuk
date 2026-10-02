import type { ErrorCode } from '@vivcharyk/schemas';

export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message?: string,
    readonly params?: Record<string, unknown>,
    readonly fieldErrors?: Array<{ path: string; code: string; params?: Record<string, unknown> }>,
  ) {
    super(message ?? code);
  }
}

export const notFound = (code: ErrorCode = 'NOT_FOUND') => new AppError(404, code);
export const forbidden = () => new AppError(403, 'PERMISSION_DENIED');
export const unauthorized = (code: ErrorCode = 'AUTH_REQUIRED') => new AppError(401, code);
