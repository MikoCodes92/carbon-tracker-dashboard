from django.urls import path
from . import views

urlpatterns = [
    path('carbon/calculate/', views.proxy_carbon_calculate),
    path('carbon/explain/', views.proxy_carbon_explain),
    path('user/profile/', views.user_profile),
]
