import axios from 'axios';
import toast from 'react-hot-toast';
const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    'http://localhost:8000/api/v1',

  headers: {
    'Content-Type': 'application/json',
  },

  timeout: 15000,
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('facultyup_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        localStorage.removeItem('facultyup_token');
        localStorage.removeItem('facultyup_user');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      } else if (status === 403) {
        toast.error(data?.message || 'Access denied');
      } else if (status === 422) {
        const errors = data?.errors;
        if (errors) {
          const firstError = Object.values(errors)[0];
          toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
        }
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      }
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Check your connection.');
    }

    return Promise.reject(error);
  }
);

// ===================== AUTH APIs =====================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  login: (data) => api.post('/auth/login', data),
  resendOtp: (data) => api.post('/auth/resend-otp', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// ===================== ADMIN APIs =====================
export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  getTeachers: (params) => api.get('/admin/teachers', { params }),
  createTeacher: (data) => api.post('/admin/teachers', data),
  updateTeacher: (id, data) => api.put(`/admin/teachers/${id}`, data),
  deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),
  getStudents: (params) => api.get('/admin/students', { params }),
  getWorkshops: (params) => api.get('/admin/workshops', { params }),
  createWorkshop: (data) => api.post('/admin/workshops', data),
  updateWorkshop: (id, data) => api.put(`/admin/workshops/${id}`, data),
  deleteWorkshop: (id) => api.delete(`/admin/workshops/${id}`),
  getAnnouncements: () => api.get('/admin/announcements'),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`),
  generatePerformance: (data) => api.post('/admin/performance/generate', data),
  getPerformanceReports: (params) => api.get('/admin/performance/reports', { params }),
  getPendingAchievements: () => api.get('/admin/achievements/pending'),
  verifyAchievement: (id) => api.put(`/admin/achievements/${id}/verify`),
};

// ===================== TEACHER APIs =====================
export const teacherAPI = {
  dashboard: () => api.get('/teacher/dashboard'),
  getProfile: () => api.get('/teacher/profile'),
  updateProfile: (data) => api.post('/teacher/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getFeedbacks: (params) => api.get('/teacher/feedbacks', { params }),
  getAchievements: () => api.get('/teacher/achievements'),
  uploadAchievement: (data) => api.post('/teacher/achievements', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  joinWorkshop: (workshopId) => api.post(`/teacher/workshops/${workshopId}/join`),
  getMyWorkshops: () => api.get('/teacher/workshops'),
  getPerformanceHistory: () => api.get('/teacher/performance'),
};

// ===================== STUDENT APIs =====================
export const studentAPI = {
  dashboard: () => api.get('/student/dashboard'),
  getTeachers: (params) => api.get('/student/teachers', { params }),
  getTeacherProfile: (id) => api.get(`/student/teachers/${id}`),
  submitFeedback: (data) => api.post('/student/feedback', data),
  getMyFeedbacks: () => api.get('/student/feedbacks'),
};

// ===================== SHARED APIs =====================
export const sharedAPI = {
  getAnnouncements: () => api.get('/announcements'),
};

export default api;
