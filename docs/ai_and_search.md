# Badge: AI & Recommendation Engine

## Overview

Badge implements a **Hybrid Recommendation Engine** that combines traditional rule-based filtering with modern Large Language Model (LLM) capabilities to provide "Explainable AI" matching for recruitment.

## Core Strategy

The system uses a two-step approach:
1.  **Tag-Based Filtering & Scoring (Jaccard Similarity)**: Quickly filters and ranks opportunities based on keyword overlap.
2.  **Generative AI Analysis (Ollama/LLM)**: Produces detailed, human-readable arguments for *why* a specific applicant matches an opportunity.

## 1. Tag-Based Matching (Applicant View)

When an applicant views the "Recommended Opportunities" list, the system performs a lightweight calculation to sort results.

### Algorithm: Jaccard Similarity
The core metric is the **Jaccard Index**, defined as the size of the intersection divided by the size of the union of two sets.

$$ J(A, B) = \frac{|A \cap B|}{|A \cup B|} $$

-   **Set A (Applicant)**: The list of interests from the user's profile (`user.interests`).
-   **Set B (Opportunity)**: The list of tags from the opportunity posting (`opportunity.tags`).

### Sorting Logic
Opportunities are sorted primarily by:
1.  **validity**: Non-expired opportunities appear first.
2.  **Match Score**: Descending order of Jaccard Similarity.

This approach ensures that even without deep semantic understanding, users see relevant results based on explicit keywords.

## 2. Explainable AI Matching (Institution View)

For Institution Staff reviewing applications, the system provides a deeper analysis called a **Match Record**.

### Trigger
A `MatchRecord` is generated asynchronously when an applicant submits an application (`POST /api/applications/`).

### The Process
1.  **Data Preparation**: The system extracts the applicant's bio/interests and the opportunity's title/description/tags.
2.  **LLM Prompting**: It constructs a prompt for an LLM hosted via **Ollama**.
    -   **Model**: Typically `hf.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF` (or similar configured model).
    -   **Goal**: "Analyze the match... Provide a winning argument and a losing argument."
3.  **Generation**: The LLM returns a structured JSON response containing:
    -   `match_percentage`: An AI-estimated fit score (0-100).
    -   **`winning_argument`**: A paragraph highlighting strengths (e.g., "The candidate's experience in Python directly aligns with the requirement...").
    -   **`losing_argument`**: A paragraph highlighting gaps (e.g., "The candidate lacks the specific certification required...").
    -   `matched_tags`: Tags identified as relevant.
4.  **Persistence**: This data is stored in the `MatchRecord` model, linked to the Application.

### Fallback Mechanism
If the Ollama service is unavailable or fails, the system falls back to a rule-based simulation:
-   It calculates the Jaccard score.
-   It constructs "synthetic" arguments based on the intersection/difference of tags (e.g., "Matches 3 out of 5 tags: Python, Django, React").

## 3. Vector Embeddings (Status)

While the project infrastructure includes `pgvector` (via the `pgvector/pgvector:pg16` Docker image) and references to embedding generation (e.g., `word2vec`, `sentence-transformers`) exist in documentation/notebooks, **the current production implementation relies on the Jaccard/LLM hybrid approach described above.**

Future iterations may enable vector-based semantic search by:
1.  Embedding `Opportunity.description` and `User.bio`.
2.  Storing these vectors in `pgvector` columns.
3.  Using Cosine Similarity for retrieval.

## Technical Components

-   **`RecommendationEngine`**: Singleton class in `backend/opportunities/recommendation.py`.
-   **`ollama`**: Python client library for communicating with the local Ollama instance.
-   **`MatchRecord`**: Model storing the analysis results.
