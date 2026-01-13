from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

class RecommendationEngine:
    """
    Tag-based recommendation engine using Jaccard Similarity.
    Replaces the previous Word2Vec/SLM based engine.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RecommendationEngine, cls).__new__(cls)
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
        # We treat interests as a list of strings.
        # Ensure they are strings and strip whitespace
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

            # Determine expiry status
            # Non-expired (future or null) is higher priority than expired (past)
            is_expired = False
            if opp.expiry_date and opp.expiry_date < now:
                is_expired = True

            scored_opportunities.append({
                'opportunity': opp,
                'score': score,
                'is_expired': is_expired
            })

        # Sort
        # Key 1: is_expired (False=0 first, True=1 last)
        # Key 2: score (Descending) -> usage of negative score
        sorted_data = sorted(
            scored_opportunities,
            key=lambda x: (x['is_expired'], -x['score'])
        )

        # Extract opportunities and attach score for display
        sorted_opps = []
        for item in sorted_data:
            opp = item['opportunity']
            opp.match_score = item['score']
            sorted_opps.append(opp)

        return sorted_opps
