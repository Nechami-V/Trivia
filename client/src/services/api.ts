import AsyncStorage from '@react-native-async-storage/async-storage';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const API_BASE_URL = __DEV__ ? 'http://localhost:3000/api' : 'https://your-production-api.com/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = await this.getStoredToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async getStoredToken(): Promise<string | null> {
    try {
      const authData = await AsyncStorage.getItem('auth-storage');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.token || null;
      }
      return null;
    } catch (error) {
      console.error('Failed to get stored token:', error);
      return null;
    }
  }

  // Auth endpoints
  async guestLogin(username: string) {
    return this.request<{ token: string; user: any }>('/auth/guest-login', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me');
  }

  async updateProfile(data: { username?: string; email?: string }) {
    return this.request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Game endpoints
  async startGame() {
    return this.request<{ sessionId: string; lives: number; score: number }>('/game/start', {
      method: 'POST',
    });
  }

  async getCurrentGame() {
    return this.request<any>('/game/current');
  }

  async submitAnswer(data: {
    sessionId: string;
    questionId: string;
    selectedAnswer: number;
    timeLeft: number;
  }) {
    return this.request<any>('/game/answer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async endGame(sessionId: string) {
    return this.request<any>('/game/end', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  // Question endpoints
  async getRandomQuestion(excludeIds: string[] = []) {
    const params = new URLSearchParams();
    excludeIds.forEach(id => params.append('excludeIds', id));
    
    return this.request<any>(`/questions/random?${params.toString()}`);
  }

  async getQuestion(id: string) {
    return this.request<any>(`/questions/${id}`);
  }

  async getQuestionsCount() {
    return this.request<{ count: number }>('/questions/stats/count');
  }

  // Leaderboard endpoints
  async getLeaderboard(page: number = 1, limit: number = 50) {
    return this.request<any>(`/leaderboard?page=${page}&limit=${limit}`);
  }

  async getUserRank(userId: string) {
    return this.request<any>(`/leaderboard/rank/${userId}`);
  }

  async getTopPlayers(count: number = 10) {
    return this.request<any>(`/leaderboard/top/${count}`);
  }

  // Admin endpoints
  async getAdminStats() {
    return this.request<any>('/admin/stats');
  }

  async getAdminQuestions(page: number = 1, limit: number = 50) {
    return this.request<any>(`/admin/questions?page=${page}&limit=${limit}`);
  }

  async addQuestion(questionData: FormData) {
    return this.request<any>('/admin/questions', {
      method: 'POST',
      body: questionData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }

  async updateQuestion(id: string, questionData: FormData) {
    return this.request<any>(`/admin/questions/${id}`, {
      method: 'PUT',
      body: questionData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }

  async deleteQuestion(id: string) {
    return this.request<any>(`/admin/questions/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminUsers(page: number = 1, limit: number = 50) {
    return this.request<any>(`/admin/users?page=${page}&limit=${limit}`);
  }

  async deleteUser(id: string) {
    return this.request<any>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async resetLeaderboard() {
    return this.request<any>('/admin/reset-leaderboard', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
