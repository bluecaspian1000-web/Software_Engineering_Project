from django.db import models
from accounts.models import Professor


class Course(models.Model):
    name = models.CharField(max_length=100, verbose_name="course name")
    code = models.CharField(max_length=20, unique=True, verbose_name="course code")
    capacity = models.PositiveIntegerField(verbose_name="capacity")
    professor = models.ForeignKey('accounts.Professor', on_delete=models.CASCADE, related_name='courses',
                                  verbose_name="professor")

    # prerequisites = models.ManyToManyField('self', symmetrical=False, blank=True, verbose_name="prerequisites")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

    class Meta:
        db_table = 'courses'
        ordering = ['code']
        verbose_name = "course"
        verbose_name_plural = "courses"


class CourseSchedule(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='schedules', verbose_name="course")

    class DayOfWeek(models.TextChoices):
        SATURDAY = 'Saturday', 'Saturday'
        SUNDAY = 'Sunday', 'Sunday'
        MONDAY = 'Monday', 'Monday'
        TUESDAY = 'Tuesday', 'Tuesday'
        WEDNESDAY = 'Wednesday', 'Wednesday'

    day_of_week = models.CharField(
        max_length=10,
        choices=DayOfWeek.choices,
        verbose_name="day of week"
    )

    class TimeSlot(models.TextChoices):
        SLOT_8_10 = '8-10', '8:00 - 10:00'
        SLOT_10_12 = '10-12', '10:00 - 12:00'
        SLOT_14_16 = '14-16', '14:00 - 16:00'
        SLOT_16_18 = '16-18', '16:00 - 18:00'

    time_slot = models.CharField(
        max_length=10,
        choices=TimeSlot.choices,
        verbose_name="time slot"
    )

    location = models.CharField(max_length=50, verbose_name="location")

    def __str__(self):
        return f"{self.course.code} - {self.get_day_of_week_display()} {self.get_time_slot_display()}"

    class Meta:
        verbose_name = "course schedule"
        verbose_name_plural = "course schedules"
        unique_together = ['course', 'day_of_week', 'time_slot']