# courses/api_views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Course
from .serializers import CourseSerializer


# GET all courses
@api_view(['GET'])
def get_courses(request):
    courses = Course.objects.all()
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)


# GET single course
@api_view(['GET'])
def get_course(request, id):
    try:
        course = Course.objects.get(id=id)
        serializer = CourseSerializer(course)
        return Response(serializer.data)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)


# CREATE new course
@api_view(['POST'])
def create_course(request):
    serializer = CourseSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


# UPDATE course
@api_view(['PUT'])
def update_course(request, id):
    try:
        course = Course.objects.get(id=id)
        serializer = CourseSerializer(course, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)


# DELETE course
@api_view(['DELETE'])
def delete_course(request, id):
    try:
        course = Course.objects.get(id=id)
        course.delete()
        return Response(status=204)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)
