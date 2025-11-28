# courses/urls.py
from django.urls import path
from .api_views import *

urlpatterns = [
    path('api/courses/', get_courses),
    path('api/courses/<int:id>/', get_course),
    path('api/courses/create/', create_course),
    path('api/courses/<int:id>/update/', update_course),
    path('api/courses/<int:id>/delete/', delete_course),
]