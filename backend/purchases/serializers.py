from rest_framework import serializers
from .models import Purchase

class PurchaseSerializer(serializers.ModelSerializer):
    """
    Serializer for Purchase (Trading Model).
    """
    class Meta:
        model = Purchase
        fields = ('id', 'seller', 'volume', 'currency', 'purchase_currency', 'rate', 'actual_rate', 'purchase_amount', 'actual_purchase_amount', 'date', 'last_updated_date')
        read_only_fields = ('id', 'created_at', 'updated_at', 'purchase_amount', 'actual_purchase_amount', 'seller')

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['seller'] = user
        return super().create(validated_data)
