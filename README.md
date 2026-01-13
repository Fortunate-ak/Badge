# **Badge: Universal Recruitment System (Technical Briefing)**

This document provides a concise, high-level technical overview of the Badge system. It focuses on the core functional logic, entity relationships, and the processing pipeline.

## **🚀 TL;DR (Quick Summary)**

Badge is a unified, consent-driven platform for verifying applicant credentials and matching them to diverse opportunities (Jobs, Programs, Scholarships).

*   **Trust Layer:** Documents are verified by **Institutions** (not just applicants) and have internal categories. Access is granted per category, per request, via explicit user consent.
*   **Tag-Based Matching:** Uses **Jaccard Similarity** to match applicants to opportunities based on shared tags/interests.
*   **Explainability:** Matching results are transparent, based on the overlap between an applicant's interests and an opportunity's tags.

## **1\. System Architecture & Tech Stack**

| Component           | Technology          | Function                                                                                              |
| :------------------ | :------------------ | :---------------------------------------------------------------------------------------------------- |
| **Frontend (PWA)**  | ReactJS, TailwindCSS| Mobile-first, offline-ready UI for Applicant Wallet, and Institution Dashboards.                        |
| **Backend**         | Django, PostgreSQL  | Core APIs for Authentication, Profiles, Attestations, Opportunity Management, and Audit Logs.           |
| **Deployment**      | Docker              | Containerized service for backend, frontend, and database.                                            |
| **Storage**         | Docker Volume       | Secure storage for all uploaded documents.                                                            |

## **2\. Core Functional Logic & API Flow**

### **2.1 Document Vault & Verification Logic**

The document system is built on multi-party upload and consent.

| Feature                 | Logic and Key Points                                                                                                                                                                                                   |
| :---------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Multi-Party Upload**  | Documents can be uploaded by the **Applicant** OR by an **Institution Staff** member on the applicant's behalf.                                                                                                         |
| **Ownership Attestation** | Institutions must **Accept** or **Reject** association with a document. An Institution's rejection must be recorded as part of the Verification audit trail.                                                             |
| **Document Categorization** | All documents must be assigned one or more **System-Defined Categories** (e.g., ACADEMIC, EMPLOYMENT, IDENTITY). This is the granular unit for consent.                                                                 |
| **Consent Model (Pull-Based)** | When an **Institution** requests access: 1\. They specify the **Document Categories** they require. 2\. The Applicant receives a notification. 3\. The Applicant explicitly **Accepts** or **Rejects** the request (logged in `ConsentLogs`). |

### **2.2 Opportunity Management**

The `Opportunity` model is highly flexible to accommodate various non-job postings.

| Opportunity Type | Description                                                    |
| :--------------- | :------------------------------------------------------------- |
| **Job**          | Standard employment offer posted by an **Institution** of type 'Company'. |
| **Program/Course** | Admissions for a university program or vocational course.      |
| **Scholarship**  | Financial aid opportunity, often posted by an **Institution**. |
| **Admission**    | General university application route.                          |

## **3\. The Recommendation Engine (Tag-Based)**

The matching engine provides a simple, robust way to connect applicants with opportunities.

### **3.1 Matching Logic**

1.  **Input Gathering:**
    *   **Applicant Interests:** A list of tags/interests defined by the user (e.g., "Python", "Data Science").
    *   **Opportunity Tags:** A list of tags defined by the institution for the opportunity (e.g., "Python", "Remote").
2.  **Jaccard Similarity:** The system calculates a similarity score based on the intersection over union of the two tag sets.
    *   `Score = |Interests ∩ Tags| / |Interests ∪ Tags|`
3.  **Sorting:** Opportunities are recommended in the following order:
    1.  **Validity:** Non-expired opportunities appear first.
    2.  **Relevance:** Opportunities with higher match scores appear higher.

### **3.2 Persistence**

Match scores are calculated dynamically. `MatchRecord` model is available for storing historical match data if needed.

## **4\. Database Structure Insight (Conceptual)**

The database schema has been designed for flexibility and scalability.

### **A. Users & Institutions (`accounts.User`, `institutions.Institution`)**

*   **Unified User Model:** The custom `User` model (`accounts.User`) is generic and serves all human users. It uses **email for authentication**. Two boolean flags determine a user's primary role:
    *   `is_applicant`: Identifies users who can apply for opportunities.
    *   `is_institution_staff`: Identifies users who can act on behalf of an institution.
*   **Interests:** Users have an `interests` field (JSON List) to store their skills and preferences.
*   **Consolidated Institution Model:** The `Institution` model serves both educational and corporate entities.
*   **Staff Relationship:** The `InstitutionStaff` model links users to institutions with specific permissions.

### **B. Documents & Verification (`documents` app)**

*   **Document Categorization:** A `DocumentCategory` table maps system-defined categories (ACADEMIC, IDENTITY, etc.) to a `Document`.
*   **Verification:** The `Verification` table records an institution's attestation of a document's validity.

### **C. Application & Matching (`opportunities` app)**

*   **Flexible Opportunities:** The `Opportunity` table uses the `opportunity_type` field (Job, Program, etc.) for filtering.
*   **Tags:** Opportunities have a `tags` field (JSON List) for matching against user interests.
*   **Application Status:** The `Application` table tracks the applicant's status for an opportunity.

## **5\. Security & Deployment Notes**

*   **Document Access:** Document retrieval APIs must first check the `ConsentLog` table for an active, unrevoked consent grant.
*   **Data Integrity:** The `file_hash` in the `Document` model is mandatory to ensure file integrity.

**Action Items for Development:** Focus on populating user interests and opportunity tags to maximize the effectiveness of the recommendation engine.
