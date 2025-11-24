import os
import numpy as np
import word2vec
from django.conf import settings
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

# Path to the word2vec binary model
# User mentioned they will update the path, so we default to 'model.bin' in the project root or similar.
WORD2VEC_MODEL_PATH = getattr(settings, 'WORD2VEC_MODEL_PATH', 'model.bin')

class RecommendationEngine:
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RecommendationEngine, cls).__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        """
        Loads the word2vec model from the binary file.
        """
        if self._model is None:
            if os.path.exists(WORD2VEC_MODEL_PATH):
                try:
                    logger.info(f"Loading word2vec model from {WORD2VEC_MODEL_PATH}...")
                    self._model = word2vec.load(WORD2VEC_MODEL_PATH)
                    logger.info("word2vec model loaded successfully.")
                except Exception as e:
                    logger.error(f"Failed to load word2vec model: {e}")
                    self._model = None
            else:
                logger.warning(f"word2vec model file not found at {WORD2VEC_MODEL_PATH}. Recommendation engine will use fallback scoring.")
                self._model = None

    def get_vector(self, text):
        """
        Get the vector representation for a text (word or phrase).
        Handles multi-word phrases by checking if they exist in vocab,
        otherwise averages the vectors of individual words.
        """
        if self._model is None:
            return None

        # Normalize text: lowercase, replace spaces with underscores (common in word2vec phrases)
        text = text.lower().strip()
        text_underscore = text.replace(' ', '_')

        if text_underscore in self._model.vocab:
            return self._model[text_underscore]

        # If the phrase isn't in vocab, split and average
        words = text.split()
        vectors = []
        for word in words:
            if word in self._model.vocab:
                vectors.append(self._model[word])

        if vectors:
            return np.mean(vectors, axis=0)

        return None

    def calculate_similarity(self, vec1, vec2):
        """
        Calculates cosine similarity between two vectors.
        """
        if vec1 is None or vec2 is None:
            return 0.0

        # Cosine similarity: (A . B) / (||A|| * ||B||)
        dot_product = np.dot(vec1, vec2)
        norm_a = np.linalg.norm(vec1)
        norm_b = np.linalg.norm(vec2)

        if norm_a == 0 or norm_b == 0:
            return 0.0

        return dot_product / (norm_a * norm_b)

    def calculate_match_score(self, applicant, opportunity):
        """
        Calculates the match score between an applicant and an opportunity.
        Score = Similarity(Applicant_Interests, Opportunity_Positive_Tags) - Similarity(Applicant_Interests, Opportunity_Negative_Tags)
        """
        if self._model is None:
            # Fallback if model is not loaded: Simple exact tag matching could be used here,
            # but for now we return 0 to indicate no AI score.
            # Alternatively, we could implement a simple string overlap count.
            return 0.0

        user_interests = applicant.interests or []
        positive_tags = opportunity.positive_tags or []
        negative_tags = opportunity.negative_tags or []

        if not user_interests:
            return 0.0

        # Create User Vector (Mean of all interest vectors)
        user_vectors = [self.get_vector(interest) for interest in user_interests]
        user_vectors = [v for v in user_vectors if v is not None]

        if not user_vectors:
            return 0.0

        user_profile_vector = np.mean(user_vectors, axis=0)

        # Calculate Positive Match
        pos_score = 0.0
        if positive_tags:
            pos_vectors = [self.get_vector(tag) for tag in positive_tags]
            pos_vectors = [v for v in pos_vectors if v is not None]
            if pos_vectors:
                # We calculate similarity between the user profile vector and the *aggregate* positive vector
                # Or we could take the max similarity for each tag.
                # Let's use aggregate vector similarity for the prompt's "vectors of the interests ... and the opportunity itself"
                opp_pos_vector = np.mean(pos_vectors, axis=0)
                pos_score = self.calculate_similarity(user_profile_vector, opp_pos_vector)

        # Calculate Negative Match
        neg_score = 0.0
        if negative_tags:
            neg_vectors = [self.get_vector(tag) for tag in negative_tags]
            neg_vectors = [v for v in neg_vectors if v is not None]
            if neg_vectors:
                opp_neg_vector = np.mean(neg_vectors, axis=0)
                neg_score = self.calculate_similarity(user_profile_vector, opp_neg_vector)

        # Final Score: Reward Positive, Penalize Negative
        # Cosine similarity is between -1 and 1.
        # Logic: Score = Pos - Neg.
        # Example: Pos=0.8, Neg=0.1 => 0.7. Pos=0.5, Neg=0.8 => -0.3.
        return pos_score - neg_score

    def sort_opportunities(self, applicant, opportunities):
        """
        Sorts a list (queryset) of opportunities for the applicant.
        Prioritizes:
        1. Non-expired opportunities (expiry_date >= now or null)
        2. Match score (Highest first)
        """
        now = timezone.now().date()

        scored_opportunities = []
        for opp in opportunities:
            score = self.calculate_match_score(applicant, opp)

            # Determine expiry status
            # Non-expired (future or null) is higher priority than expired (past)
            is_expired = False
            if opp.expiry_date and opp.expiry_date < now:
                is_expired = True

            # We want non-expired to come first. So we can use a tuple for sorting: (not is_expired, score)
            # Python sorts tuples element by element.
            # False (0) < True (1). So (False, ...) comes before (True, ...).
            # Wait, we want non-expired FIRST. So `is_expired` should be False.
            # So sort key: (is_expired, -score)
            # is_expired: False (0) comes before True (1).
            # -score: Lower (more negative) comes first, which corresponds to Higher score.

            scored_opportunities.append({
                'opportunity': opp,
                'score': score,
                'is_expired': is_expired
            })

        # Sort
        # Key 1: is_expired (False=0 first, True=1 last)
        # Key 2: score (Descending) -> usage of reverse=True or negative score
        # Let's use `sorted` with key.

        sorted_data = sorted(
            scored_opportunities,
            key=lambda x: (x['is_expired'], -x['score'])
        )

        # Extract opportunities and attach score for display if needed
        sorted_opps = []
        for item in sorted_data:
            opp = item['opportunity']
            # We can attach the score to the object temporarily if we want to serialize it
            opp.match_score = item['score']
            sorted_opps.append(opp)

        return sorted_opps
