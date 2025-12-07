from django.db import models

class Course(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=30)
    unit = models.IntegerField()
    term = models.CharField(max_length=30)
    prf_name = models.CharField(max_length=150)

