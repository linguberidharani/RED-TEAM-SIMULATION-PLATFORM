import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rt_token');
      localStorage.removeItem('rt_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────
export const register   = (data) => api.post('/auth/register',   data);
export const sendOtp    = (data) => api.post('/auth/send-otp',   data);
export const verifyOtp  = (data) => api.post('/auth/verify-otp', data);
export const login      = (data) => api.post('/auth/login',      data);
export const getMe      = ()     => api.get('/auth/me');

// ── Devices ───────────────────────────────────────────────────
export const getDevices     = ()     => api.get('/devices');
export const getDeviceStats = ()     => api.get('/devices/stats');
export const addDevice      = (data) => api.post('/devices', data);
export const deleteDevice   = (id)   => api.delete(`/devices/${id}`);

// ── Attack ────────────────────────────────────────────────────
export const startAttack      = (deviceId)                 => api.post('/attack/start',      { deviceId });
export const escalateAttack   = (deviceId)                 => api.post('/attack/escalate',   { deviceId });
export const moveAttack       = (deviceId, targetDeviceId) => api.post('/attack/move',       { deviceId, targetDeviceId });
export const exfiltrateAttack = (deviceId)                 => api.post('/attack/exfiltrate', { deviceId });

// ── Logs ──────────────────────────────────────────────────────
export const getLogs   = (params) => api.get('/logs', { params });
export const clearLogs = ()       => api.delete('/logs');

// ── Risk ──────────────────────────────────────────────────────
export const getRisk        = () => api.get('/risk');
export const getRiskSummary = () => api.get('/risk/summary');

// ── Simulation ────────────────────────────────────────────────
export const getSimStatus    = () => api.get('/simulation/status');
export const resetSimulation = () => api.post('/simulation/reset');

// ── Reports ───────────────────────────────────────────────────
export const sendReportApi = (data) => api.post('/report/send', data);

export default api;