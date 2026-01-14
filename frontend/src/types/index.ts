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
  profile_image?: string; // URL or path
  social_links?: Record<string, string>;
  dob?: string;
  is_applicant: boolean;
  is_institution_staff: boolean;
  institution_details?: Institution[]; // Nested institution details (read-only) of which they are admin
  interests?: string[]; // List of user interests
}

/**
 * Represents the relationship between a User and an Institution.
 */
export interface InstitutionStaff {
    id: string; // ID of the staff record
    user: string; // User ID
    user_details?: User; // Nested user details (read-only)
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
  created_at: string;
  updated_at: string;
  verified?: boolean;
  description?: string;
  email?: string;
  phone?: string;
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
  title: string;
  content?: string;
  type: string;
  applicant: string; // User ID
  categories: string[]; // Array of DocumentCategory IDs
  file_hash: string;
  storage_path: string;
  uploaded_by: string; // User ID
  created_at: string;
  updated_at: string;
  file?: File; // Virtual field for upload
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
  requester_institution: string | Institution; // Institution ID or object
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
  content: string;
  opportunity_type: 'Job' | 'Program' | 'Scholarship' | 'Admission';
  posted_by_institution: string; // Institution ID
  institution_details?: Institution; // Nested institution details (read-only)
  tags: string[];
  start_date?: string;
  expiry_date?: string;
  match_score?: number;
  created_at: string;
  updated_at: string;
  applicant_count?: number;
  has_applied?: boolean;
}

export interface Applicant {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image:string;
  social_links:string;
  dob:string;
  interests:string;
}

export interface OpportunityForApplication {
  id: string;
  title: string;
  opportunity_type: string;
}

/**
 * Represents a user's application for an opportunity.
 */
export interface Application {
  id: string;
  applicant: Applicant;
  opportunity: OpportunityForApplication;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationDetail extends Application {
  opportunity: Opportunity;
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
