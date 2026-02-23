# Badge: System Setup & Configuration

## Prerequisites

Before running the project, ensure you have the following installed:
*   **Docker**: Version 20.10.0 or higher.
*   **Docker Compose**: Version 1.29.0 or higher (or `docker compose` v2).
*   **Git**: For cloning the repository.
*   **Node.js**: Version 20.10.0 or higher (for local development only).
*   **Python**: Version 3.13.0 or higher (for local development only).

## Quick Start (Docker)

The recommended way to run Badge is via Docker Compose. This orchestrates the Frontend, Backend, Database, and Nginx proxy in a unified network.

1.  **Clone the Repository**
    ```bash
    git clone <repository_url>
    cd badge
    ```

2.  **Environment Configuration**
    Create a `.env` file in the root directory based on the provided example. Minimal configuration required:
    ```bash
    # Database
    POSTGRES_DB=badge_db
    POSTGRES_USER=badge_user
    POSTGRES_PASSWORD=secure_password
    POSTGRES_HOST=db
    POSTGRES_PORT=5432

    # Django
    DJANGO_SECRET_KEY=your_secret_key_here
    DJANGO_DEBUG=True
    ALLOWED_HOSTS=*

    # Nginx
    NGINX_PORT=80
    ```

3.  **Build and Run**
    Execute the following command to build the images and start the containers:
    ```bash
    docker-compose up --build
    ```
    -   The build process may take several minutes, especially for the frontend dependencies and Python packages.
    -   Wait for the "db system is ready to accept connections" message.

4.  **Access the Application**
    -   **Frontend**: `http://localhost` (proxied via Nginx)
    -   **Backend API**: `http://localhost/api/`
    -   **Admin Panel**: `http://localhost/admin/`

## Local Development (Without Docker)

If you need to run services individually for debugging or development:

### Backend Setup

1.  **Create Virtual Environment**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

2.  **Install Dependencies**
    ```bash
    pip install -r backend/requirements.txt
    ```

3.  **Run Migrations**
    Ensure your local Postgres instance is running and updated in `.env`.
    ```bash
    python backend/manage.py migrate
    ```

4.  **Start Development Server**
    ```bash
    python backend/manage.py runserver 0.0.0.0:8000
    ```

### Frontend Setup

1.  **Install Dependencies**
    Navigate to the `frontend` directory:
    ```bash
    cd frontend
    npm install
    ```

2.  **Start Dev Server**
    ```bash
    npm run dev
    ```
    -   Access at `http://localhost:5173`.
    -   Note: Without Nginx, you may need to configure CORS settings in `backend/settings.py` or proxy API requests in `vite.config.ts`.

## Docker Services

The `docker-compose.yml` defines the following services:

| Service | Image | Internal Port | Description |
| :--- | :--- | :--- | :--- |
| `db` | `pgvector/pgvector:pg16` | 5432 | PostgreSQL database with vector extension. |
| `backend` | Custom (`backend/Dockerfile`) | 8000 | Django API server. |
| `frontend` | Custom (`frontend/Dockerfile`) | 5173 | React/Vite development server. |
| `nginx` | `nginx:latest` | 80 | Reverse proxy routing traffic to frontend/backend. |
| `ollama` | `ollama/ollama:latest` | 11434 | LLM service for AI recommendations. |

## Troubleshooting

-   **Database Connection Failed**: Ensure the `db` service is healthy. Check logs with `docker-compose logs db`.
-   **Frontend Not Updating**: Use `docker-compose up --build frontend` to force a rebuild if dependencies change.
-   **Permission Errors**: On Linux, you might need `sudo` for Docker commands. Ensure your user is in the `docker` group.
