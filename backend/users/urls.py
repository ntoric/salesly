from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
# router.register(r'admin/sellers', views.AdminSellerViewSet, basename='admin-seller') # Replaced by UserViewSet
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'permissions', views.PermissionViewSet, basename='permission')

urlpatterns = [
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', views.ManageUserView.as_view(), name='me'),
] + router.urls
