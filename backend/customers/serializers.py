from django.db import transaction
from rest_framework import serializers
from .models import Customer
from core.models import Address
from core.serializers import AddressSerializer

class CustomerSerializer(serializers.ModelSerializer):
    """
    Serializer for Customer with nested Address management.
    """
    address = AddressSerializer(required=False, allow_null=True)
    full_address = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = ('id', 'name', 'phone', 'email', 'address', 'full_address', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at', 'full_address')

    def get_full_address(self, obj):
        if obj.address:
            return str(obj.address)
        return ""

    def create(self, validated_data):
        address_data = validated_data.pop('address', None)
        seller = self.context['request'].user
        
        with transaction.atomic():
            address = None
            if address_data:
                address = Address.objects.create(**address_data)
            
            customer = Customer.objects.create(seller=seller, address=address, **validated_data)
            
        return customer

    def update(self, instance, validated_data):
        address_data = validated_data.pop('address', None)
        
        with transaction.atomic():
            # Update Customer fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            # Update or Create Address
            if address_data:
                if instance.address:
                    for attr, value in address_data.items():
                        setattr(instance.address, attr, value)
                    instance.address.save()
                else:
                    address = Address.objects.create(**address_data)
                    instance.address = address
            
            instance.save()
            
        return instance
