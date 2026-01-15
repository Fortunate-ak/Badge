import { customFetch } from '../utils';
import type { User } from '../types';

const API_URL = '/api';

export const applicantService = {
  /**
   * Fetches a single user by ID.
   */
  async getById(id: string): Promise<User> {
    const response = await customFetch(`${API_URL}/users/${id}/`, {
      method: 'GET',
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },

  /**
   * Updates an existing user.
   * If data contains a File object in 'profile_image', it sends FormData.
   * Otherwise it sends JSON.
   */
  async update(id: string, data: Partial<User> & { profile_image?: string | File }): Promise<User> {
    let body: BodyInit;
    let headers: HeadersInit = {};

    // Check if we need to use FormData (if profile_image is a File)
    const hasFile = data.profile_image instanceof File;

    if (hasFile) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (key === 'interests' || key === 'social_links') {
                // For JSONFields, stringify the object/array
                formData.append(key, JSON.stringify(value));
            } else if (Array.isArray(value)) {
                // For other arrays (if any), append each item
                value.forEach((v: any) => formData.append(key, v));
            } else {
                formData.append(key, value as string | Blob);
            }
        }
      });
      body = formData;
      // No Content-Type header; fetch sets it with boundary
    } else {
      body = JSON.stringify(data);
      headers = { 'Content-Type': 'application/json' };
    }

    const response = await customFetch(`${API_URL}/users/${id}/`, {
      method: 'PATCH',
      headers,
      body,
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },

  /**
   * Specific method to upload profile image only.
   */
  async uploadProfileImage(id: string, image: File): Promise<User> {
      const formData = new FormData();
      formData.append('profile_image', image);
      const response = await customFetch(`${API_URL}/users/${id}/`, {
          method: 'PATCH',
          body: formData
      });
      if (!response.ok) throw await response.json();
      return response.json();
  }
};
