import { customFetch } from '../utils';
import { Application } from '../types';

const API_URL = '/api';

export const applicationService = {
  /**
   * Fetches all applications for the current user (or institution).
   */
  async getAll(): Promise<Application[]> {
    const response = await customFetch(`${API_URL}/applications/`, {
      method: 'GET',
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },

  /**
   * Applies to an opportunity.
   */
  async apply(opportunityId: string): Promise<Application> {
    const response = await customFetch(`${API_URL}/applications/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ opportunity: opportunityId }),
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },

  /**
   * Updates the status of an application (Institution only).
   */
  async updateStatus(applicationId: string, status: string): Promise<Application> {
    const response = await customFetch(`${API_URL}/applications/${applicationId}/update-status/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw await response.json();
    return response.json();
  }
};
