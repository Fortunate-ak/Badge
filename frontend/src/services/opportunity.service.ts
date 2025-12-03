import { customFetch } from '../utils';
import { unwrapList } from './common';
import type { Opportunity, Application } from '../types';

const API_URL = '/api';

export const opportunityService = {
  /**
   * Fetches all opportunities.
   */
  async getAll(): Promise<Opportunity[]> {
    const response = await customFetch(`${API_URL}/opportunities/`, {
      method: 'GET',
    });
    if (!response.ok) throw await response.json();
    const data = await response.json();
    return unwrapList<Opportunity>(data);
  },

  /**
   * Fetches a single opportunity by ID.
   */
  async getById(id: string): Promise<Opportunity> {
    const response = await customFetch(`${API_URL}/opportunities/${id}/`, {
      method: 'GET',
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },

  /**
   * Creates a new opportunity.
   */
  async create(data: Partial<Opportunity>): Promise<Opportunity> {
    const response = await customFetch(`${API_URL}/opportunities/`, {
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
   * Updates an opportunity.
   */
  async update(id: string, data: Partial<Opportunity>): Promise<Opportunity> {
    const response = await customFetch(`${API_URL}/opportunities/${id}/`, {
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
   * Deletes an opportunity.
   */
  async delete(id: string): Promise<void> {
    const response = await customFetch(`${API_URL}/opportunities/${id}/`, {
        method: 'DELETE',
    });
    if (!response.ok) throw await response.json();
  },


  /**
   * Get recommended opportunities for a user.
   */
  async getRecommended(): Promise<Opportunity[]> {
    const response = await customFetch(`${API_URL}/opportunities/recommended/`, {
      method: 'GET',
    });
    if (!response.ok) throw await response.json();
    const data = await response.json();
    return unwrapList<Opportunity>(data);
  },

  /**
   * Check if the current user has applied to a specific opportunity.
   */
  async hasApplied(opportunityId: string): Promise<{ has_applied: boolean; application_id: string | null }> {
    const response = await customFetch(`${API_URL}/opportunities/${opportunityId}/has-applied/`, {
      method: 'GET',
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },

  /**
   * Get all applications for a specific opportunity.
   * (For institution staff)
   */
  async getApplications(opportunityId: string): Promise<Application[]> {
    const response = await customFetch(`${API_URL}/opportunities/${opportunityId}/applications/`, {
      method: 'GET',
    });
    if (!response.ok) throw await response.json();
    const data = await response.json();
    return unwrapList<Application>(data);
  }
};
