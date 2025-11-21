import { customFetch } from '../utils';
import { Document, DocumentCategory, Verification } from '../types';

const API_URL = '/api';

export const documentService = {
  /**
   * Fetches all documents accessible to the user.
   */
  async getAll(): Promise<Document[]> {
    const response = await customFetch(`${API_URL}/documents/`, {
      method: 'GET',
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },

  /**
   * Fetches all document categories.
   */
  async getCategories(): Promise<DocumentCategory[]> {
    const response = await customFetch(`${API_URL}/document-categories/`, {
      method: 'GET',
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },

  /**
   * Uploads a new document.
   * Note: Uses FormData for file upload.
   */
  async upload(file: File, categories: string[], applicantId?: string): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    categories.forEach(cat => formData.append('categories', cat));
    if (applicantId) {
        formData.append('applicant', applicantId);
    }

    const response = await customFetch(`${API_URL}/documents/`, {
      method: 'POST',
      body: formData, // Fetch handles Content-Type for FormData automatically
    });
    if (!response.ok) throw await response.json();
    return response.json();
  },

  /**
   * Verifies a document (Institution only).
   */
  async verify(documentId: string, institutionId: string, isVerified: boolean, rejectionReason?: string): Promise<Verification> {
    const response = await customFetch(`${API_URL}/documents/${documentId}/verify/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        institution_id: institutionId,
        is_verified: isVerified,
        rejection_reason: rejectionReason,
      }),
    });
    if (!response.ok) throw await response.json();
    return response.json();
  }
};
