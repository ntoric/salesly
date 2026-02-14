from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import (
    SellerSerializer,
    UserListSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    UserUpdateSerializer,
    UserStatusSerializer,
    UserPasswordResetSerializer,
    PermissionSerializer,
    CustomTokenObtainPairSerializer,
)
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.db import transaction
from .permissions import IsSuperAdmin, IsTenantAdmin, IsMerchant, IsSuperAdminOrTenantAdmin
from drf_spectacular.utils import extend_schema
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@extend_schema(tags=['Permission Management'])
class PermissionViewSet(viewsets.ModelViewSet):
    """
    API for managing permissions (Super Admin Only).
    """
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]


@extend_schema(tags=['User Management'])
class ManageUserView(generics.RetrieveUpdateAPIView):
    """
    Manage the authenticated user.
    """
    serializer_class = SellerSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


@extend_schema(tags=['User Management'])
class UserViewSet(viewsets.ModelViewSet):
    """
    API for managing users (Super Admin & Tenant Admin).
    """
    queryset = User.objects.all()
    # default permission, will be overridden by get_permissions
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            # Tenant Admin can list their merchants
            return [permissions.IsAuthenticated(), IsSuperAdminOrTenantAdmin()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy', 'block', 'unblock']:
            # Tenant Admin can create merchants
            return [permissions.IsAuthenticated(), IsSuperAdminOrTenantAdmin()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        elif self.action == 'block' or self.action == 'unblock':
             return UserStatusSerializer
        elif self.action == 'reset_password':
            return UserPasswordResetSerializer
        return UserListSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'SUPER_ADMIN':
            return User.objects.all().order_by('-date_joined')
        elif user.role == 'TENANT_ADMIN':
            # Tenant Admin sees their merchants
            return User.objects.filter(parent_admin=user).order_by('-date_joined')
        return User.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        role = serializer.validated_data.get('role', 'MERCHANT')
        
        # Security check: Tenant Admin can ONLY create Merchants
        if user.role == 'TENANT_ADMIN':
            if role != 'MERCHANT':
                role = 'MERCHANT' # Force merchant
            # Auto-assign parent
            serializer.save(role=role, parent_admin=user)
        else:
            # Super Admin can create any role, no parent needed (or assign one if needed, but not implementing that UI yet)
            serializer.save()

    @action(detail=True, methods=['post'])
    def block(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'status': 'User blocked'})

    @action(detail=True, methods=['post'])
    def unblock(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'status': 'User unblocked'})

    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'status': 'Password reset successful'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsSuperAdmin])
    def update_permissions(self, request, pk=None):
        """
        Update user permissions. Expects a list of permission IDs.
        """
        user = self.get_object()
        permission_ids = request.data.get('permissions', [])
        
        # Clear existing and add new
        user.user_permissions.set(permission_ids)
        return Response({'status': 'Permissions updated'})

    @extend_schema(request=None, responses={204: None})
    @action(detail=False, methods=['post'], url_path='bulk-delete')
    def bulk_delete(self, request):
        """
        Bulk delete users by IDs.
        Prevent deleting self.
        """
        ids = request.data.get('ids', [])
        if not ids or not isinstance(ids, list):
            return Response({'detail': 'Invalid or empty list of IDs provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # Prevent self-deletion
        if request.user.id in ids:
             return Response({'detail': 'You cannot delete yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        queryset = self.get_queryset()
        users_to_delete = queryset.filter(id__in=ids)
        deleted_count = users_to_delete.count()

        if deleted_count == 0:
            return Response({'detail': 'No matching users found to delete.'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            users_to_delete.delete()

        return Response({'detail': f'{deleted_count} users deleted successfully.'}, status=status.HTTP_200_OK)
