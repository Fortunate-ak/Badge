# **Badge: Universal Recruitment System (Technical Briefing)**

This document provides a concise, high-level technical overview of the Badge system. It focuses on the core functional logic, entity relationships, and the processing pipeline, particularly for the document verification and explainable matching features.

## **🚀 TL;DR (Quick Summary)**

Badge is a unified, consent-driven platform for verifying student credentials and matching them to diverse opportunities (Jobs, Programs, Scholarships).

* **Trust Layer:** Documents are verified by **Institutions** (not just students) and have internal categories. Access is granted per category, per request, via explicit user consent.  
* **AI Core:** A **Small Language Model (SLM)** (e.g., Gemma3 1B on Ollama) powers the **Matching Engine**.  
* **Explainability:** Matching results are persistent ("Match Records") and store a **"Debate"** (reasons for/against the match) and a **Winning Percentage** to ensure transparency and prevent recalculation.

## **1\. System Architecture & Tech Stack**

| Component | Technology | Function |
| :---- | :---- | :---- |
| **Frontend (PWA)** | ReactJS, TailwindCSS | Mobile-first, offline-ready UI for Student Wallet, Employer/Institution Dashboards. |
| **Backend** | Django, PostgreSQL | Core APIs for Authentication, Profiles, Attestations, Opportunity Management, and Audit Logs. |
| **Data/AI Processing** | Docker, Ollama (SLM) | Containerized service for OCR, rule-based filtering, and running the Gemma3 1B-based Matching Engine. |
| **Storage** | Secure File Storage (Docker Volume) | Encrypted, versioned storage for all uploaded documents. |

## **2\. Core Functional Logic & API Flow**

### **2.1 Document Vault & Verification Logic**

The document system is built on multi-party upload and consent.

| Feature | Logic and Key Points |
| :---- | :---- |
| **Multi-Party Upload** | Documents can be uploaded by the **Student** OR by an **Institution Admin** on the student's behalf. |
| **Ownership Attestation** | Institutions must **Accept** or **Reject** association with a document. An Institution's rejection must be recorded as part of the Verification audit trail. |
| **Document Categorization** | All documents must be assigned one or more **System-Defined Categories** (e.g., ACADEMIC, EMPLOYMENT, IDENTITY). This is the granular unit for consent. |
| **Consent Model (Pull-Based)** | When an **Institution** or **Employer** requests access: 1\. They specify the **Document Categories** they require. 2\. The Student receives a notification with the required categories. 3\. Student explicitly **Accepts** or **Rejects** the request (logged in ConsentLogs). |

### **2.2 Opportunity Management**

The Opportunity model must be highly flexible to accommodate various non-job postings.

| Opportunity Type | Description |
| :---- | :---- |
| **Job** | Standard employment offer posted by an **Employer**. |
| **Program/Course** | Admissions for a university program or vocational course. |
| **Scholarship** | Financial aid opportunity, often posted by an **Institution**. |
| **Admission** | General university application route. |

## **3\. The Explainable Matching Engine (SLM Core)**

The matching engine is the intelligence layer, moving beyond simple keyword matching to provide a clear rationale.

### **3.1 Matching Pipeline Steps**

1. **Input Gathering:** Collect the Opportunity's requirements (filters, tags) and the Student's data (profile, extracted\_text from verified documents).  
2. **Rule-Based Filtering:** Apply hard filters (e.g., required qualifications, minimum GPA) to eliminate non-viable candidates quickly.  
3. **SLM Generation (The Debate):** The SLM (Gemma3 1B) uses the remaining data to generate two key text outputs:  
   * **Winning Argument:** A short paragraph explaining why the student is a strong fit (meets tags/requirements).  
   * **Losing Argument:** A short paragraph explaining why the student might **not** be the best fit (missing requirements, competitive gaps).  
4. **Percentage Calculation:** A scoring function (potentially derived from the SLM's token probabilities or a secondary model's interpretation of the debate text) calculates a **Match Percentage**.  
5. **Persistence:** The complete result is stored in a dedicated MatchRecord model, keyed by (student\_id, opportunity\_id).

### **3.2 MatchRecord Persistence**

A dedicated model is required to ensure speed and transparency.

| Field | Type | Purpose |
| :---- | :---- | :---- |
| match\_record\_id (PK) | UUID | Unique identifier. |
| student\_id (FK) | UUID | The applicant. |
| opportunity\_id (FK) | UUID | The opportunity being matched against. |
| is\_stale | Boolean | Flag to indicate if the record needs recalculation (e.g., if the student profile or opportunity filters change). |
| match\_percentage | Decimal | The overall score based on the debate outcome. |
| winning\_argument | TEXT | The SLM's generated rationale *for* the match. |
| losing\_argument | TEXT | The SLM's generated rationale *against* the match. |
| matched\_tags | JSONB (Array) | List of tags/requirements met. |
| created\_at | TIMESTAMP | Timestamp of when the calculation was performed. |

## **4\. Database Structure Insight (Conceptual)**

The existing schema is robust, but the following areas require careful implementation and relationship mapping based on the revised logic:

### **A. Users & Institutions (users, students, universities, employers)**

* **Relationship:** university\_admins and employer\_admins link back to users and their respective organization models (universities or employers).  
* **Key Insight:** The universities table needs to represent any **verifying Institution**, not strictly universities (e.g., vocational schools, certification bodies). Consider renaming to institutions or making the university\_type field more generic.

### **B. Documents & Verification (documents, verifications, NEW: document\_categories)**

* **Document Categorization:** A new intermediary table, document\_categories, is needed to map multiple system-defined categories (ACADEMIC, IDENTITY, etc.) to a single document (documents).  
  * document\_id (FK) $\\to$ document\_category\_id (FK)  
* **Verification:** The verifications table is critical. It must record both **Document Verification** (by an Admin) and **Institution Rejection** (if an admin denies association with a document uploaded by a student).

### **C. Application & Matching (opportunities, applications, NEW: match\_records)**

* **Flexibility of Opportunities:** The opportunities table must use the type field (Job, Program, Scholarship, Admission) extensively for filtering and frontend presentation.  
* **Application Status:** The applications table tracks the student's current status for an opportunity.  
* **Matching as a Service:** match\_records is a calculated model. The application flow should **CHECK** for an existing MatchRecord for a given (student\_id, opportunity\_id). If none exists or is\_stale is true, trigger the **SLM Generation** pipeline before returning the result.

## **5\. Security & Deployment Notes**

* **Document Access:** Never expose the storage\_path or document retrieval APIs without first checking the consent\_logs table for an active, unrevoked consent grant specific to the requested document categories.  
* **SLM Deployment:** Utilizing **Ollama** ensures the ability to run the SLM locally during development and potentially scale it efficiently using dedicated containerized resources in production, minimizing API costs and latency associated with remote large models.  
* **Data Integrity:** The use of file\_hash in the documents table is mandatory to ensure file integrity and detect tampering.

**Action Items for Development:** Prioritize the implementation of the flexible document\_categories system and the **MatchRecord** model to define the communication contract between the core backend and the AI processing service.