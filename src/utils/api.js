const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });

  if (res.status === 204) return;

  const contentType = res.headers.get('content-type');
  let data;

  if (contentType && contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (err) {
      if (!res.ok) {
        throw new Error(`Server error (${res.status}): The response could not be parsed.`);
      }
      throw new Error('Failed to parse server response as JSON.');
    }
  } else {
    const text = await res.text();
    if (!res.ok) {
      throw new Error(text || `Request failed with status ${res.status}`);
    }
    return text;
  }

  if (!res.ok) {
    const error = new Error(data?.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    throw error;
  }

  return data;
}

export const authApi = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),
};

export const userApi = {
  getProfile: () => request('/users/me'),
  updateProfile: (body) => request('/users/me', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body) => request('/users/me/password', { method: 'PUT', body: JSON.stringify(body) }),
  deactivate: () => request('/users/me/deactivate', { method: 'PATCH' }),
  deleteAccount: () => request('/users/me', { method: 'DELETE' }),
};

export const cashflowApi = {
  get: () => request('/cashflow'),
  updateIncome: (netIncome) =>
    request('/cashflow/income', { method: 'PUT', body: JSON.stringify({ netIncome }) }),
  addExpense: (expense) =>
    request('/cashflow/expenses', { method: 'POST', body: JSON.stringify(expense) }),
  removeExpense: (expenseId) =>
    request(`/cashflow/expenses/${expenseId}`, { method: 'DELETE' }),
};

export const marketApi = {
  getCryptoChart: (coinId, days, currency = 'usd') =>
    request(`/market/crypto/${coinId}/chart?days=${days}&currency=${currency}`),
  getEquityQuote: (symbol) =>
    request(`/market/equity/${symbol}/quote`),
  getForexRates: () =>
    request('/market/forex/rates'),
  getMarketNews: (category = 'general') =>
    request(`/market/news?category=${category}`),
};

export const goalsApi = {
  getAll: () => request('/goals'),
  getOne: (id) => request(`/goals/${id}`),
  create: (body) =>
    request('/goals', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) =>
    request(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  quickSave: (id, savedAmount) =>
    request(`/goals/${id}/save`, { method: 'PATCH', body: JSON.stringify({ savedAmount }) }),
  remove: (id) =>
    request(`/goals/${id}`, { method: 'DELETE' }),
};

