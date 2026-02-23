# Badge: Frontend Architecture

## Overview

The Badge frontend is a **Progressive Web App (PWA)** built with **React**, **TypeScript**, and **Tailwind CSS v4**. It uses **Vite** as the build tool for performance.

## Core Structure

```
frontend/src/
├── context/       # Global State (Auth, Toast, Search)
├── pages/         # Page Components and Routing
├── services/      # API Integration
├── ui/            # Reusable Components (Forms, Layouts)
├── utils/         # Helpers (Auth, Fetch)
├── App.tsx        # Main Router
├── main.tsx       # Entry Point
└── index.css      # Global Styles & Tailwind Config
```

## Key Components

### 1. Routing (`App.tsx`)
-   **Philosophy**: Functional Route Definitions.
-   **Implementation**: Routes are defined as functions that return `Route` components (e.g., `ApplicantRoutes()`, `InstitutionRoutes()`).
-   **Structure**:
    -   `/`: Landing Page / Dashboard.
    -   `/applicant/*`: Applicant-specific flows (Profile, Documents, Opportunities).
    -   `/institution/*`: Institution-specific flows (Manage Staff, Verify Documents).
    -   `/auth/*`: Login/Register.

### 2. Services (`src/services/`)
-   **Pattern**: Dedicated service files for each domain entity.
-   **Examples**:
    -   `auth.service.ts`: Login, Register, Logout.
    -   `applicant.service.ts`: Profile management.
    -   `document.service.ts`: Document uploads and list retrieval.
    -   `opportunity.service.ts`: Fetching and filtering opportunities.
-   **Logic**:
    -   Uses a custom `fetch` wrapper (`utils/index.ts`) to handle CSRF tokens and headers automatically.

### 3. State Management (`src/context/`)
-   **`AuthContext`**: Manages the current user's session state (`user`, `isAuthenticated`, `login`, `logout`).
-   **`ToastContext`**: Provides a global notification system (`toast.success`, `toast.error`) and confirmation dialogs (`toast.confirm`).
-   **`SearchContext`**: Handles global search state across the application.

### 4. UI Library (`src/ui/`)
-   **Design System**: Custom components built with Tailwind utility classes.
-   **Forms**: `useForm` hook for managing form state, validation, and submission.
    -   **Constraint**: Use `tw-input`, `tw-select`, `tw-checkbox` classes.
-   **Modals**: `ui/layouts/modal.tsx` for all dialogs.
-   **Icons**: Google Material Symbols (`mso` class).

## Styling

-   **Framework**: Tailwind CSS v4.
-   **Customization**: Defined in `index.css` via CSS variables (`--color-primary`, `--color-bg`, etc.).
-   **Typography**: Uses `@tailwindcss/typography` plugin for rich text content.

## Authentication Flow

1.  **Login**: User submits credentials to `/api/auth/login/`.
2.  **Session**: Backend sets a `sessionid` cookie.
3.  **CSRF**:
    -   Frontend calls `/api/auth/csrf/` on load to set the `csrftoken` cookie.
    -   All subsequent `POST`/`PUT`/`DELETE` requests include the `X-CSRFToken` header read from the cookie.
4.  **Persistence**: `AuthContext` checks `/api/users/me/` on app initialization to restore the session.

## Testing & Verification

-   **Environment**: Due to complex Docker networking, local development servers are often bypassed for verification.
-   **Tools**: Playwright scripts (when applicable) mock API responses for frontend testing.
-   **Linting**: strict TypeScript configuration ensures type safety matching backend models.
