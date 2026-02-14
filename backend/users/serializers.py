from django.contrib.auth import get_user_model
from rest_framework import serializers

class SellerSerializer(serializers.ModelSerializer):
    """
    Serializer for the Custom Seller model.
    """
    class Meta:
        model = get_user_model()
        fields = ('id', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active', 'date_joined', 'parent_admin')
        read_only_fields = ('id', 'email', 'is_active', 'date_joined', 'role', 'parent_admin')


class UserListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing users with role details.
    """
    user_permissions = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = get_user_model()
        fields = ('id', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active', 'date_joined', 'last_login', 'parent_admin', 'user_permissions')

class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new user (admin/merchant).
    """
    password = serializers.CharField(write_only=True, min_length=5)

    class Meta:
        model = get_user_model()
        fields = ('id', 'email', 'password', 'first_name', 'last_name', 'phone', 'role', 'is_active')

    def create(self, validated_data):
        return get_user_model().objects.create_user(**validated_data)

class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user details.
    """
    class Meta:
        model = get_user_model()
        fields = ('id', 'first_name', 'last_name', 'phone')

from django.contrib.auth.models import Permission

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ('id', 'name', 'codename', 'content_type')

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add extra responses here
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role,
            'is_staff': self.user.is_staff,
        }
        return data

class UserStatusSerializer(serializers.ModelSerializer):
    """
    Serializer for blocking/unblocking users.
    """
    class Meta:
        model = get_user_model()
        fields = ('is_active',)

class UserPasswordResetSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, min_length=5)
