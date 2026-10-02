import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requirePermission } from '../../plugins/staffAuth';
import * as svc from './employees.service';

const roleKeys = z.array(z.string().max(40)).min(1).max(7);

export async function employeeRoutes(app: FastifyInstance) {
  app.addHook('onSend', async (_req, reply) => { reply.header('cache-control', 'no-store'); });
  const strict = { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } };

  app.get('/admin/employees', { preHandler: requirePermission('employees.read') }, async () => svc.listEmployees());

  app.post('/admin/employees', { preHandler: requirePermission('employees.invite') }, async (req, reply) => {
    const b = z.object({ email: z.string().trim().email().max(254), firstName: z.string().trim().min(1).max(60), lastName: z.string().trim().min(1).max(60), roleKeys }).parse(req.body);
    return reply.status(201).send(await svc.invite(b, req.staff!));
  });

  app.post<{ Params: { id: string } }>('/admin/employees/:id/resend', { preHandler: requirePermission('employees.invite') }, async (req) => svc.resendInvite(req.params.id, req.staff!));

  app.post<{ Params: { id: string } }>('/admin/employees/:id/status', { preHandler: requirePermission('employees.read') }, async (req) => {
    const { op } = z.object({ op: z.enum(['suspend', 'unsuspend', 'block', 'unblock', 'deactivate']) }).parse(req.body);
    return svc.changeStatus(req.params.id, op, req.staff!);
  });

  app.put<{ Params: { id: string } }>('/admin/employees/:id/roles', { preHandler: requirePermission('employees.assign_roles') }, async (req, reply) => {
    await svc.setRoles(req.params.id, z.object({ roleKeys }).parse(req.body).roleKeys, req.staff!);
    return reply.status(204).send();
  });

  app.post<{ Params: { id: string } }>('/admin/employees/:id/reset-mfa', { preHandler: requirePermission('employees.reset_mfa') }, async (req, reply) => {
    await svc.resetMfa(req.params.id, req.staff!);
    return reply.status(204).send();
  });

  // Public: the invitee has no account yet. The token is the credential (24 §24.8).
  app.get('/auth/staff/invite', strict, async (req) => {
    const u = await svc.inviteInfo(z.object({ token: z.string().max(2000) }).parse(req.query).token);
    return { email: u.email, firstName: u.firstName };
  });
  app.post('/auth/staff/invite/accept', strict, async (req) => {
    const b = z.object({ token: z.string().max(2000), password: z.string().max(128) }).parse(req.body);
    return svc.acceptInvite(b.token, b.password);
  });
  app.post('/auth/staff/password-feedback', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req) => {
    const b = z.object({ token: z.string().max(2000), purpose: z.enum(['invite', 'reset']), password: z.string().max(128) }).parse(req.body);
    return svc.passwordFeedback(b.token, b.purpose, b.password);
  });
  app.post('/auth/staff/password-reset/accept', strict, async (req) => {
    const b = z.object({ token: z.string().max(2000), password: z.string().max(128) }).parse(req.body);
    return svc.acceptPasswordReset(b.token, b.password);
  });
}
