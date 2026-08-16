import assert from 'node:assert/strict';
import { createHmac, pbkdf2Sync } from 'node:crypto';
import { createServer } from 'vite';

process.env.LEADS_SESSION_SECRET = 'session-secret-with-more-than-thirty-two-characters';
process.env.LEADS_HASH_SECRET = 'hash-secret-with-more-than-thirty-two-characters';
const salt = '0123456789abcdef0123456789abcdef';
const password = 'secure test password';
const passwordHash = pbkdf2Sync(password, salt, 210_000, 32, 'sha256').toString('hex');
process.env.LEADS_DASHBOARD_USERS = JSON.stringify([
  { username: 'afiq', name: 'Afiq', role: 'owner', passwordHash: `${salt}:210000:${passwordHash}` }
]);

const server = await createServer({
  root: process.cwd(),
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true }
});

try {
  const validationModule = await server.ssrLoadModule('/src/lib/server/leadValidation.ts');
  const authModule = await server.ssrLoadModule('/src/lib/server/leadAuth.ts');
  const httpModule = await server.ssrLoadModule('/src/lib/server/http.ts');
  const storeModule = await server.ssrLoadModule('/src/lib/server/supabaseRest.ts');
  const leadApiModule = await server.ssrLoadModule('/src/pages/api/leads/index.ts');
  const healthApiModule = await server.ssrLoadModule('/src/pages/api/health.ts');
  const loginApiModule = await server.ssrLoadModule('/src/pages/api/auth/login.ts');
  const { normaliseMalaysianPhone, validateLeadSubmission } = validationModule;
  const { authenticateDashboardUser, createSessionToken, readSessionToken } = authModule;
  const { isSameOrigin, readJsonBody } = httpModule;
  const { supabaseRest } = storeModule;

  assert.equal(normaliseMalaysianPhone('012-345 6789'), '+60123456789');
  assert.equal(normaliseMalaysianPhone('+60 11-2345 6789'), '+601123456789');
  assert.equal(normaliseMalaysianPhone('12345'), null);

  const validInput = {
    name: 'Nur Aisyah',
    phone: '012-345 6789',
    email: 'aisyah@example.com',
    state: 'Selangor',
    preferredContactTime: 'morning',
    caseCategory: 'expert_review',
    message: 'Perlu bantuan mengenal pasti waris.',
    consent: true,
    website: '',
    sourcePage: '/'
  };
  const validated = validateLeadSubmission(validInput, 'hash-secret-with-more-than-thirty-two-characters', new Date('2026-07-31T10:00:00Z'));
  assert.deepEqual(validated.errors, {});
  assert.equal(validated.data.phone, '+60123456789');
  assert.equal(validated.data.consent_given, true);
  assert.equal(validated.data.message, validInput.message);
  assert.equal(validated.data.contact_hash.length, 64);
  assert.equal(validated.data.contact_hash, createHmac('sha256', 'hash-secret-with-more-than-thirty-two-characters').update('+60123456789').digest('hex'));

  const invalid = validateLeadSubmission({ ...validInput, phone: '123', state: '', consent: false }, 'hash-secret-with-more-than-thirty-two-characters');
  assert.ok(invalid.errors.phone);
  assert.ok(invalid.errors.state);
  assert.ok(invalid.errors.consent);
  assert.equal(invalid.data, undefined);

  const spam = validateLeadSubmission({ ...validInput, website: 'https://spam.example' }, 'hash-secret-with-more-than-thirty-two-characters');
  assert.equal(spam.isSpam, true);

  const user = authenticateDashboardUser('AFIQ', password);
  assert.deepEqual(user, { username: 'afiq', name: 'Afiq', role: 'owner' });
  assert.equal(authenticateDashboardUser('afiq', 'wrong password'), null);

  const issuedAt = Date.parse('2026-07-31T10:00:00Z');
  const token = createSessionToken(user, issuedAt);
  assert.deepEqual(readSessionToken(token, issuedAt + 1_000), user);
  assert.equal(readSessionToken(token, issuedAt + 13 * 60 * 60 * 1000), null);
  assert.equal(readSessionToken(`${token}tampered`, issuedAt + 1_000), null);

  assert.equal(isSameOrigin(new Request('https://www.kirafaraid.my/api/leads', {
    headers: { origin: 'https://www.kirafaraid.my' }
  })), true);
  assert.equal(isSameOrigin(new Request('https://www.kirafaraid.my/api/leads', {
    headers: { origin: 'http://www.kirafaraid.my' }
  })), false);
  await assert.rejects(
    readJsonBody(new Request('https://www.kirafaraid.my/api/leads', {
      method: 'POST',
      body: JSON.stringify({ value: 'too long' })
    }), 5),
    RangeError
  );

  process.env.SUPABASE_URL = 'https://project.supabase.co';
  process.env.SUPABASE_SECRET_KEY = 'sb_secret_test-key';
  const originalFetch = globalThis.fetch;
  let capturedRequest;
  globalThis.fetch = async (url, options) => {
    capturedRequest = { url, options };
    return new Response(JSON.stringify([{ id: 'lead-1' }]), { status: 200 });
  };
  const rows = await supabaseRest('leads?select=id');
  assert.deepEqual(rows, [{ id: 'lead-1' }]);
  assert.equal(capturedRequest.url, 'https://project.supabase.co/rest/v1/leads?select=id');
  assert.equal(new Headers(capturedRequest.options.headers).get('apikey'), 'sb_secret_test-key');
  assert.equal(new Headers(capturedRequest.options.headers).has('authorization'), false);

  const apiCalls = [];
  globalThis.fetch = async (url, options = {}) => {
    apiCalls.push({ url: String(url), options });
    if (String(url).includes('contact_hash=')) {
      return new Response(JSON.stringify([]), { status: 200 });
    }
    if (String(url).includes('/leads?select=id,created_at') && options.method === 'POST') {
      return new Response(JSON.stringify([{ id: '12345678-1234-4123-8123-123456789abc', created_at: '2026-07-31T10:00:00Z' }]), { status: 201 });
    }
    if (String(url).includes('/lead_activity')) {
      return new Response(null, { status: 201 });
    }
    throw new Error(`Unexpected API call: ${url}`);
  };

  const submitRequest = new Request('https://www.kirafaraid.my/api/leads', {
    method: 'POST',
    headers: {
      origin: 'https://www.kirafaraid.my',
      'content-type': 'application/json'
    },
    body: JSON.stringify(validInput)
  });
  const submitResponse = await leadApiModule.POST({ request: submitRequest });
  assert.equal(submitResponse.status, 201);
  assert.deepEqual(await submitResponse.json(), { ok: true, reference: '12345678' });
  assert.equal(apiCalls.length, 3);
  const insertedLead = JSON.parse(apiCalls[1].options.body);
  assert.equal(insertedLead.phone, '+60123456789');
  assert.equal(insertedLead.consent_given, true);
  assert.equal(insertedLead.contact_hash.length, 64);

  const crossOriginResponse = await leadApiModule.POST({
    request: new Request('https://www.kirafaraid.my/api/leads', {
      method: 'POST',
      headers: { origin: 'https://attacker.example', 'content-type': 'application/json' },
      body: JSON.stringify(validInput)
    })
  });
  assert.equal(crossOriginResponse.status, 403);

  const captureConsoleError = async (run) => {
    const originalConsoleError = console.error;
    const lines = [];
    console.error = (...args) => lines.push(args.join(' '));
    try {
      return { result: await run(), lines };
    } finally {
      console.error = originalConsoleError;
    }
  };

  globalThis.fetch = async () => {
    throw new Error('getaddrinfo ENOTFOUND project.supabase.co');
  };

  const outage = await captureConsoleError(() => leadApiModule.POST({
    request: new Request('https://www.kirafaraid.my/api/leads', {
      method: 'POST',
      headers: { origin: 'https://www.kirafaraid.my', 'content-type': 'application/json' },
      body: JSON.stringify(validInput)
    })
  }));
  assert.equal(outage.result.status, 503);
  const recoveryLine = outage.lines.find(line => line.startsWith('LEAD_SAVE_FAILED '));
  assert.ok(recoveryLine, 'A store outage must leave the lead recoverable from the logs.');
  const recoveredLead = JSON.parse(recoveryLine.slice('LEAD_SAVE_FAILED '.length));
  assert.equal(recoveredLead.phone, '+60123456789');
  assert.equal(recoveredLead.name, 'Nur Aisyah');
  assert.equal(recoveredLead.consent_given, true);

  const unhealthy = await captureConsoleError(() => healthApiModule.GET({
    request: new Request('https://www.kirafaraid.my/api/health')
  }));
  assert.equal(unhealthy.result.status, 503);
  assert.deepEqual(await unhealthy.result.json(), { ok: false, reason: 'unreachable' });

  globalThis.fetch = async () => new Response(JSON.stringify([]), { status: 200 });
  const healthy = await healthApiModule.GET({
    request: new Request('https://www.kirafaraid.my/api/health')
  });
  assert.equal(healthy.status, 200);
  assert.deepEqual(await healthy.json(), { ok: true });

  process.env.CRON_SECRET = 'cron-secret-with-more-than-thirty-two-characters';
  const unauthorisedHealth = await healthApiModule.GET({
    request: new Request('https://www.kirafaraid.my/api/health', {
      headers: { authorization: 'Bearer wrong-secret' }
    })
  });
  assert.equal(unauthorisedHealth.status, 401);
  const authorisedHealth = await healthApiModule.GET({
    request: new Request('https://www.kirafaraid.my/api/health', {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` }
    })
  });
  assert.equal(authorisedHealth.status, 200);
  delete process.env.CRON_SECRET;

  let sessionCookie;
  const loginResponse = await loginApiModule.POST({
    request: new Request('https://www.kirafaraid.my/api/auth/login', {
      method: 'POST',
      headers: { origin: 'https://www.kirafaraid.my', 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'afiq', password })
    }),
    cookies: {
      set(name, value, options) {
        sessionCookie = { name, value, options };
      }
    }
  });
  assert.equal(loginResponse.status, 200);
  assert.equal(sessionCookie.name, 'kf_leads_session');
  assert.equal(sessionCookie.options.httpOnly, true);
  assert.equal(sessionCookie.options.secure, true);
  globalThis.fetch = originalFetch;

  console.log('Lead pipeline: validation, API submission, authentication, session and private store tests passed.');
} finally {
  await server.close();
}
