import { customFetch } from '../utils';
import type { User } from '../types';

const API_URL = '/api';

export const authService = {
  /**
   * Registers a new user.
   * @param data Registration data
   */
  async register(data: any): Promise<User> {
    const response = await customFetch(`${API_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw await response.json();
    }
    return response.json();
  },

  /**
   * Logs in a user.
   * @param data Login credentials
   */
  async login(data: any): Promise<{ status: string }> {
    const response = await customFetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw await response.json();
    }
    return response.json();
  },

  /**
   * Logs out the current user.
   */
  async logout(): Promise<void> {
    const response = await customFetch(`${API_URL}/auth/logout/`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw await response.json();
    }
  },

  /**
   * Gets the current user's profile.
   */
  async getCurrentUser(): Promise<User> {
    const response = await customFetch(`${API_URL}/auth/me/`, {
      method: 'GET',
    });
    if (!response.ok) {
        throw await response.json();
    }
    return response.json();
  },

  /**
   * Changes the current user's password.
   */
  async changePassword(data: any): Promise<any> {
    const response = await customFetch(`${API_URL}/users/change-password/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw await response.json();
    }
    return response.json();
  }
};
