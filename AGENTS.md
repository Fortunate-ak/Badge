# AGENTS.md

## 1. Project Overview
**Badge** is a universal recruitment and asset management system designed to match applicants with opportunities based on verified credentials and explicit consent. The project is containerized and relies on a robust interaction between a Django backend and a React/TypeScript frontend.

## 2. Tech Stack & Environment
- **Infrastructure**: Docker Compose (Nginx, Django, PostgreSQL/pgvector, React/Vite).
- **Backend**: Python Django (DRF).
- **Frontend**: React, TypeScript, TailwindCSS v4, React Router.
- **Design**: Custom Tailwind tokens and utilities.

### ⚠️ Environment & Testing Constraints
1.  **Complexity**: This project runs on a complex Docker Compose setup with specific environment variables. **Running the full system for minor verifications is discouraged** as it is resource-intensive and error-prone for an agent environment.
2.  **Strategy**:
    - **Prefer Static Analysis**: Rely on deep code reading and type checking.
    - **Partial Testing**: If you must test, verify specific units (e.g., a utility function) without spinning up the entire stack unless absolutely necessary.
    - **Do Not Break Configs**: Avoid modifying `docker-compose.yml`, `nginx/`, or environment files unless that is the specific task.

## 3. Frontend Guidelines

### 🎨 Design & Styling
**Source of Truth**: `frontend/src/index.css`
- **Strict Adherence**: You **must** follow the design tokens and utility classes defined in `index.css`.
- **Key Utilities**:
    - `tw-input`, `tw-select`, `tw-checkbox`, `tw-radio`, `tw-file` for forms.
    - `tw-button`, `tw-button-secondary`, `tw-button-ghost` for actions.
    - `tw-card`, `tw-card-accent` for containers.
    - `tw-label`, `tw-help` for text hierarchy.
- **Colors**: Use CSS variables (`var(--color-primary)`, `var(--color-bg)`, etc.) via Tailwind classes (e.g., `bg-primary`, `text-muted`).

### 💠 Icons
**Standard**: Google Material Symbols Rounded.
- **Usage**: Use the `mso` utility class.
- **Example**: `<span className="mso">home</span>`
- **Do not** import other icon libraries unless explicitly requested.

### 🛣️ Routing
**Style**: Functional Route Definitions.
- Routes are defined as functions that return a tree of `<Route>` components (e.g., `ApplicantRoutes()` in `frontend/src/pages/applicant/index.tsx`).
- These functions are invoked directly within the main `Routes` component in `App.tsx`.
- **Do not** refactor this into a configuration object array unless asked. Maintain the existing "personal style".

### 🍞 Toast & Feedback (Custom System)
**Component**: `frontend/src/context/ToastContext.tsx`
- **Hook**: `const toast = useToast()`
- **Capabilities**: The system supports standard alerts and advanced patterns.
    - **Standard**: `toast.success('Saved!')`, `toast.error('Failed')`.
    - **Loading/Update**:
      ```typescript
      const id = toast.loading('Uploading...');
      // ... perform async work ...
      toast.update(id, { type: 'success', message: 'Done!' });
      ```
    - **Confirmation (Promise-based)**:
      ```typescript
      const confirmed = await toast.confirm('Are you sure?', {
         description: 'This cannot be undone.',
         confirmText: 'Yes, Delete'
      });
      if (confirmed) { /* proceed */ }
      ```

### 📐 Type Safety
- **Sync Requirement**: The frontend types in `frontend/src/types/index.ts` **must** strictly mirror the backend Django models and Serializers.
- **Action**: If you modify a backend model, or maybe you see a mismatch in the frontend, you **must** immediately update the corresponding TypeScript interface.

## 4. Backend Guidelines

### 🧩 Modularity & Quality
- **Code Style**: Keep code highly modular. Avoid monolithic views or massive functions.
- **Comments**: Code must be properly commented, explaining *why* complex logic exists, not just *what* it does.
- **API**: Ensure changes to Serializers are reflected in the frontend `types`.

## 5. Documentation
- **Updates**: Any major changes to the system architecture, new modules, or environment requirements **must** be documented in `README.md`.
- **Adaptability**: This `AGENTS.md` is designed to be high-level. Avoid adding transient, task-specific details here. Keep it focused on architectural standards and hard constraints.
