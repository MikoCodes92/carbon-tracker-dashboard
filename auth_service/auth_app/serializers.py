# auth_app/serializers.py
from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers

class CustomRegisterSerializer(RegisterSerializer):
    username = None  # disable username
    full_name = serializers.CharField(required=False, allow_blank=True)

    def get_cleaned_data(self):
        return {
            "email": self.validated_data.get("email", ""),
            "full_name": self.validated_data.get("full_name", ""),
            "password1": self.validated_data.get("password1", ""),
        }
