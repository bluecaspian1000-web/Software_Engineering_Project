from django.urls import path
from .api import professor_list, professor_create

urlpatterns = [
    path('api/professors/', professor_list),
    path('api/professors/create/', professor_create),
]