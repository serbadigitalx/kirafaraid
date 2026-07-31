export const jsonResponse = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, private',
      'X-Content-Type-Options': 'nosniff',
      ...headers
    }
  });

export const isSameOrigin = (request: Request): boolean => {
  const origin = request.headers.get('origin');
  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
};

export const readJsonBody = async (request: Request, maximumBytes: number): Promise<unknown> => {
  const declaredLength = Number.parseInt(request.headers.get('content-length') || '0', 10);
  if (Number.isFinite(declaredLength) && declaredLength > maximumBytes) {
    throw new RangeError('Request body is too large.');
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > maximumBytes) {
    throw new RangeError('Request body is too large.');
  }
  return JSON.parse(raw);
};
