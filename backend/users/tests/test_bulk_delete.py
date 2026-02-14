from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import Seller as User

class UserBulkDeleteTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            email='admin@example.com', 
            password='testpassword', 
            role='SUPER_ADMIN', 
            is_staff=True
        )
        self.client.force_authenticate(user=self.admin_user)
        self.url = reverse('v1:user-bulk-delete')

        self.user1 = User.objects.create_user(email='user1@example.com', password='password', role='MERCHANT')
        self.user2 = User.objects.create_user(email='user2@example.com', password='password', role='MERCHANT')

    def test_bulk_delete_users(self):
        data = {'ids': [self.user1.id, self.user2.id]}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.filter(id__in=[self.user1.id, self.user2.id]).count(), 0)

    def test_bulk_delete_self(self):
        data = {'ids': [self.admin_user.id, self.user1.id]}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("You cannot delete yourself", str(response.data))
        # Ensure no users were deleted
        self.assertTrue(User.objects.filter(id=self.admin_user.id).exists())
        self.assertTrue(User.objects.filter(id=self.user1.id).exists())

    def test_bulk_delete_invalid_ids(self):
        data = {'ids': [999, 1000]}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_bulk_delete_no_ids(self):
        data = {'ids': []}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
