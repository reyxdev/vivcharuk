import { SignJWT, jwtVerify } from 'jose';
import { config } from '../../config';

const key = new TextEncoder().encode(config.jwt.accessSecret);
export const ACCESS_TTL_S = 15 * 60;

export interface AccessClaims { sub: string; sid: string; pv: number }

export const signAccess = (c: AccessClaims) =>
  new SignJWT({ sid: c.sid, pv: c.pv, typ: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(c.sub)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_S}s`)
    .sign(key);

export async function verifyAccess(token: string): Promise<AccessClaims | null> {
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    if (payload.typ !== 'access' || !payload.sub) return null;
    return { sub: payload.sub, sid: String(payload.sid), pv: Number(payload.pv) };
  } catch {
    return null;
  }
}

// Short-lived, single-purpose tokens for the MFA challenge and enrolment steps (24 §24.11).
export type StepKind = 'mfa' | 'enrol';
export const signStep = (kind: StepKind, sub: string, ip: string, jti: string) =>
  new SignJWT({ typ: kind, ip }).setProtectedHeader({ alg: 'HS256' }).setSubject(sub).setJti(jti).setIssuedAt().setExpirationTime('5m').sign(key);

export async function verifyStep(kind: StepKind, token: string, ip: string) {
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    if (payload.typ !== kind || payload.ip !== ip || !payload.sub || !payload.jti) return null;
    return { sub: payload.sub, jti: payload.jti };
  } catch {
    return null;
  }
}

// Invitation and password-reset tokens (24 §24.8): stateless, bound to a field that moves on use,
// so single use falls out of the state machine. Invite: 72 h, anchored to invitedAt. Reset: 30 min,
// anchored to passwordChangedAt.
export type StaffTokenPurpose = 'staff_invite' | 'staff_password_reset';
const staffKey = new TextEncoder().encode(config.jwt.staffTokenSecret);
export const staffTokenAnchor = (d: Date | null | undefined) => (d ? d.getTime() : 0);

export const signStaffToken = (purpose: StaffTokenPurpose, sub: string, anchor: number) =>
  new SignJWT({ purpose, anchor }).setProtectedHeader({ alg: 'HS256' }).setSubject(sub).setJti(crypto.randomUUID())
    .setIssuedAt().setExpirationTime(purpose === 'staff_invite' ? '72h' : '30m').sign(staffKey);

export async function verifyStaffToken(purpose: StaffTokenPurpose, token: string) {
  try {
    const { payload } = await jwtVerify(token, staffKey, { algorithms: ['HS256'] });
    if (payload.purpose !== purpose || !payload.sub || typeof payload.anchor !== 'number') return null;
    return { sub: payload.sub, anchor: payload.anchor };
  } catch {
    return null;
  }
}
