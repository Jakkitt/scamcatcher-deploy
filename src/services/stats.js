import { api } from '../utils/api';

const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.append(key, value);
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export function recordSearchStats(params = {}) {
  return api.request('/stats/search', {
    method: 'POST',
    body: {
      firstName: params.firstName || '',
      lastName: params.lastName || '',
      name: params.name || '',
      account: params.account || '',
      bank: params.bank || '',
      channel: params.channel || '',
    },
  });
}

export function fetchSearchStats(params = {}) {
  return api.request(`/stats/search${buildQuery(params)}`);
}
