import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://api.adventure-platform.com/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('@auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Clear auth and redirect to login
          await AsyncStorage.multiRemove(['@auth_token', '@user_data']);
          // Navigation will be handled by the screen
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

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await this.client.post('/auth/forgot-password', { email });
    return response.data;
  }

  async logout() {
    const response = await this.client.post('/auth/logout');
    await AsyncStorage.multiRemove(['@auth_token', '@user_data']);
    return response.data;
  }

  // Quests
  async getQuests(params?: {
    difficulty?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const response = await this.client.get('/quests', { params });
    return response.data;
  }

  async getQuestById(questId: string) {
    const response = await this.client.get(`/quests/${questId}`);
    return response.data;
  }

  async getQuestCheckpoints(questId: string) {
    const response = await this.client.get(`/quests/${questId}/checkpoints`);
    return response.data;
  }

  async startQuest(questId: string) {
    const response = await this.client.post(`/quests/${questId}/start`);
    return response.data;
  }

  async completeCheckpoint(questId: string, checkpointId: string, data: {
    latitude: number;
    longitude: number;
    photo?: string;
  }) {
    const formData = new FormData();
    formData.append('latitude', data.latitude.toString());
    formData.append('longitude', data.longitude.toString());
    if (data.photo) {
      formData.append('photo', {
        uri: data.photo,
        type: 'image/jpeg',
        name: 'checkpoint.jpg',
      } as any);
    }

    const response = await this.client.post(
      `/quests/${questId}/checkpoints/${checkpointId}/complete`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async completeQuest(questId: string) {
    const response = await this.client.post(`/quests/${questId}/complete`);
    return response.data;
  }

  async getQuestCompletion(questId: string) {
    const response = await this.client.get(`/quests/${questId}/completion`);
    return response.data;
  }

  // User Profile
  async getProfile() {
    const response = await this.client.get('/profiles/me');
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.client.put('/profiles/me', data);
    return response.data;
  }

  // Gamification
  async getAchievements() {
    const response = await this.client.get('/gamification/achievements');
    return response.data;
  }

  async getLeaderboard(timeframe: 'week' | 'month' | 'alltime' = 'month') {
    const response = await this.client.get('/gamification/leaderboard', {
      params: { timeframe },
    });
    return response.data;
  }

  async getUserStats() {
    const response = await this.client.get('/gamification/stats');
    return response.data;
  }

  // Social
  async followUser(userId: string) {
    const response = await this.client.post(`/social/follow/${userId}`);
    return response.data;
  }

  async unfollowUser(userId: string) {
    const response = await this.client.delete(`/social/follow/${userId}`);
    return response.data;
  }

  async getFeed(limit: number = 20, offset: number = 0) {
    const response = await this.client.get('/social/feed', {
      params: { limit, offset },
    });
    return response.data;
  }

  // Reviews
  async createReview(questId: string, data: { rating: number; comment: string }) {
    const response = await this.client.post(`/quests/${questId}/reviews`, data);
    return response.data;
  }

  async getQuestReviews(questId: string) {
    const response = await this.client.get(`/quests/${questId}/reviews`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
