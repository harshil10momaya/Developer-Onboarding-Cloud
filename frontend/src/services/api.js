const API_BASE = 'http://localhost:8000/api';

// ---------- Token helpers ----------
export const getToken = () => localStorage.getItem('access_token');
export const setToken = (token) => localStorage.setItem('access_token', token);
export const removeToken = () => localStorage.removeItem('access_token');

// ---------- Fetch wrapper ----------
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  if (res.status === 204) return null;
  return res.json();
}

// ---------- Auth ----------
export const authAPI = {
  register: (data) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: async (email, password) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.access_token) setToken(res.access_token);
    return res;
  },

  me: () => apiFetch('/auth/me'),

  logout: () => {
    removeToken();
    window.location.href = '/login';
  },
};

// ---------- Dashboard ----------
export const dashboardAPI = {
  getStats: () => apiFetch('/dashboard/stats'),
};

// ---------- Repositories ----------
export const repoAPI = {
  list: () => apiFetch('/repositories'),
  get: (id) => apiFetch(`/repositories/${id}`),
  create: (data) =>
    apiFetch('/repositories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    apiFetch(`/repositories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) =>
    apiFetch(`/repositories/${id}`, { method: 'DELETE' }),
};

// ---------- Modules ----------
export const moduleAPI = {
  list: (repoId) =>
    apiFetch(`/modules${repoId ? `?repo_id=${repoId}` : ''}`),
  get: (id) => apiFetch(`/modules/${id}`),
  create: (data) =>
    apiFetch('/modules', { method: 'POST', body: JSON.stringify(data) }),
};

// ---------- Learning Paths ----------
export const learningPathAPI = {
  list: () => apiFetch('/learning-paths'),
  get: (id) => apiFetch(`/learning-paths/${id}`),
  create: (data) =>
    apiFetch('/learning-paths', { method: 'POST', body: JSON.stringify(data) }),
};

// ---------- Progress ----------
export const progressAPI = {
  getMyProgress: () => apiFetch('/progress'),
  update: (moduleId, data) =>
    apiFetch(`/progress/${moduleId}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ---------- Mentors ----------
export const mentorAPI = {
  list: () => apiFetch('/mentors'),
  getDeveloperProgress: () => apiFetch('/mentors/developers'),
};
