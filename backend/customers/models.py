from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel, Address

class Customer(TimeStampedModel):
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='customers')
    name = models.CharField(_('customer name'), max_length=255)
    email = models.EmailField(_('email'), blank=True, null=True)
    phone = models.CharField(_('phone number'), max_length=20, blank=True)
    address = models.OneToOneField(Address, on_delete=models.SET_NULL, null=True, blank=True, related_name='customer')

    class Meta:
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['phone']),
        ]

    def __str__(self):
        return self.name
