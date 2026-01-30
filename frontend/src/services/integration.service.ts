import { customFetch } from '../utils';
import { unwrapList } from './common';
import type { APIKey } from '../types';

const API_URL = '/api/integrations';

export const integrationService = {
  /**
   * Fetches all API keys.
   */
  async getAPIKeys(): Promise<APIKey[]> {
    const response = await customFetch(`${API_URL}/keys/`, {
      method: 'GET',
    });
    if (!response.ok) throw await response.json();
    const data = await response.json();
    return unwrapList<APIKey>(data);
  },

  /**
   * Creates a new API key.
   */
  async createAPIKey(label: string): Promise<APIKey> {
    const response = await customFetch(`${API_URL}/keys/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ label }),
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },

  /**
   * Deletes an API key.
   */
  async deleteAPIKey(id: string): Promise<void> {
    const response = await customFetch(`${API_URL}/keys/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw await response.json();
  }
};
