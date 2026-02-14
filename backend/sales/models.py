from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel
from customers.models import Customer

class Sale(TimeStampedModel):
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sales')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='sales')
    customer_name = models.CharField(_('customer name'), max_length=255, blank=True, null=True)
    
    # Trading Fields
    volume = models.DecimalField(_('volume'), max_digits=12, decimal_places=2, default=0.00)
    currency = models.CharField(_('currency'), max_length=10, default='USD')
    sale_currency = models.CharField(_('sale currency'), max_length=10, default='USD')
    sale_currency = models.CharField(_('sale currency'), max_length=10, default='USD')
    rate = models.DecimalField(_('rate'), max_digits=12, decimal_places=4, default=1.0000)

    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        COMPLETED = 'COMPLETED', _('Completed')
        CANCELLED = 'CANCELLED', _('Cancelled')

    status = models.CharField(
        _('status'),
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    
    # Address Fields
    address_line_1 = models.CharField(_('address line 1'), max_length=255, blank=True)
    address_line_2 = models.CharField(_('address line 2'), max_length=255, blank=True)
    city = models.CharField(_('city'), max_length=100, blank=True)
    district = models.CharField(_('district'), max_length=100, blank=True)
    state = models.CharField(_('state'), max_length=100, blank=True)
    country = models.CharField(_('country'), max_length=100, blank=True)
    pincode = models.CharField(_('pincode'), max_length=20, blank=True)
    phone_number = models.CharField(_('phone number'), max_length=20, blank=True)

    def __str__(self):
        return f"Sale #{self.pk} - {self.volume} {self.currency}"

# Removed SaleItem
