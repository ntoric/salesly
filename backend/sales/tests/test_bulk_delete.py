from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import Seller as User
from sales.models import Sale

class BulkDeleteTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test@example.com', password='password', role='MERCHANT')
        self.client.force_authenticate(user=self.user)
        self.sale1 = Sale.objects.create(seller=self.user, volume=10, rate=1.5, currency='USD', sale_currency='EUR')
        self.sale2 = Sale.objects.create(seller=self.user, volume=20, rate=1.5, currency='USD', sale_currency='EUR')
        self.sale3 = Sale.objects.create(seller=self.user, volume=30, rate=1.5, currency='USD', sale_currency='EUR')
        self.url = reverse('v1:sale-bulk-delete')

    def test_bulk_delete_success(self):
        data = {'ids': [self.sale1.id, self.sale2.id]}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Sale.objects.count(), 1)
        self.assertTrue(Sale.objects.filter(id=self.sale3.id).exists())

    def test_bulk_delete_invalid_ids(self):
        data = {'ids': 'invalid'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_bulk_delete_empty_ids(self):
        data = {'ids': []}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_bulk_delete_not_found(self):
        data = {'ids': [9999, 8888]}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
