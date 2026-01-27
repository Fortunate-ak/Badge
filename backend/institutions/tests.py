from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from institutions.models import Institution, InstitutionStaff

class InstitutionStaffTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email='admin@example.com', password='password', is_institution_staff=True)
        self.other_user = User.objects.create_user(email='other@example.com', password='password', is_institution_staff=True)
        self.institution = Institution.objects.create(name='Test Inst', category='Company')

        # User is admin
        self.staff_admin = InstitutionStaff.objects.create(user=self.user, institution=self.institution, is_admin=True)

        # Other user is staff
        self.staff_member = InstitutionStaff.objects.create(user=self.other_user, institution=self.institution, is_admin=False)

    def test_search_user_by_email(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/users/search/', {'email': 'other@example.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'other@example.com')

    def test_delete_staff_permission(self):
        self.client.force_authenticate(user=self.user)
        # Delete the other user
        url = f'/api/institution-staff/{self.staff_member.id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(InstitutionStaff.objects.filter(id=self.staff_member.id).exists())

    def test_delete_staff_permission_denied(self):
        # Create another user who is NOT admin
        non_admin = User.objects.create_user(email='nonadmin@example.com', password='password')
        InstitutionStaff.objects.create(user=non_admin, institution=self.institution, is_admin=False)

        self.client.force_authenticate(user=non_admin)

        # Try to delete the other user (staff_member)
        url = f'/api/institution-staff/{self.staff_member.id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_add_staff(self):
        self.client.force_authenticate(user=self.user)
        # Create a new user to add
        new_user = User.objects.create_user(email='newstaff@example.com', password='password')

        url = f'/api/institutions/{self.institution.id}/add-staff/'
        response = self.client.post(url, {'email': 'newstaff@example.com', 'is_admin': False})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(InstitutionStaff.objects.filter(institution=self.institution, user=new_user).exists())

    def test_add_staff_permission_denied(self):
        # Non-admin tries to add staff
        non_admin = User.objects.create_user(email='nonadmin2@example.com', password='password')
        InstitutionStaff.objects.create(user=non_admin, institution=self.institution, is_admin=False)
        self.client.force_authenticate(user=non_admin)

        new_user = User.objects.create_user(email='victim@example.com', password='password')

        url = f'/api/institutions/{self.institution.id}/add-staff/'
        response = self.client.post(url, {'email': 'victim@example.com'})

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
