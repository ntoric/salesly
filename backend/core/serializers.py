from rest_framework import serializers
from .models import Address

class AddressSerializer(serializers.ModelSerializer):
    """
    Serializer for the reusable Address model.
    """
    class Meta:
        model = Address
        fields = ('id', 'address_line_1', 'address_line_2', 'city', 'state', 'postal_code', 'country', 'customer_name', 'mobile_number')
        read_only_fields = ('id',)
