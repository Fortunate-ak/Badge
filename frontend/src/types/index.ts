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
  bio?: string;
  profile_image?: string;
  social_links?: Record<string, string>;
  dob?: string;
  is_applicant: boolean;
  is_institution_staff: boolean;
}

/**
 * Represents the relationship between a User and an Institution.
 */
export interface InstitutionStaff {
    user: string; // User ID
    institution: string; // Institution ID
    is_admin: boolean;
    date_joined: string;
}

/**
 * Represents an Institution (e.g., University, Company).
 */
export interface Institution {
  id: string;
  name: string;
  category: 'University' | 'Company' | 'Vocational School' | 'Certification Body' | 'Other';
  website?: string;
  address?: string;
  profile_image?: string;
  admins: InstitutionStaff[];
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
  applicant: string; // User ID
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
  applicant: string; // User ID
  requester_institution: string | Institution; // Institution ID
  document_categories: string[]; // Array of DocumentCategory IDs
  is_granted: boolean;
  created_at: string;
  revoked_at?: string;
}

/**
 * Represents an opportunity (Job, Program, etc.).
 */
export interface Opportunity {
  id:string;
  title: string;
  description: string;
  opportunity_type: 'Job' | 'Program' | 'Scholarship' | 'Admission';
  posted_by_institution: string; // Institution ID
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
  applicant: string; // User ID
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
  applicant: string; // User ID
  opportunity: string; // Opportunity ID
  is_stale: boolean;
  match_percentage: number;
  winning_argument: string;
  losing_argument: string;
  matched_tags: string[];
  created_at: string;
}
