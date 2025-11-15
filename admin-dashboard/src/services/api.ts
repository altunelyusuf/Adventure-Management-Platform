import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3011/api/admin';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
        } else if (error.response?.status === 403) {
          toast.error('Access denied. Insufficient permissions.');
        } else if (error.response?.status >= 500) {
          toast.error('Server error. Please try again later.');
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
    }
  }

  // Users
  async getUsers(params?: { role?: string; limit?: number; offset?: number }) {
    const response = await this.client.get('/users', { params });
    return response.data;
  }

  async banUser(userId: string, reason: string, adminId: string) {
    const response = await this.client.post(`/users/${userId}/ban`, { reason, adminId });
    return response.data;
  }

  async unbanUser(userId: string) {
    const response = await this.client.post(`/users/${userId}/unban`);
    return response.data;
  }

  // Quests
  async getQuests(params?: { status?: string }) {
    const response = await this.client.get('/quests', { params });
    return response.data;
  }

  async approveQuest(questId: string, adminId: string) {
    const response = await this.client.post(`/quests/${questId}/approve`, { adminId });
    return response.data;
  }

  async rejectQuest(questId: string, reason: string, adminId: string) {
    const response = await this.client.post(`/quests/${questId}/reject`, { reason, adminId });
    return response.data;
  }

  // Analytics
  async getSystemStats() {
    const response = await this.client.get('/stats');
    return response.data;
  }

  async getUserGrowthStats(params?: { startDate?: string; endDate?: string }) {
    const response = await this.client.get('/stats/user-growth', { params });
    return response.data;
  }

  async getRevenueStats(params?: { startDate?: string; endDate?: string }) {
    const response = await this.client.get('/stats/revenue', { params });
    return response.data;
  }

  // Activity Logs
  async getActivityLogs(params?: { limit?: number; actionType?: string; entityType?: string }) {
    const response = await this.client.get('/activity-logs', { params });
    return response.data;
  }

  async exportActivityLogs(params?: { startDate?: string; endDate?: string }) {
    const response = await this.client.get('/activity-logs/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }

  // Generic request methods
  async get<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
