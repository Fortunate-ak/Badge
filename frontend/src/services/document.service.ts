import { customFetch } from '../utils';
import { unwrapList } from './common';
import type { Document, DocumentCategory, Verification } from '../types';

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
    const data = await response.json();
    return unwrapList<Document>(data);
  },

  /**
   * Fetches all document categories.
   */
  async getCategories(): Promise<DocumentCategory[]> {
    const response = await customFetch(`${API_URL}/document-categories/`, {
      method: 'GET',
    });
    if (!response.ok) throw await response.json();
    const data = await response.json();
    return unwrapList<DocumentCategory>(data);
  },

  /**
   * Uploads a new document.
   * Note: Uses FormData for file upload.
   */
  async upload(file: File, title: string, categories: string[], applicantId?: string, type?: string, content?: string): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (type) formData.append('type', type);
    if (content) formData.append('content', content);
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
  },

  /**
  * Deletes a document.
  */
  async delete(id: string): Promise<void> {
    const response = await customFetch(`${API_URL}/documents/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw await response.json();
  },
};
