import { api } from '../utils/api';

export async function fetchExternalChecks(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.append(key, value);
  });
  const query = searchParams.toString();
  const path = query ? `/external/checks?${query}` : '/external/checks';
  return api.request(path);
}
