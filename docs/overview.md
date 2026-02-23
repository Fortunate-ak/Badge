# Badge: Universal Recruitment System - Overview

## Introduction

**Badge** is a universal recruitment and asset management system designed to match applicants with opportunities (Jobs, Programs, Scholarships, Admissions) based on verified credentials and explicit consent. The system provides a unified platform for applicants to manage their profiles and documents, and for institutions to post opportunities and verify applicant credentials.

## System Architecture

The Badge system is built using a modern, containerized architecture orchestrated with **Docker Compose**. It consists of the following key components:

### 1. Frontend (React/Vite)
-   **Technology**: React 18, TypeScript, Tailwind CSS v4.
-   **Framework**: Vite for fast development and building.
-   **Routing**: React Router (functional route definitions).
-   **State Management**: React Context (`AuthContext`, `ToastContext`).
-   **Role**: Serves the user interface for both Applicants and Institution Staff as a Progressive Web App (PWA).

### 2. Backend (Django REST Framework)
-   **Technology**: Python 3.13, Django 5.x.
-   **Framework**: Django REST Framework (DRF) for API development.
-   **Role**: Handles business logic, data persistence, authentication, and external integrations.
-   **Key Apps**:
    -   `accounts`: User management and authentication.
    -   `documents`: Document upload, categorization, and verification.
    -   **`opportunities`**: Opportunity management, application tracking, and the **Recommendation Engine**.
    -   `institutions`: Organization profiles and staff management.
    -   `integrations`: External API access via API Keys.
    -   `api`: Centralized ViewSets and API routing.

### 3. Database (PostgreSQL)
-   **Technology**: PostgreSQL 16.
-   **Role**: Relational database for storing users, opportunities, applications, documents, and match records.
-   **Note**: The Docker configuration uses the `pgvector/pgvector:pg16` image, enabling potential future vector search capabilities, although the current implementation relies primarily on tag-based matching and LLM generation.

### 4. AI & Recommendation Service (Ollama)
-   **Technology**: Ollama.
-   **Model**: `hf.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF:latest` (or similar depending on configuration).
-   **Role**: Provides "Explainable AI" capabilities. It generates natural language arguments ("Winning Argument", "Losing Argument") for why an applicant matches an opportunity.
-   **Integration**: Accessed by the Django backend via the `ollama` Python client.

### 5. Reverse Proxy (Nginx)
-   **Technology**: Nginx.
-   **Role**: Routes incoming HTTP requests to the appropriate service (Frontend or Backend). Handles static file serving and potentially SSL termination in production.

## Directory Structure

```
/
├── backend/                # Django Backend
│   ├── accounts/           # User & Auth
│   ├── api/                # Main API ViewSets & URLs
│   ├── core/               # Utilities & Notifications
│   ├── documents/          # Document Logic
│   ├── institutions/       # Institution Logic
│   ├── integrations/       # API Key Logic
│   ├── opportunities/      # Matching & Applications
│   ├── Dockerfile          # Backend Docker definition
│   └── requirements.txt    # Python dependencies
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── context/        # React Contexts
│   │   ├── pages/          # Application Routes/Views
│   │   ├── services/       # API Client Services
│   │   ├── ui/             # Reusable UI Components
│   │   ├── utils/          # Helpers
│   │   ├── App.tsx         # Main Component & Routing
│   │   └── main.tsx        # Entry Point
│   ├── Dockerfile          # Frontend Docker definition
│   └── vite.config.ts      # Vite configuration
├── nginx/                  # Nginx Configuration
├── docs/                   # Project Documentation
├── docker-compose.yml      # Orchestration Config
└── README.md               # Quick Start Guide
```

## Key Technologies

-   **Backend**: Python, Django, DRF, Gunicorn, Psycopg2.
-   **Frontend**: React, TypeScript, Tailwind CSS, Lucide React (Icons), React Markdown.
-   **AI**: Ollama, `ollama-python`.
-   **Database**: PostgreSQL.
-   **Infrastructure**: Docker, Nginx.
