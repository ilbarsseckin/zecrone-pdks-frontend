import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

// Her istekte token ekle
api.interceptors.request.use(config => {
  const token = localStorage.getItem('pdks_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 → login sayfasına yönlendir
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pdks_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth ─────────────────────────────────────────────

export const login = async (data: {
  tenantEmail: string;
  userEmail: string;
  password: string;
}) => {
  const res = await api.post('/api/auth/login', data);
  localStorage.setItem('pdks_token', res.data.token);
  localStorage.setItem('pdks_role',  res.data.role);
  return res.data;
};

export const logout = () => {
  localStorage.removeItem('pdks_token');
  localStorage.removeItem('pdks_role');
  window.location.href = '/login';
};

// ─── Branches ─────────────────────────────────────────

export const getBranches = () =>
  api.get('/api/branches').then(r => r.data);

export const createBranch = (data: any) =>
  api.post('/api/branches', data).then(r => r.data);

// ─── Employees ────────────────────────────────────────

export const getEmployees = (branchId?: string) =>
  api.get('/api/employees', {
    params: branchId ? { branchId } : {}
  }).then(r => r.data);

export const createEmployee = (data: any) =>
  api.post('/api/employees', data).then(r => r.data);

// ─── Attendance ───────────────────────────────────────

export const checkIn = (employeeId: string) =>
  api.post(`/api/attendance/check-in?employeeId=${employeeId}`)
     .then(r => r.data);

export const checkOut = (employeeId: string) =>
  api.post(`/api/attendance/check-out?employeeId=${employeeId}`)
     .then(r => r.data);

export const getDailyReport = (branchId: string, date: string) =>
  api.get('/api/attendance/daily', {
    params: { branchId, date }
  }).then(r => r.data);

export const getMonthlyReport = (
  employeeId: string, year: number, month: number
) =>
  api.get('/api/attendance/monthly', {
    params: { employeeId, year, month }
  }).then(r => r.data);
