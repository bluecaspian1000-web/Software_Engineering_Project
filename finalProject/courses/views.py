# from django.shortcuts import render, redirect, get_object_or_404
# from .models import Course
# from accounts.models import Professor
#
#
# # course list
# def course_list(request):
#     courses = Course.objects.all()
#     return render(request, 'course_list.html', {'courses': courses})
#
#
# # add course
# def add_course(request):
#     if request.method == 'POST':
#         name = request.POST.get('name')
#         code = request.POST.get('code')
#         capacity = request.POST.get('capacity')
#         professor_id = request.POST.get('professor')
#
#         # new record
#         Course.objects.create(name=name, code=code, capacity=capacity, professor_id=professor_id)
#
#         return redirect('course_list')
#
#     professors = Professor.objects.all()
#     return render(request, 'add_course.html', {'professors': professors})
#
#
# # edit
# def edit_course(request, course_id):
#     course = get_object_or_404(Course, id=course_id)
#
#     if request.method == 'POST':
#         course.name = request.POST.get('name')
#         course.code = request.POST.get('code')
#         course.capacity = request.POST.get('capacity')
#         course.professor_id = request.POST.get('professor')
#         course.save()
#
#         return redirect('course_list')
#
#     professors = Professor.objects.all()
#     return render(request, 'edit_course.html', {'course': course, 'professors': professors})
#
#
# # delete
# def delete_course(request, course_id):
#     course = get_object_or_404(Course, id=course_id)
#
#     if request.method == 'POST':
#         course.delete()
#         return redirect('course_list')
#
#     return render(request, 'delete_course.html', {'course': course})
