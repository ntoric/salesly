from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import Seller as User
from core.models import Address

class AddressBulkDeleteTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test@example.com', password='testpassword')
        self.client.force_authenticate(user=self.user)
        self.url = reverse('v1:address-bulk-delete')

        self.address1 = Address.objects.create(
            address_line_1='123 Main St',
            city='Test City',
            country='Test Country',
            postal_code='12345'
        )
        self.address2 = Address.objects.create(
            address_line_1='456 Elm St',
            city='Other City',
            country='Other Country',
            postal_code='67890'
        )

    def test_bulk_delete_addresses(self):
        data = {'ids': [self.address1.id, self.address2.id]}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Address.objects.count(), 0)

    def test_bulk_delete_invalid_ids(self):
        data = {'ids': [999, 1000]}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_bulk_delete_no_ids(self):
        data = {'ids': []}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
