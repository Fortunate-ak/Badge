// frontend/src/types/index.ts

/**
 * Represents the custom User model.
 */
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
}

/**
 * Represents an Institution (e.g., University, Vocational School).
 */
export interface Institution {
  id: string;
  name: string;
  institution_type: string;
  website?: string;
  address?: string;
}

/**
 * Represents an Employer organization.
 */
export interface Employer {
  id: string;
  name: string;
  website?: string;
  industry?: string;
}

/**
 * Represents a system-defined document category.
 */
export interface DocumentCategory {
  id: string;
  name: string;
  description?: string;
}

/**
 * Represents a document uploaded by a user.
 */
export interface Document {
  id: string;
  student: string; // User ID
  categories: string[]; // Array of DocumentCategory IDs
  file_hash: string;
  storage_path: string;
  uploaded_by: string; // User ID
  created_at: string;
  updated_at: string;
}

/**
 * Represents the verification status of a document.
 */
export interface Verification {
  id: string;
  document: string; // Document ID
  institution: string; // Institution ID
  is_verified: boolean;
  rejection_reason?: string;
  verified_by?: string; // User ID
  created_at: string;
}

/**
 * Logs user consent for sharing documents.
 */
export interface ConsentLog {
  id: string;
  student: string; // User ID
  requester_institution?: string; // Institution ID
  requester_employer?: string; // Employer ID
  document_categories: string[]; // Array of DocumentCategory IDs
  is_granted: boolean;
  created_at: string;
  revoked_at?: string;
}

/**
 * Represents an opportunity (Job, Program, etc.).
 */
export interface Opportunity {
  id: string;
  title: string;
  description: string;
  opportunity_type: 'Job' | 'Program' | 'Scholarship' | 'Admission';
  posted_by_institution?: string; // Institution ID
  posted_by_employer?: string; // Employer ID
  filters: Record<string, any>;
  tags: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Represents a user's application for an opportunity.
 */
export interface Application {
  id: string;
  student: string; // User ID
  opportunity: string; // Opportunity ID
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Represents the AI-generated match record.
 */
export interface MatchRecord {
  id: string;
  student: string; // User ID
  opportunity: string; // Opportunity ID
  is_stale: boolean;
  match_percentage: number;
  winning_argument: string;
  losing_argument: string;
  matched_tags: string[];
  created_at: string;
}
