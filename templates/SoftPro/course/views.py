from django.shortcuts import render, redirect, get_object_or_404
from django import forms
from .models import Course


class CourseForm(forms.ModelForm):
    class meta:
        model = Course
        fields = ['name','code','unit','term','prf_name']



# ----------------------- create -----------------------
def add_course(request):
    if request.method == 'POST':
        form = CourseForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('view_courses')
    else:
        form = CourseForm()
    return render(request, 'add_course.html',{'form':form})


# ----------------------- read -----------------------
def view_courses(request):
    courses = Course.objects.all()
    return render(request, 'view_courses.html',{'courses':courses})



# ----------------------- update -----------------------
def edit_course(request, pk):
    course = get_object_or_404(Course,pk=pk)
    if request.method == 'POST':
        form = CourseForm(request.POST, instance=course)
        if form.is_valid():
            form.save()
            return redirect('view_courses')
    else:
        form = CourseForm(instance = course)
    return render(request,'edit_course.html',{'form':form})



# ----------------------- delete -----------------------
def delete_course(request, pk):
    course = get_object_or_404(Course, pk=pk)
    if request.method == 'POST':
        course.delete()
        return redirect('view_courses')
    return render(request, 'delete_course.html', {'course':course})

