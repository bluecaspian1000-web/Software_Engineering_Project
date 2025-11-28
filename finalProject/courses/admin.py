from django.contrib import admin
from .models import Course, CourseSchedule


class CourseScheduleInline(admin.TabularInline):
    model = CourseSchedule
    extra = 1
    fields = ['day_of_week', 'time_slot', 'location']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'capacity', 'professor', 'get_schedules_display']
    list_filter = ['professor']
    search_fields = ['name', 'code']
    inlines = [CourseScheduleInline]

    def get_schedules_display(self, obj):
        schedules = obj.schedules.all()
        return ", ".join([f"{s.get_day_of_week_display()} {s.get_time_slot_display()}" for s in schedules])

    get_schedules_display.short_description = 'Schedules'

    fieldsets = (
        ('Course info', {'fields': ('name', 'code', 'capacity', 'professor')}),
    )
