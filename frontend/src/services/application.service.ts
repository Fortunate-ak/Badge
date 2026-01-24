import { customFetch } from '../utils';
import { unwrapList } from './common';
import type { Application, ApplicationDetail } from '../types';

const API_URL = '/api';

export const applicationService = {
  /**
   * Fetches all applications for the current user (or institution).
   */
  async getAll(): Promise<Application[]> {
    const url = `${API_URL}/applications/`;
    const response = await customFetch(url, {
        method: 'GET',
    });
    if (!response.ok) throw await response.json();
    const data = await response.json();
    return unwrapList<Application>(data);
    },

  /**
   * Fetches a single application by ID.
   */

  async getById(id: string): Promise<ApplicationDetail> {
    const response = await customFetch(`${API_URL}/applications/${id}/`, {
        method: 'GET',
    });
    if (!response.ok) throw await response.json();
    return response.json();
    },

    /**
     * Fetches the application for a specific opportunity for the current user.
     */
    async getByOpportunityId(opportunityId: string): Promise<ApplicationDetail | null> {
        const response = await customFetch(`${API_URL}/applications/?opportunity=${opportunityId}`);
        if (!response.ok) throw await response.json();
        const data = await response.json();
        const applications = unwrapList<ApplicationDetail>(data);
        return applications.length > 0 ? applications[0] : null;
    },

  /**
   * Applies to an opportunity.
   */
  async apply(opportunityId: string, letter?: string): Promise<Application> {
    const response = await customFetch(`${API_URL}/applications/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ opportunity: opportunityId, letter }),
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
