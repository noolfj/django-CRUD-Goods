from rest_framework import serializers
from .models import Product
from decimal import Decimal, ROUND_HALF_UP

class ProductSerializer(serializers.ModelSerializer):
    price_after_discount = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'price_after_discount',
            'size', 'color', 'product_type', 'photo', 'photo_url',
            'discount_percent', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'price_after_discount', 'photo_url']
    


    def get_price_after_discount(self, obj):
        if obj.discount_percent:
            discount_multiplier = Decimal('1') - (Decimal(obj.discount_percent) / Decimal('100'))
            return (obj.price * discount_multiplier).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        return obj.price

    
    def get_photo_url(self, obj):
        request = self.context.get('request')
        if obj.photo and hasattr(obj.photo, 'url'):
            url = obj.photo.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None
    
    def validate_discount_percent(self, value):
        if value is None:
            return value
        if not (0 <= value <= 100):
            raise serializers.ValidationError('Discount must be between 0 and 100.')
        return value
