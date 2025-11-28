from rest_framework import serializers
from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    professor_name = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'name', 'code', 'capacity', 'professor_name']

    def get_professor_name(self, obj):
        return str(obj.professor)
