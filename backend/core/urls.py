from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DashboardViewSet, GlobalSearchView

router = DefaultRouter()
# router.register(r'', DashboardViewSet, basename='dashboard')

urlpatterns = [
    # path('', include(router.urls)),
    path('', DashboardViewSet.as_view({'get': 'list'}), name='dashboard'),
    path('', DashboardViewSet.as_view({'get': 'list'}), name='dashboard'),
]
