interface SupabaseRequestOptions extends RequestInit {
  prefer?: string;
}

export class LeadStoreConfigurationError extends Error {}

const getConfiguration = () => {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new LeadStoreConfigurationError('Lead store environment variables are missing.');
  return { url, key };
};

export const supabaseRest = async <T>(
  resource: string,
  options: SupabaseRequestOptions = {}
): Promise<T> => {
  const { url, key } = getConfiguration();
  const headers = new Headers(options.headers);
  headers.set('apikey', key);
  if (!key.startsWith('sb_secret_')) {
    headers.set('Authorization', `Bearer ${key}`);
  }
  headers.set('Content-Type', 'application/json');
  if (options.prefer) headers.set('Prefer', options.prefer);

  const response = await fetch(`${url}/rest/v1/${resource}`, {
    ...options,
    headers
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Supabase request failed (${response.status}): ${text.slice(0, 500)}`);
  }

  return (text ? JSON.parse(text) : undefined) as T;
};
