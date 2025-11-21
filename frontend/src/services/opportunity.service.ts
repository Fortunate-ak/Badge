import { customFetch } from '../utils';
import type { Opportunity } from '../types';

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
    return response.json();
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
  }
};
