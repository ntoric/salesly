from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, AddressViewSet

router = DefaultRouter()
router.register(r'addresses', AddressViewSet, basename='address')
router.register('', CustomerViewSet, basename='customer')

urlpatterns = [
    path('', include(router.urls)),
]
