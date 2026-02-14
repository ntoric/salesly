from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework import permissions

from core.views import GlobalSearchView

api_v1_urlpatterns = [
    path('auth/', include('users.urls')),
    path('', include('users.urls')), # To expose /users/ logic
    path('purchases/', include('purchases.urls')),
    path('sales/', include('sales.urls')),
    path('customers/', include('customers.urls')),
    path('dashboard/', include('core.urls')), # Dashboard
    path('reports/', include('reports.urls')),
    path('search/', GlobalSearchView.as_view({'get': 'list'}), name='global-search'),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include((api_v1_urlpatterns, 'v1'), namespace='v1')),
    # Swagger Documentation
    path('api/schema/', SpectacularAPIView.as_view(permission_classes=[permissions.AllowAny], api_version='v1'), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema', permission_classes=[permissions.AllowAny]), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema', permission_classes=[permissions.AllowAny]), name='redoc'),
]
