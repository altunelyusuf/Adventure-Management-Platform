import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: any) =>
    api.post('/auth/register', data),

  logout: () =>
    api.post('/auth/logout'),

  getCurrentUser: () =>
    api.get('/auth/me'),
};

// Quest API
export const questAPI = {
  getQuests: (params?: any) =>
    api.get('/quests', { params }),

  getQuest: (id: string) =>
    api.get(`/quests/${id}`),

  createQuest: (data: any) =>
    api.post('/quests', data),

  updateQuest: (id: string, data: any) =>
    api.put(`/quests/${id}`, data),

  deleteQuest: (id: string) =>
    api.delete(`/quests/${id}`),

  searchQuests: (query: string) =>
    api.get(`/quests/search?q=${query}`),
};

// Gamification API
export const gamificationAPI = {
  getUserXP: () =>
    api.get('/gamification/xp/me'),

  getAchievements: () =>
    api.get('/gamification/achievements'),

  getUserAchievements: () =>
    api.get('/gamification/achievements/me'),

  getLeaderboard: (type: string) =>
    api.get(`/gamification/leaderboard/${type}`),
};

// Social API
export const socialAPI = {
  getFeed: (type: string) =>
    api.get(`/social/feed/${type}`),

  likeActivity: (activityId: string) =>
    api.post(`/social/interactions/activity/${activityId}/like`),

  commentActivity: (activityId: string, content: string) =>
    api.post(`/social/interactions/activity/${activityId}/comment`, { content }),

  getFriends: () =>
    api.get('/social/friends/me'),

  sendFriendRequest: (userId: string) =>
    api.post('/social/friends/request', { receiverId: userId }),
};

// Notification API
export const notificationAPI = {
  getNotifications: () =>
    api.get('/notifications/notifications/me'),

  markAsRead: (id: string) =>
    api.put(`/notifications/notifications/${id}/read`),

  markAllAsRead: () =>
    api.put('/notifications/notifications/read/all'),

  getUnreadCount: () =>
    api.get('/notifications/notifications/me/unread/count'),
};

// Payment API
export const paymentAPI = {
  getSubscriptions: () =>
    api.get('/payments/subscriptions'),

  createSubscription: (data: any) =>
    api.post('/payments/subscriptions', data),

  cancelSubscription: (id: string) =>
    api.delete(`/payments/subscriptions/${id}`),
};
