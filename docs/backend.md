# Badge: Backend Architecture

## Overview

The backend of Badge is a monolithic **Django** application built using **Django REST Framework (DRF)**. It exposes a JSON API consumed by the frontend and external integrations.

## Core Apps

The codebase is organized into several Django apps, each handling a specific domain:

### 1. `accounts`
-   **Purpose**: Manages user authentication and profiles.
-   **Key Models**:
    -   `User`: Custom user model extending `AbstractBaseUser`. Uses `email` as the unique identifier.
        -   Fields: `is_applicant`, `is_institution_staff`, `bio`, `interests` (JSON).
    -   `PushSubscription`: Stores web push subscription details for notifications.
-   **Features**:
    -   Email-based login/registration.
    -   Profile management (bio, avatar, social links).

### 2. `documents`
-   **Purpose**: Handles file uploads, categorization, and verification workflows.
-   **Key Models**:
    -   `Document`: Represents an uploaded file (S3/Local). Linked to an `applicant` and `uploaded_by` user.
    -   `DocumentCategory`: System-defined categories (e.g., "Academic Transcript", "ID").
    -   `Verification`: Links a `Document` to an `Institution` that has verified it.
    -   `ConsentLog`: Tracks applicant consent for institutions to view specific document categories.
-   **Logic**:
    -   Staff uploading a document for an applicant triggers automatic verification.

### 3. `institutions`
-   **Purpose**: Manages organizational entities and their staff.
-   **Key Models**:
    -   `Institution`: Represents a company or university.
    -   `InstitutionStaff`: Join table linking `User` to `Institution` with permissions (e.g., `is_admin`).
-   **Logic**:
    -   Staff members can post opportunities and verify documents on behalf of their institution.

### 4. `opportunities`
-   **Purpose**: Core matchmaking domain.
-   **Key Models**:
    -   `Opportunity`: A job, program, or scholarship posting. Contains `tags` and `expiry_date`.
    -   `Application`: Links an `applicant` to an `Opportunity`. Tracks status (Submitted -> Accepted/Rejected).
    -   **`MatchRecord`**: Stores the output of the AI analysis (Match %, Winning/Losing Arguments).
-   **Logic**:
    -   **RecommendationEngine**: A singleton class that performs Jaccard similarity and invokes Ollama for text generation.

### 5. `integrations`
-   **Purpose**: External API access.
-   **Key Models**:
    -   `APIKey`: Issued to institutions for programmatic access.
-   **Authentication**: Custom `APIKeyAuthentication` class checks the `X-API-KEY` header.

### 6. `api`
-   **Purpose**: Centralized API routing.
-   **Structure**:
    -   **`views.py`**: A monolithic file that imports models and serializers from all other apps and defines `ViewSet` classes (e.g., `UserViewSet`, `OpportunityViewSet`).
    -   **`urls.py`**: Registers all ViewSets with a default DRF Router.

## API Design Pattern

The project follows a **Centralized ViewSet** pattern:
-   Business logic is often contained within the `perform_create` or `action` methods of the ViewSets in `backend/api/views.py`.
-   **Serializers** are kept in their respective apps (`accounts/serializers.py`, etc.) to maintain separation of concern for data representation.
-   **Permissions**: `IsAuthenticated` is the default. Custom logic checks `is_institution_staff` or `is_applicant` flags.

## Key Workflows

### Opportunity Recommendation
1.  **Creation**: Institution posts an `Opportunity` with `tags`.
2.  **Listing**: Applicant requests `GET /api/opportunities/recommended/`.
3.  **Sorting**: The backend calculates Jaccard similarity between User `interests` and Opportunity `tags`.
4.  **Result**: Opportunities are returned sorted by validity (non-expired) and match score.

### Application Submission
1.  **Action**: User `POST`s to `/api/applications/`.
2.  **Processing**: A background thread is spawned to run `RecommendationEngine.generate_match_record`.
3.  **AI Analysis**:
    -   The engine prompts **Ollama** with the applicant profile and opportunity details.
    -   It generates a JSON response with arguments for/against the match.
4.  **Persistence**: A `MatchRecord` is saved.

### Document Verification
1.  **Upload**: Applicant uploads a document.
2.  **Request**: Applicant requests verification from an Institution.
3.  **Action**: Institution Staff views the request and clicks "Verify" or "Reject".
4.  **Record**: A `Verification` object is created.
