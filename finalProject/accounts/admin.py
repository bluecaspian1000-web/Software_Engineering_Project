from django.contrib import admin
from .models import Professor


@admin.register(Professor)
class ProfessorAdmin(admin.ModelAdmin):
    list_display = ['professor_code', 'first_name', 'last_name']
    search_fields = ['professor_code', 'first_name', 'last_name']

    fields = ['first_name', 'last_name', 'professor_code']