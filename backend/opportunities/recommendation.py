from django.utils import timezone
from .models import MatchRecord
import logging
import ollama
import json

logger = logging.getLogger(__name__)

class RecommendationEngine:
    """
    Hybrid Recommendation Engine.
    1. Applicant View: Tag-based Jaccard Similarity for sorting/recommendation.
    2. Institution View: Explainable AI (Ollama/Gemma) for detailed Match Records.
    """
    _instance = None
    _client = None
    _model_name = "gemma"

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RecommendationEngine, cls).__new__(cls)
            try:
                cls._client = ollama.Client(host='http://ollama:11434')
            except Exception as e:
                logger.warning(f"Failed to initialize Ollama client: {e}")
        return cls._instance

    def calculate_jaccard_similarity(self, set1, set2):
        """
        Calculates Jaccard Similarity between two sets.
        J(A, B) = |A ∩ B| / |A ∪ B|
        """
        if not set1 or not set2:
            return 0.0

        s1 = set(set1)
        s2 = set(set2)

        intersection = len(s1.intersection(s2))
        union = len(s1.union(s2))

        if union == 0:
            return 0.0

        return float(intersection) / union

    def calculate_match_score(self, applicant, opportunity):
        """
        Calculates the match score between an applicant and an opportunity
        based on the applicant's interests and the opportunity's tags.
        """
        user_interests = applicant.interests or []
        user_interests = [str(i).strip().lower() for i in user_interests if i]

        opp_tags = opportunity.tags or []
        opp_tags = [str(t).strip().lower() for t in opp_tags if t]

        score = self.calculate_jaccard_similarity(user_interests, opp_tags)
        return score

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

            is_expired = False
            if opp.expiry_date and opp.expiry_date < now:
                is_expired = True

            scored_opportunities.append({
                'opportunity': opp,
                'score': score,
                'is_expired': is_expired
            })

        sorted_data = sorted(
            scored_opportunities,
            key=lambda x: (x['is_expired'], -x['score'])
        )

        sorted_opps = []
        for item in sorted_data:
            opp = item['opportunity']
            opp.match_score = item['score']
            sorted_opps.append(opp)

        return sorted_opps

    def ensure_model(self):
        """
        Ensures the model is available in Ollama.
        """
        if not self._client:
            return False

        try:
            list_response = self._client.list()
            # ollama-python list returns a dictionary with 'models' key which is a list of dicts
            available_models = [m.get('name', '') for m in list_response.get('models', [])]

            # Simple check if model name is contained in any available model string (e.g., 'gemma:latest')
            if not any(self._model_name in m for m in available_models):
                logger.info(f"Model {self._model_name} not found. Pulling... This may take a while.")
                self._client.pull(self._model_name)
                logger.info(f"Model {self._model_name} pulled successfully.")
            return True
        except Exception as e:
            logger.error(f"Error checking/pulling model: {e}")
            return False

    def generate_match_record(self, applicant, opportunity):
        """
        Generates a persistent MatchRecord using Ollama.
        Falls back to rule-based simulation if Ollama fails.
        """
        try:
            if not self.ensure_model():
                raise Exception("Ollama model not available.")

            prompt = f"""
            You are an expert recruitment AI. Analyze the match between the applicant and the opportunity.

            Applicant Profile:
            - Bio: {applicant.bio or 'No bio provided.'}
            - Interests: {', '.join([str(i) for i in (applicant.interests or [])])}

            Opportunity:
            - Title: {opportunity.title}
            - Description: {opportunity.description}
            - Tags: {', '.join([str(t) for t in (opportunity.tags or [])])}

            Provide a JSON output with the following keys:
            - match_percentage: a number between 0 and 100.
            - winning_argument: A short paragraph explaining why they are a good fit.
            - losing_argument: A short paragraph explaining gaps or why they might not fit.
            - matched_tags: A list of strings (tags) from the opportunity that the applicant matches.
            """

            response = self._client.chat(model=self._model_name, messages=[
                {'role': 'user', 'content': prompt}
            ], format='json')

            content = response.get('message', {}).get('content', '{}')
            data = json.loads(content)

            match_percentage = float(data.get('match_percentage', 0))
            winning_arg = data.get('winning_argument', 'Analysis unavailable.')
            losing_arg = data.get('losing_argument', 'Analysis unavailable.')
            matched_tags = data.get('matched_tags', [])

            # Create/Update MatchRecord
            match_record, created = MatchRecord.objects.update_or_create(
                applicant=applicant,
                opportunity=opportunity,
                defaults={
                    'match_percentage': match_percentage,
                    'winning_argument': winning_arg,
                    'losing_argument': losing_arg,
                    'matched_tags': matched_tags,
                    'is_stale': False
                }
            )
            return match_record

        except Exception as e:
            logger.error(f"Ollama generation failed: {e}. Falling back to rule-based.")
            return self._generate_match_record_fallback(applicant, opportunity)

    def _generate_match_record_fallback(self, applicant, opportunity):
        """
        Generates a persistent MatchRecord with "Explainable AI" arguments.
        This simulates the SLM debate process by analyzing tags.
        """
        # 1. Input Gathering
        user_interests = set([str(i).strip().lower() for i in (applicant.interests or []) if i])
        opp_tags = set([str(t).strip().lower() for t in (opportunity.tags or []) if t])

        matched_tags = list(user_interests.intersection(opp_tags))
        missing_tags = list(opp_tags.difference(user_interests))

        # 2. Percentage Calculation (Reuse Jaccard for consistency, or weighted)
        score = self.calculate_match_score(applicant, opportunity)
        match_percentage = round(score * 100, 2)

        # 3. SLM Generation (The Debate) - Rule-based simulation
        # Winning Argument
        if matched_tags:
            winning_arg = f"The applicant possesses the following relevant interests that align with the opportunity: {', '.join(matched_tags)}."
            if len(matched_tags) == len(opp_tags):
                winning_arg += " They are a perfect match for the stated requirements."
            elif len(matched_tags) > len(opp_tags) / 2:
                winning_arg += " They cover a significant portion of the requirements."
        else:
            winning_arg = "The applicant shows potential but does not explicitly list interests matching the opportunity's tags. However, their profile may still hold relevance."

        # Losing Argument
        if missing_tags:
            losing_arg = f"The applicant is missing the following key tags associated with this opportunity: {', '.join(missing_tags)}."
        else:
            losing_arg = "The applicant appears to meet all listed tag requirements, though soft skills and other factors should be verified."

        # 4. Persistence
        match_record, created = MatchRecord.objects.update_or_create(
            applicant=applicant,
            opportunity=opportunity,
            defaults={
                'match_percentage': match_percentage,
                'winning_argument': winning_arg,
                'losing_argument': losing_arg,
                'matched_tags': matched_tags,
                'is_stale': False
            }
        )

        return match_record
