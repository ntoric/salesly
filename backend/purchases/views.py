from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Purchase
from .serializers import PurchaseSerializer
from users.permissions import IsMerchant, IsSuperAdminOrTenantAdmin # Assuming IsMerchant is correct perms or allow tenant admin
from drf_spectacular.utils import extend_schema

@extend_schema(tags=['Purchases'])
class PurchaseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Purchases (Trading).
    Tenant Admin or Merchant can create/edit/delete.
    """
    serializer_class = PurchaseSerializer
    permission_classes = [permissions.IsAuthenticated] # Custom perms can be added

    def get_queryset(self):
        user = self.request.user
        if user.role == 'SUPER_ADMIN':
            return Purchase.objects.all().order_by('-date')
        elif user.role == 'TENANT_ADMIN':
            # See all purchases from their merchants
            return Purchase.objects.filter(seller__parent_admin=user).order_by('-date') | Purchase.objects.filter(seller=user).order_by('-date')
        elif user.role == 'MERCHANT':
             return Purchase.objects.filter(seller=user).order_by('-date')
        return Purchase.objects.none()

    @extend_schema(request=None, responses={204: None})
    @action(detail=False, methods=['post'], url_path='bulk-delete')
    def bulk_delete(self, request):
        """
        Bulk delete purchases by IDs.
        """
        ids = request.data.get('ids', [])
        if not ids or not isinstance(ids, list):
            return Response({'detail': 'Invalid or empty list of IDs provided.'}, status=status.HTTP_400_BAD_REQUEST)

        queryset = self.get_queryset()
        purchases_to_delete = queryset.filter(id__in=ids)
        deleted_count = purchases_to_delete.count()

        if deleted_count == 0:
            return Response({'detail': 'No matching purchases found to delete.'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            purchases_to_delete.delete()

        return Response({'detail': f'{deleted_count} purchases deleted successfully.'}, status=status.HTTP_200_OK)
