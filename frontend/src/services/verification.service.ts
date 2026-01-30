import { customFetch } from '../utils';
import { unwrapList } from './common';
import type { Verification } from '../types';

const API_URL = '/api';

export const verificationService = {
  /**
   * Fetches verifications with optional filters.
   */
  async getAll(params: Record<string, string> = {}): Promise<Verification[]> {
    const searchParams = new URLSearchParams(params);
    const response = await customFetch(`${API_URL}/verifications/?${searchParams.toString()}`, {
      method: 'GET',
    });
    if (!response.ok) throw await response.json();
    const data = await response.json();
    return unwrapList<Verification>(data);
  },

  /**
   * Creates a new verification request.
   */
  async create(data: { document: string; institution: string; is_verified?: boolean, rejection_reason?: string }): Promise<Verification> {
    const response = await customFetch(`${API_URL}/verifications/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },

  /**
   * Updates an existing verification.
   */
  async update(id: string, data: Partial<Verification>): Promise<Verification> {
    const response = await customFetch(`${API_URL}/verifications/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },

    /**
   * Deletes a verification.
   */
    async delete(id: string): Promise<void> {
      const response = await customFetch(`${API_URL}/verifications/${id}/`, {
        method: 'DELETE',
      });
      if (!response.ok) throw await response.json();
    },
};
