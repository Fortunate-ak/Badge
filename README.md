# **Badge: Universal Recruitment System (Technical Briefing)**

This document provides a concise, high-level technical overview of the Badge system. It focuses on the core functional logic, entity relationships, and the processing pipeline, particularly for the document verification and explainable matching features.

## **🚀 TL;DR (Quick Summary)**

Badge is a unified, consent-driven platform for verifying applicant credentials and matching them to diverse opportunities (Jobs, Programs, Scholarships).

*   **Trust Layer:** Documents are verified by **Institutions** (not just applicants) and have internal categories. Access is granted per category, per request, via explicit user consent.
*   **AI Core:** A **Small Language Model (SLM)** (e.g., Gemma3 1B on Ollama) powers the **Matching Engine**.
*   **Explainability:** Matching results are persistent ("Match Records") and store a **"Debate"** (reasons for/against the match) and a **Winning Percentage** to ensure transparency and prevent recalculation.

## **1\. System Architecture & Tech Stack**

| Component           | Technology          | Function                                                                                              |
| :------------------ | :------------------ | :---------------------------------------------------------------------------------------------------- |
| **Frontend (PWA)**  | ReactJS, TailwindCSS| Mobile-first, offline-ready UI for Applicant Wallet, and Institution Dashboards.                        |
| **Backend**         | Django, PostgreSQL  | Core APIs for Authentication, Profiles, Attestations, Opportunity Management, and Audit Logs.           |
| **Data/AI Processing** | Docker, Ollama (SLM)| Containerized service for OCR, rule-based filtering, and running the Gemma3 1B-based Matching Engine. |
| **Storage**         | Secure File Storage (Docker Volume) | Encrypted, versioned storage for all uploaded documents.                                       |

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

## **3\. The Explainable Matching Engine (SLM Core)**

The matching engine is the intelligence layer, moving beyond simple keyword matching to provide a clear rationale.

### **3.1 Matching Pipeline Steps**

1.  **Input Gathering:** Collect the Opportunity's requirements (filters, tags) and the Applicant's data (profile, `extracted_text` from verified documents).
2.  **Rule-Based Filtering:** Apply hard filters (e.g., required qualifications, minimum GPA) to eliminate non-viable candidates quickly.
3.  **SLM Generation (The Debate):** The SLM (Gemma3 1B) generates two key text outputs:
    *   **Winning Argument:** Why the applicant is a strong fit.
    *   **Losing Argument:** Why the applicant might **not** be the best fit.
4.  **Percentage Calculation:** A scoring function calculates a **Match Percentage**.
5.  **Persistence:** The complete result is stored in a dedicated `MatchRecord` model, keyed by (`applicant_id`, `opportunity_id`).

### **3.2 MatchRecord Persistence**

A dedicated model ensures speed and transparency.

| Field              | Type            | Purpose                                                                                                     |
| :----------------- | :-------------- | :---------------------------------------------------------------------------------------------------------- |
| `match_record_id` (PK) | UUID            | Unique identifier.                                                                                          |
| `applicant_id` (FK)  | UUID            | The applicant.                                                                                              |
| `opportunity_id` (FK)| UUID            | The opportunity being matched against.                                                                      |
| `is_stale`         | Boolean         | Flag for recalculation if the applicant's profile or opportunity filters change.                              |
| `match_percentage` | Decimal         | The overall score based on the debate outcome.                                                              |
| `winning_argument` | TEXT            | The SLM's generated rationale *for* the match.                                                              |
| `losing_argument`  | TEXT            | The SLM's generated rationale *against* the match.                                                          |
| `matched_tags`     | JSONB (Array)   | List of tags/requirements met.                                                                              |
| `created_at`       | TIMESTAMP       | Timestamp of when the calculation was performed.                                                            |

## **4\. Database Structure Insight (Conceptual)**

The database schema has been designed for flexibility and scalability.

### **A. Users & Institutions (`accounts.User`, `institutions.Institution`)**

*   **Unified User Model:** The custom `User` model (`accounts.User`) is generic and serves all human users. It uses **email for authentication** and includes optional profile fields like `bio`, `profile_image`, `social_links`, and `dob`. Two boolean flags determine a user's primary role:
    *   `is_applicant`: Identifies users who can apply for opportunities.
    *   `is_institution_staff`: Identifies users who can act on behalf of an institution.
*   **Consolidated Institution Model:** The `Employer` and `University` models have been merged into a single, flexible `Institution` model (`institutions.Institution`). A `category` field (e.g., 'Company', 'University') distinguishes the organization's type.
*   **Staff Relationship:** The relationship between a `User` and an `Institution` is managed by a through model, `InstitutionStaff`. This model grants a user administrative (`is_admin`) access to manage an institution's profile and opportunities.

### **B. Documents & Verification (`documents` app)**

*   **Document Categorization:** A `DocumentCategory` table maps system-defined categories (ACADEMIC, IDENTITY, etc.) to a `Document`.
*   **Verification:** The `Verification` table records an institution's attestation of a document's validity or its rejection.

### **C. Application & Matching (`opportunities` app)**

*   **Flexible Opportunities:** The `Opportunity` table uses the `opportunity_type` field (Job, Program, etc.) for filtering and presentation.
*   **Application Status:** The `Application` table tracks the applicant's status for an opportunity.
*   **Matching as a Service:** `MatchRecord` is a calculated model. The application flow checks for an existing `MatchRecord` for a given (`applicant_id`, `opportunity_id`). If none exists or `is_stale` is true, it triggers the SLM generation pipeline.

## **5\. Security & Deployment Notes**

*   **Document Access:** Document retrieval APIs must first check the `ConsentLog` table for an active, unrevoked consent grant for the requested document categories.
*   **SLM Deployment:** Utilizing **Ollama** allows for local SLM execution during development and scalable, containerized deployment in production.
*   **Data Integrity:** The `file_hash` in the `Document` model is mandatory to ensure file integrity.

**Action Items for Development:** Prioritize implementing the API endpoints for the `Institution` and `User` profile management and the `MatchRecord` generation pipeline.


-- back!!!