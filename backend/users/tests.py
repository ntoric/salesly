from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class AdminSellerApiTests(APITestCase):
    """Test the admin seller management API."""

    def setUp(self):
        self.client = self.client_class()
        self.admin_user = get_user_model().objects.create_superuser(
            email='admin@example.com',
            password='password123'
        )
        self.user = get_user_model().objects.create_user(
            email='user@example.com',
            password='password123',
            first_name='Test',
            last_name='User'
        )
        self.list_url = reverse('v1:admin-seller-list')

    def test_list_sellers_admin(self):
        """Test listing sellers as an admin."""
        self.client.force_authenticate(user=self.admin_user)
        res = self.client.get(self.list_url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 2) 

    def test_list_sellers_non_admin(self):
        """Test listing sellers as a non-admin is forbidden."""
        self.client.force_authenticate(user=self.user)
        res = self.client.get(self.list_url)

        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_seller_admin(self):
        """Test creating a seller as an admin."""
        self.client.force_authenticate(user=self.admin_user)
        payload = {
            'email': 'seller@example.com',
            'password': 'password123',
            'first_name': 'Seller',
            'last_name': 'User',
        }
        res = self.client.post(self.list_url, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(get_user_model().objects.filter(email=payload['email']).exists())
        user = get_user_model().objects.get(email=payload['email'])
        self.assertTrue(user.check_password(payload['password']))

    def test_activate_user(self):
        """Test activating a user."""
        self.user.is_active = False
        self.user.save()
        
        url = reverse('v1:admin-seller-activate', args=[self.user.id])
        self.client.force_authenticate(user=self.admin_user)
        res = self.client.post(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)

    def test_deactivate_user(self):
        """Test deactivating a user."""
        url = reverse('v1:admin-seller-deactivate', args=[self.user.id])
        self.client.force_authenticate(user=self.admin_user)
        res = self.client.post(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)

    def test_reset_password(self):
        """Test resetting a user's password."""
        url = reverse('v1:admin-seller-reset-password', args=[self.user.id])
        self.client.force_authenticate(user=self.admin_user)
        payload = {'new_password': 'newpassword123'}
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(payload['new_password']))
