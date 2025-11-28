from django.db import models
from django.contrib.auth.models import User


class Professor(models.Model):
    first_name = models.CharField(max_length=100, verbose_name="first name")
    last_name = models.CharField(max_length=100, verbose_name="last name")
    professor_code = models.CharField(max_length=20, unique=True, verbose_name="professor code")

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.professor_code})"

    class Meta:
        verbose_name = "professor"
        verbose_name_plural = "professors"
