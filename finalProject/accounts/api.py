from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Professor


@api_view(['GET'])
def professor_list(request):
    professors = Professor.objects.all()
    data = [{"id": p.id, "name": str(p)} for p in professors]
    return Response(data)


@api_view(['POST'])
def professor_create(request):
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    professor_code = request.data.get('professor_code')

    professor = Professor.objects.create(first_name=first_name, last_name=last_name, professor_code=professor_code)
    return Response({"id": professor.id, "name": str(professor)})
