import { customFetch } from '../utils';
import { ConsentLog } from '../types';

const API_URL = '/api';

export const consentService = {
  /**
   * Fetches all consent logs.
   */
  async getAll(): Promise<ConsentLog[]> {
    const response = await customFetch(`${API_URL}/consent-logs/`, {
      method: 'GET',
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },

  /**
   * Requests consent (Institution).
   */
  async request(applicantId: string, institutionId: string, categories: string[]): Promise<ConsentLog> {
    const response = await customFetch(`${API_URL}/consent-logs/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicant: applicantId,
        requester_institution: institutionId,
        document_categories: categories,
        is_granted: false // Default to false until user approves
      }),
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },

  /**
   * Grants consent (Applicant).
   * Usually updating an existing request to is_granted=true
   */
  async grant(consentId: string): Promise<ConsentLog> {
      const response = await customFetch(`${API_URL}/consent-logs/${consentId}/`, {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_granted: true }),
      });
      if (!response.ok) throw await response.json();
      return response.json();
  },

  /**
   * Revokes consent.
   */
  async revoke(consentId: string): Promise<void> {
    const response = await customFetch(`${API_URL}/consent-logs/${consentId}/revoke/`, {
      method: 'POST',
    });
    if (!response.ok) throw await response.json();
  }
};
