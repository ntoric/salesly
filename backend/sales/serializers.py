from rest_framework import serializers
from .models import Sale

class SaleSerializer(serializers.ModelSerializer):
    """
    Serializer for Sale (Trading Model).
    """
    seller_name = serializers.CharField(source='seller.get_full_name', read_only=True)
    customer_name = serializers.CharField(max_length=255, required=False, allow_blank=True)

    class Meta:
        model = Sale
        fields = (
            'id', 'seller', 'seller_name', 'customer', 'customer_name', 
            'volume', 'currency', 'sale_currency', 'rate', 'status',
            'address_line_1', 'address_line_2', 'city', 'district', 'state', 'country', 'pincode', 'phone_number',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'seller')

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['seller'] = user
        return super().create(validated_data)
