from rest_framework.decorators import api_view
from rest_framework.response import Response
from .storage import JOB_STORAGE
from .utils import jobs_skills
from reports.views import recompute_all_reports

# GET/POST: jobs list and save frontend skills
@api_view(["GET", "POST"])
def jobs(request):
    if request.method == "GET":
        jobs_list = [{"id": idx + 1, "title": job} for idx, job in enumerate(jobs_skills.keys())]
        return Response(jobs_list)

    if request.method == "POST":
        job = request.data.get("job")
        skills = request.data.get("skills", [])

        if not job:
            return Response({"error": "Job title required"}, status=400)

        # Save frontend-selected skills
        JOB_STORAGE["job_title"] = job
        JOB_STORAGE["skills"] = skills

        recompute_all_reports()

        return Response({"job_title": job, "skills": skills}, status=200)

# GET: fetch default skills for a job
@api_view(["GET"])
def get_skills(request):
    job = request.GET.get("job")
    if not job:
        return Response({"error": "Job title required"}, status=400)

    skills = jobs_skills.get(job, [])

    # Do not overwrite if frontend sends POST later
    JOB_STORAGE["job_title"] = job
    JOB_STORAGE["skills"] = skills

    recompute_all_reports()

    return Response({"job": job, "skills": skills})
