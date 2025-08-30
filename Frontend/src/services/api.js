// API service for backend communication (optional)
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Get habit data from backend
  async getHabit() {
    return this.request('/habit');
  }

  // Mark habit as completed for today
  async completeHabit() {
    return this.request('/habit/complete', {
      method: 'POST',
    });
  }

  // Reset habit data
  async resetHabit() {
    return this.request('/habit/reset', {
      method: 'POST',
    });
  }

  // Get last 7 days history
  async getHabitHistory() {
    return this.request('/habit/history');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Check if backend is available
  async isBackendAvailable() {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new ApiService();
export { ApiService };