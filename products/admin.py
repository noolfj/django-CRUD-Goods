from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'discount_percent', 'product_type', 'size', 'color', 'created_at')
    readonly_fields = ('created_at' , 'updated_at')