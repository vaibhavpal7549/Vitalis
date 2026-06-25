import api from './axios';

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const healthAPI = {
  createLog: (data) => api.post('/health/log', data),
  getLogs: (params) => api.get('/health/logs', { params }),
  getTodayLog: () => api.get('/health/logs/today'),
  getLogsInRange: (startDate, endDate) =>
    api.get('/health/logs/range', { params: { startDate, endDate } }),
  deleteLog: (id) => api.delete(`/health/logs/${id}`),
};

export const twinAPI = {
  getTwin: () => api.get('/twin'),
  refreshTwin: () => api.post('/twin/refresh'),
  getHistory: () => api.get('/twin/history'),
};

export const predictionsAPI = {
  getPredictions: () => api.get('/predictions'),
  generate: () => api.post('/predictions/generate'),
  getHistory: () => api.get('/predictions/history'),
};

export const simulatorAPI = {
  simulate: (params, days) => api.post('/simulator/simulate', { params, days }),
};

export const achievementsAPI = {
  getAchievements: () => api.get('/achievements'),
  checkAchievements: () => api.post('/achievements/check'),
};

export const reportsAPI = {
  getWeeklyReport: () => api.get('/reports/weekly'),
};

export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
  getActiveUsers: (days) => api.get('/admin/active-users', { params: { days } }),
  getHealthStats: () => api.get('/admin/health-stats'),
};
