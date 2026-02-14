from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Customer
from core.models import Address
from .serializers import CustomerSerializer
from core.serializers import AddressSerializer # Assuming it exists
from drf_spectacular.utils import extend_schema

@extend_schema(tags=['Customer Management'])
class CustomerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Customers.
    """
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'SUPER_ADMIN':
            return Customer.objects.all().order_by('-created_at')
        elif user.role == 'TENANT_ADMIN':
             return Customer.objects.filter(seller__parent_admin=user).order_by('-created_at') | Customer.objects.filter(seller=user).order_by('-created_at')
        elif user.role == 'MERCHANT':
             return Customer.objects.filter(seller=user).order_by('-created_at')
        return Customer.objects.none()

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

@extend_schema(tags=['Address Management'])
class AddressViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Addresses.
    """
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['address_line_1', 'city', 'state', 'postal_code', 'country', 'customer_name', 'mobile_number']

    @extend_schema(request=None, responses={204: None})
    @action(detail=False, methods=['post'], url_path='bulk-delete')
    def bulk_delete(self, request):
        """
        Bulk delete addresses by IDs.
        """
        ids = request.data.get('ids', [])
        if not ids or not isinstance(ids, list):
            return Response({'detail': 'Invalid or empty list of IDs provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # AddressViewSet currently uses queryset = Address.objects.all() directly in the class definition
        # We should respect permissions if any, but currently it just has IsAuthenticated
        # Ideally, we should filter by user if it was tenancy scoped, but for now we follow existing pattern
        # or better, use get_queryset if we want to add scoping later. 
        # Since currently it seems open to all authenticated (based on provided code), we filter on the full queryset.
        
        queryset = self.filter_queryset(self.get_queryset())
        addresses_to_delete = queryset.filter(id__in=ids)
        deleted_count = addresses_to_delete.count()

        if deleted_count == 0:
            return Response({'detail': 'No matching addresses found to delete.'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            addresses_to_delete.delete()

        return Response({'detail': f'{deleted_count} addresses deleted successfully.'}, status=status.HTTP_200_OK)
