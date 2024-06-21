from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from rest_framework_jwt.settings import api_settings


CustomUser = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(required=False, default='customer')
    class Meta:
        model = CustomUser
        fields = ('username', 'password', 'email', 'role')

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'customer')  # Default role for registration
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    token = serializers.CharField(read_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("User is deactivated.")
                payload = api_settings.JWT_PAYLOAD_HANDLER(user)
                token = api_settings.JWT_ENCODE_HANDLER(payload)
                update_last_login(None, user)
                return {
                    'user': user,  # Include the user object in the validated data
                    'token': token
                }
            else:
                raise serializers.ValidationError("Invalid username or password.")
        else:
            raise serializers.ValidationError("Both fields are required.")


