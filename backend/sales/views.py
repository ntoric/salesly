from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Sale
from .serializers import SaleSerializer
from users.permissions import IsSuperAdminOrTenantAdmin
from drf_spectacular.utils import extend_schema

@extend_schema(tags=['Sales'])
class SaleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Sales (Trading).
    """
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'SUPER_ADMIN':
             return Sale.objects.all().order_by('-created_at')
        elif user.role == 'TENANT_ADMIN':
            return Sale.objects.filter(seller__parent_admin=user).order_by('-created_at') | Sale.objects.filter(seller=user).order_by('-created_at')
        elif user.role == 'MERCHANT':
             return Sale.objects.filter(seller=user).order_by('-created_at')
        return Sale.objects.none()

    @extend_schema(request=None, responses={204: None})
    @action(detail=False, methods=['post'], url_path='bulk-delete')
    def bulk_delete(self, request):
        """
        Bulk delete sales by IDs.
        """
        ids = request.data.get('ids', [])
        if not ids or not isinstance(ids, list):
            return Response({'detail': 'Invalid or empty list of IDs provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get queryset based on permissions (so user can only delete what they can see)
        queryset = self.get_queryset()
        
        # Filter to get valid sales to delete
        sales_to_delete = queryset.filter(id__in=ids)
        deleted_count = sales_to_delete.count()

        if deleted_count == 0:
            return Response({'detail': 'No matching sales found to delete.'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            sales_to_delete.delete()

        return Response({'detail': f'{deleted_count} sales deleted successfully.'}, status=status.HTTP_200_OK)
