# Badge: Authentication & Security

## Overview

The Badge system implements a dual authentication strategy to support both interactive frontend users and programmatic API access.

## 1. Session-Based Authentication (Frontend)

The primary method for user interaction is via standard Django sessions.

### Mechanism
-   **Login**: The frontend sends a `POST` request to `/api/auth/login/` with `email` and `password`.
-   **Session Creation**: Upon success, Django creates a session and sets a `sessionid` cookie in the response.
-   **Subsequent Requests**: The browser automatically includes the `sessionid` cookie in all future requests to the same domain.
-   **Logout**: A `POST` request to `/api/auth/logout/` invalidates the session on the server.

### CSRF Protection
Cross-Site Request Forgery (CSRF) protection is enforced for all state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`).

1.  **Token Retrieval**: The frontend application makes a `GET` request to `/api/auth/csrf/` immediately upon loading.
2.  **Cookie Setting**: This endpoint sets a `csrftoken` cookie.
3.  **Header Inclusion**: For every mutation request, the frontend reads this cookie and includes it as a custom header:
    ```http
    X-CSRFToken: <token_value>
    ```
    -   This is handled automatically by the custom `fetch` wrapper in `frontend/src/utils/index.ts`.

## 2. API Key Authentication (Integrations)

To allow external systems (e.g., University ERPs, Company HR platforms) to interact with Badge programmatically, we use API Keys.

### Mechanism
-   **Key Generation**: API Keys are generated via the Django Admin panel or through a dedicated management interface for institution admins.
-   **Storage**: Keys are stored securely in the `integrations.APIKey` model.
-   **Usage**: The external client includes the key in the `X-API-KEY` header of their request.
    ```http
    GET /api/opportunities/ HTTP/1.1
    Host: api.badge.com
    X-API-KEY: <your_api_key>
    ```

### Implementation Details
-   **Middleware**: The `APIKeyAuthentication` class in `backend/integrations/authentication.py` intercepts the request.
-   **Validation**: It checks if the provided key exists and is `is_active=True`.
-   **Rate Limiting / Stats**: Usage is tracked (e.g., `last_used_at`, `request_count`) directly on the key model.
-   **User Context**: Requests authenticated via API Key are associated with the **Institution** linked to the key, but `request.user` is set to `AnonymousUser`.

## 3. Permissions

The system uses Django REST Framework's permission classes to control access.

-   **`IsAuthenticated`**: Default for most endpoints. Requires a valid session or API Key.
-   **Role-Based Access**:
    -   **`is_applicant`**: Grants access to applicant-specific features (e.g., Profile, My Applications).
    -   **`is_institution_staff`**: Grants access to institution management features (e.g., Post Opportunity, Verify Document).
    -   **`is_admin`** (Institution Level): Grants permission to manage other staff members within an institution.

## Security Best Practices

-   **HTTPS**: In production, all traffic must be encrypted via SSL/TLS (handled by Nginx).
-   **Cookie Flags**: `HttpOnly` and `Secure` flags are set on session cookies in production environments.
-   **Data Validation**: Strict input validation using DRF Serializers prevents injection attacks.
