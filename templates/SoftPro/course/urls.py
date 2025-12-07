from django.urls import path
from . import views


urlpatterns = [
    path('course/',views.view_courses,name='view_courses'),
    path('course/add/',views.add_course,name='add_course'),
    path('course/update/<int:pk>/',views.edit_course,name='edit_course'),
    path('course/delete/<int:pk>/',views.delete_course,name='delete_course'),
]

