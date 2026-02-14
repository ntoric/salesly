from django.conf import settings
import datetime
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel

class Purchase(TimeStampedModel):
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='purchases')
    vendor_name = models.CharField(_('vendor name'), max_length=255, blank=True)
    
    # Trading Fields
    volume = models.DecimalField(_('volume'), max_digits=12, decimal_places=2, default=0.00)
    currency = models.CharField(_('currency'), max_length=10, default='USD') # e.g. USD, EUR
    purchase_currency = models.CharField(_('purchase currency'), max_length=10, default='USD') # e.g. INR
    rate = models.DecimalField(_('rate'), max_digits=12, decimal_places=4, default=1.0000)
    actual_rate = models.DecimalField(_('actual rate'), max_digits=12, decimal_places=4, blank=True, null=True)
    
    # Computed amount
    purchase_amount = models.DecimalField(_('purchase amount'), max_digits=15, decimal_places=2, default=0.00) # Volume * Rate
    actual_purchase_amount = models.DecimalField(_('actual purchase amount'), max_digits=15, decimal_places=2, blank=True, null=True)

    date = models.DateField(_('date'), default=datetime.date.today)
    last_updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['seller', 'date']),
        ]

    def save(self, *args, **kwargs):
        # Auto-calculate amount
        if self.volume and self.rate:
            self.purchase_amount = self.volume * self.rate
        
        if self.volume and self.actual_rate:
             self.actual_purchase_amount = self.volume * self.actual_rate
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Purchase #{self.pk} - {self.volume} {self.currency}"

# Removed PurchaseItem as it is no longer needed in Trading Model
