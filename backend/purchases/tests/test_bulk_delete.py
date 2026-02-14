from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import Seller as User
from purchases.models import Purchase
from datetime import date

class PurchaseBulkDeleteTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test@example.com', password='testpassword')
        self.client.force_authenticate(user=self.user)
        self.url = reverse('v1:purchase-bulk-delete')

        self.purchase1 = Purchase.objects.create(
            seller=self.user,
            vendor_name='Vendor 1',
            volume=100,
            currency='USD',
            rate=1.0,
            purchase_currency='USD',
            purchase_amount=100,
            date=date.today()
        )
        self.purchase2 = Purchase.objects.create(
            seller=self.user,
            vendor_name='Vendor 2',
            volume=200,
            currency='EUR',
            rate=0.9,
            purchase_currency='EUR',
            purchase_amount=180,
            date=date.today()
        )

    def test_bulk_delete_purchases(self):
        data = {'ids': [self.purchase1.id, self.purchase2.id]}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Purchase.objects.count(), 0)

    def test_bulk_delete_invalid_ids(self):
        data = {'ids': [999, 1000]} # IDs that don't exist
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_bulk_delete_no_ids(self):
        data = {'ids': []}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
