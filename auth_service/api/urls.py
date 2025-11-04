"""
URL configuration for api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# api/urls.py
from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework import permissions

# drf-yasg imports
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Carbon Tracker API",
        default_version='v1',
        description="API for auth and carbon gateway",
        contact=openapi.Contact(email="dev@example.com"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # your auth endpoints
    path('api/auth/', include('dj_rest_auth.urls')),                        # login/logout
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),  # registration
    path('api/auth/social/', include('allauth.socialaccount.urls')),         # social

    # gateway endpoints (example)
    path('api/gateway/', include('api_gateway.urls')),  # if you have this app

    # Swagger / OpenAPI endpoints:
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
