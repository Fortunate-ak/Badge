# Badge: Key Features & Workflows

## User Roles

Badge defines two primary user roles, each with distinct capabilities:

### 1. Applicant
-   **Goal**: Find opportunities and verify credentials.
-   **Key Actions**:
    -   **Profile Management**: Update bio, interests, social links.
    -   **Document Management**: Upload transcripts, IDs, certifications.
    -   **Opportunity Discovery**: Search and apply to jobs/programs.
    -   **Consent**: Grant or revoke institution access to specific document categories.
    -   **Notifications**: Receive push alerts for application updates.

### 2. Institution Staff
-   **Goal**: Verify applicants and post opportunities.
-   **Key Actions**:
    -   **Verification**: Review and verify documents uploaded by applicants.
    -   **Opportunity Management**: Create and manage job/program listings.
    -   **Application Review**: View applications, AI-generated match records, and update status.
    -   **Staff Management**: Add/remove other staff members (Admin only).

## Core Workflows

### Document Verification System

This is a central feature ensuring trust.
1.  **Upload**: An applicant uploads a file (e.g., "University Transcript").
2.  **Assignment**: The document is assigned a category (e.g., "Academic Record").
3.  **Request**: The applicant requests verification from a specific Institution (e.g., "University of Springfield").
4.  **Review**:
    -   Institution staff sees the request in their dashboard.
    -   They verify the document against their records.
    -   **Outcome**: The document status updates to `Verified` or `Rejected` (with reason).

### Opportunity Application

1.  **Discovery**: Applicant finds a "Software Engineer" role.
2.  **Application**: They submit an application, optionally including a motivational letter.
3.  **AI Analysis**:
    -   The backend triggers the `RecommendationEngine`.
    -   An LLM analyzes the applicant's profile vs. the job description.
    -   A `MatchRecord` is created with arguments (Pros/Cons).
4.  **Review**:
    -   Institution staff reviews the application and the AI analysis.
    -   They can update the status: `Submitted` -> `In Review` -> `Accepted`.
5.  **Notification**: The applicant receives a push notification about the status change.

### Consent & Privacy (Document Access)

Institutions cannot view an applicant's documents by default. Access is **category-based** and **explicitly granted**.

1.  **Request**: An institution (e.g., a potential employer) requests access to an applicant's "Academic Records".
2.  **Grant**: The applicant approves this request via the `ConsentLog` system.
3.  **Access**: The institution can now view documents in that specific category for that applicant.
4.  **Revocation**: The applicant can revoke this access at any time.

## Push Notifications

The system supports web push notifications to keep users engaged.
-   **Backend**: Uses `pywebpush` to send messages.
-   **Frontend**: Service Worker listens for push events and displays system notifications.
-   **Triggers**:
    -   Application status updates.
    -   Document verification requests/outcomes.
