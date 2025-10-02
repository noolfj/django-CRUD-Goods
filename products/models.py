from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal

SIZE_CHOICES = [
    ('XS', 'XS'), ('S', 'S'), ('M', 'M'), ('L', 'L'), ('XL', 'XL')
]

TYPE_CHOICES = [
    ('running', 'Running'),
    ('sport', 'Sport'),
    ('casual', 'Casual'),
]

class Product(models.Model):
    name=models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    size = models.CharField(max_length=5, choices=SIZE_CHOICES, default='M')
    color = models.CharField(max_length=50)
    product_type = models.CharField(max_length=120, choices=TYPE_CHOICES)
    photo = models.ImageField(upload_to='products/', blank=True, null=True)
    discount_percent = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        blank=True,
        null=True,
        help_text='Discount percent 0-100'
    )
    created_at = models.DateTimeField(auto_now_add= True)
    updated_at= models.DateTimeField(auto_now=True)
    
    def price_after_discount(self):
        if self.discount_percent:
            return (self.price * Decimal(100 - self.discount_percent) / Decimal(100)).quantize(Decimal('0.01'))
        return self.price
    
    
    def __str__(self):
        return self.name