from django.db import models
from django.utils.translation import gettext_lazy as _

class TimeStampedModel(models.Model):
    """
    An abstract base class model that provides self-updating
    'created' and 'modified' fields.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Address(TimeStampedModel):
    """
    Reusable Address model.
    """
    address_line_1 = models.CharField(_('address line 1'), max_length=255)
    address_line_2 = models.CharField(_('address line 2'), max_length=255, blank=True, null=True)
    city = models.CharField(_('city'), max_length=100)
    state = models.CharField(_('state/province'), max_length=100)
    postal_code = models.CharField(_('postal code'), max_length=20)
    country = models.CharField(_('country'), max_length=100)
    customer_name = models.CharField(_('customer name'), max_length=255, blank=True, null=True)
    mobile_number = models.CharField(_('mobile number'), max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.address_line_1}, {self.city}, {self.country}"

    class Meta:
        indexes = [
            models.Index(fields=['city', 'country']),
        ]
