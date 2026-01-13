from django.test import TestCase
from django.utils import timezone
from .models import Opportunity, MatchRecord
from accounts.models import User
from .recommendation import RecommendationEngine
import datetime

class RecommendationEngineTestCase(TestCase):
    def setUp(self):
        # Create users
        self.user_no_interests = User.objects.create_user(email='no@example.com', password='password', is_applicant=True, interests=[])
        self.user_python = User.objects.create_user(email='python@example.com', password='password', is_applicant=True, interests=['Python', 'Django'])
        self.user_data = User.objects.create_user(email='data@example.com', password='password', is_applicant=True, interests=['Python', 'Data Science', 'Machine Learning'])

        # Create institutions (for FK)
        from institutions.models import Institution
        self.institution = Institution.objects.create(name="Tech Corp", category="Company")

        # Create opportunities
        self.opp_python = Opportunity.objects.create(
            title="Python Dev",
            description="Dev",
            content="Content",
            opportunity_type="Job",
            posted_by_institution=self.institution,
            tags=['Python', 'Django', 'Rest Framework'],
            expiry_date=timezone.now().date() + datetime.timedelta(days=10)
        )

        self.opp_java = Opportunity.objects.create(
            title="Java Dev",
            description="Dev",
            content="Content",
            opportunity_type="Job",
            posted_by_institution=self.institution,
            tags=['Java', 'Spring'],
            expiry_date=timezone.now().date() + datetime.timedelta(days=10)
        )

        self.opp_expired = Opportunity.objects.create(
            title="Expired Python Dev",
            description="Dev",
            content="Content",
            opportunity_type="Job",
            posted_by_institution=self.institution,
            tags=['Python', 'Django'],
            expiry_date=timezone.now().date() - datetime.timedelta(days=1)
        )

    def test_jaccard_similarity(self):
        engine = RecommendationEngine()
        score = engine.calculate_jaccard_similarity(['a', 'b'], ['b', 'c'])
        self.assertAlmostEqual(score, 1/3) # Intersection {b}, Union {a,b,c} -> 1/3

        score = engine.calculate_jaccard_similarity(['a', 'b'], ['a', 'b'])
        self.assertAlmostEqual(score, 1.0)

        score = engine.calculate_jaccard_similarity(['a'], ['b'])
        self.assertEqual(score, 0.0)

    def test_match_score(self):
        engine = RecommendationEngine()
        score = engine.calculate_match_score(self.user_python, self.opp_python)
        # User: {Python, Django}, Opp: {Python, Django, Rest Framework}
        # Intersection: 2, Union: 3 -> 0.666
        self.assertAlmostEqual(score, 2/3)

        score = engine.calculate_match_score(self.user_python, self.opp_java)
        self.assertEqual(score, 0.0)

    def test_sort_opportunities(self):
        engine = RecommendationEngine()
        opps = [self.opp_python, self.opp_java, self.opp_expired]
        sorted_opps = engine.sort_opportunities(self.user_python, opps)

        # Expected order:
        # 1. Non-expired, High Score (opp_python)
        # 2. Non-expired, Low Score (opp_java)
        # 3. Expired (opp_expired) - regardless of score (even if it matches well)

        self.assertEqual(sorted_opps[0], self.opp_python)
        self.assertEqual(sorted_opps[1], self.opp_java)
        self.assertEqual(sorted_opps[2], self.opp_expired)

        # Verify scores attached
        self.assertAlmostEqual(sorted_opps[0].match_score, 2/3)

    def test_generate_match_record(self):
        engine = RecommendationEngine()
        match_record = engine.generate_match_record(self.user_python, self.opp_python)

        self.assertIsInstance(match_record, MatchRecord)
        self.assertEqual(match_record.applicant, self.user_python)
        self.assertEqual(match_record.opportunity, self.opp_python)

        # Verify arguments
        self.assertIn("Python", match_record.winning_argument)
        self.assertIn("Django", match_record.winning_argument)
        self.assertIn("Rest Framework", match_record.losing_argument.title()) # It's case sensitive in text usually, but my implementation lowercases for logic. The text output keeps user/opp case?
        # Actually my implementation lowercases everything in comparison.
        # The stored tags in models.py are case sensitive lists?
        # My implementation `generate_match_record` converts to lower for matching.
        # And creates strings using the lowercase versions if I use `matched_tags`.
        # Let's check logic: `matched_tags = list(user_interests.intersection(opp_tags))` -> these are lowercase.
        # So the text will contain lowercase tags.
        self.assertIn("rest framework", match_record.losing_argument)

        self.assertAlmostEqual(float(match_record.match_percentage), 66.67, places=1)
