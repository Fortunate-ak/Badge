import { customFetch } from '../utils';
import { unwrapList } from './common';
import type { Institution, InstitutionStaff } from '../types';

const API_URL = '/api';

export const institutionService = {
  /**
   * Fetches all institutions.
   */
  async getAll(): Promise<Institution[]> {
    const response = await customFetch(`${API_URL}/institutions/`, {
      method: 'GET',
    });
    if (!response.ok) throw await response.json();
    const data = await response.json();
    return unwrapList<Institution>(data);
  },

  /**
   * Fetches a single institution by ID.
   */
  async getById(id: string): Promise<Institution> {
    const response = await customFetch(`${API_URL}/institutions/${id}/`, {
      method: 'GET',
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },

  /**
   * Creates a new institution.
   */
  async create(data: Partial<Institution>): Promise<Institution> {
    const response = await customFetch(`${API_URL}/institutions/`, {
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
   * Updates an existing institution.
   */
  async update(id: string, data: Partial<Institution>): Promise<Institution> {
    const response = await customFetch(`${API_URL}/institutions/${id}/`, {
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
   * Adds a staff member to an institution.
   * @param institutionId The institution ID
   * @param email The email of the user to add
   * @param isAdmin Whether the new staff member is an admin
   */
  async addStaff(institutionId: string, email: string, isAdmin: boolean = false): Promise<void> {
    const response = await customFetch(`${API_URL}/institutions/${institutionId}/add-staff/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, is_admin: isAdmin }),
    });
    if (!response.ok) throw await response.json();
  },

  /**
   * Gets all staff for an institution (or all accessible staff relationships).
   */
    async getStaff(): Promise<InstitutionStaff[]> {
      const response = await customFetch(`${API_URL}/institution-staff/`, {
        method: 'GET',
      });
      if (!response.ok) throw await response.json();
      const data = await response.json();
      return unwrapList<InstitutionStaff>(data);
    }
};
