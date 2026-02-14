from django.urls import path
from .views import SalesReportView, PurchaseReportView, AddressLabelView

urlpatterns = [
    path('sales/', SalesReportView.as_view(), name='sales-report'),
    path('purchases/', PurchaseReportView.as_view(), name='purchase-report'),
    path('labels/', AddressLabelView.as_view(), name='address-labels'),
]
