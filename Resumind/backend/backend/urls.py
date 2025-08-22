from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from accounts import urls as accounts_urls
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

def landing(request):
    return HttpResponse("Resumind API — running")

urlpatterns = [
    path('', landing),
    path('admin/', admin.site.urls),
    path('api/accounts/', include(accounts_urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # App routes
    path("api/resumes/", include("resumes.urls")),
    path("api/reports/", include("reports.urls")),
    path("api/jobs/", include("jobs.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
