const API_BASE = 'http://localhost:8000/api';

export const getToken = () => localStorage.getItem('access_token');
export const setToken = (token) => localStorage.setItem('access_token', token);
export const removeToken = () => localStorage.removeItem('access_token');

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }), ...options.headers };
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (res.status === 401) { removeToken(); window.location.href = '/login'; throw new Error('Unauthorized'); }
  if (!res.ok) { const error = await res.json().catch(() => ({ detail: 'Request failed' })); throw new Error(error.detail || 'Request failed'); }
  if (res.status === 204) return null;
  return res.json();
}

export const authAPI = {
  register: (data) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: async (email, password) => { const res = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); if (res.access_token) setToken(res.access_token); return res; },
  me: () => apiFetch('/auth/me'),
  logout: () => { removeToken(); window.location.href = '/login'; },
};

export const dashboardAPI = { getStats: () => apiFetch('/dashboard/stats') };

export const repoAPI = {
  list: () => apiFetch('/repositories'),
  get: (id) => apiFetch(`/repositories/${id}`),
  create: (data) => apiFetch('/repositories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/repositories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/repositories/${id}`, { method: 'DELETE' }),
};

export const moduleAPI = {
  list: (repoId) => apiFetch(`/modules${repoId ? `?repo_id=${repoId}` : ''}`),
  get: (id) => apiFetch(`/modules/${id}`),
  create: (data) => apiFetch('/modules', { method: 'POST', body: JSON.stringify(data) }),
};

export const learningPathAPI = {
  list: () => apiFetch('/learning-paths'),
  get: (id) => apiFetch(`/learning-paths/${id}`),
  create: (data) => apiFetch('/learning-paths', { method: 'POST', body: JSON.stringify(data) }),
};

export const progressAPI = {
  getMyProgress: () => apiFetch('/progress'),
  update: (moduleId, data) => apiFetch(`/progress/${moduleId}`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const courseAPI = {
  list: (learningPathId) => apiFetch(`/courses${learningPathId ? `?learning_path_id=${learningPathId}` : ''}`),
  get: (id) => apiFetch(`/courses/${id}`),
  getProgress: (courseId) => apiFetch(`/courses/${courseId}/progress`),
};

export const lectureAPI = {
  get: (id) => apiFetch(`/lectures/${id}`),
  updateProgress: (id, data) => apiFetch(`/lectures/${id}/progress`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const mentorAPI = {
  list: () => apiFetch('/mentors'),
  getDeveloperProgress: () => apiFetch('/mentors/developers'),
  checkAvailability: (mentorId, scheduledAt) => apiFetch(`/mentors/${mentorId}/availability?scheduled_at=${encodeURIComponent(scheduledAt)}`),
  requestSession: (data) => apiFetch('/mentors/sessions', { method: 'POST', body: JSON.stringify(data) }),
  listSessions: () => apiFetch('/mentors/sessions'),
  respondSession: (sessionId, data) => apiFetch(`/mentors/sessions/${sessionId}`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const notificationAPI = {
  list: () => apiFetch('/mentors/notifications'),
  markRead: (id) => apiFetch(`/mentors/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => apiFetch('/mentors/notifications/read-all', { method: 'PUT' }),
};

export const discussionAPI = {
  list: (category) => apiFetch(`/discussions${category ? `?category=${category}` : ''}`),
  get: (id) => apiFetch(`/discussions/${id}`),
  create: (data) => apiFetch('/discussions', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/discussions/${id}`, { method: 'DELETE' }),
  listReplies: (id) => apiFetch(`/discussions/${id}/replies`),
  createReply: (id, body) => apiFetch(`/discussions/${id}/replies`, { method: 'POST', body: JSON.stringify({ body }) }),
};

export const docsAPI = {
  list: (category) => apiFetch(`/docs${category ? `?category=${category}` : ''}`),
  get: (id) => apiFetch(`/docs/${id}`),
  create: (data) => apiFetch('/docs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/docs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/docs/${id}`, { method: 'DELETE' }),
};

export const pipelineAPI = {
  list: () => apiFetch('/pipelines'),
  create: (data) => apiFetch('/pipelines', { method: 'POST', body: JSON.stringify(data) }),
  trigger: (id) => apiFetch(`/pipelines/${id}/run`, { method: 'PUT' }),
  delete: (id) => apiFetch(`/pipelines/${id}`, { method: 'DELETE' }),
};

export const codeAnalysisAPI = {
  list: () => apiFetch('/code-analysis'),
  analyze: (repoId) => apiFetch(`/code-analysis/${repoId}/analyze`, { method: 'POST' }),
};
