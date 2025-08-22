import json
from rest_framework.decorators import api_view
from rest_framework.response import Response
from resumes.models import Resume
from .models import Report
from jobs.storage import JOB_STORAGE

WEIGHTS = {
    "skills": 0.5,
    "experience": 0.2,
    "education": 0.1,
    "certifications": 0.1,
    "projects": 0.1,
}


def compute_score(resume):
    score = 0
    analysis = {}

    skills_found = [s.strip().lower() for s in (resume.skills or "").split(",") if s.strip()]
    required_skills = JOB_STORAGE.get("skills", [])
    required_skills_lower = [s.lower() for s in required_skills]

    matched = list(set(skills_found) & set(required_skills_lower))
    missing = list(set(required_skills_lower) - set(skills_found))
    skill_score = (len(matched) / len(required_skills_lower) * 100) if required_skills_lower else 0
    score += skill_score * WEIGHTS["skills"]

    summary = resume.summary or {}
    if isinstance(summary, str):
        try:
            summary = json.loads(summary)
        except Exception:
            summary = {}

    experience = summary.get("experience_years", 0)
    exp_score = min(experience, 10) / 10 * 100
    score += exp_score * WEIGHTS["experience"]

    education_text = (resume.education or "").lower()
    edu_map = {"phd": 100, "master": 80, "bachelor": 60, "diploma": 40}
    edu_score = 0
    for key, val in edu_map.items():
        if key in education_text:
            edu_score = val
            break
    score += edu_score * WEIGHTS["education"]

    cert_count = resume.certifications or 0
    cert_score = min(cert_count, 5) / 5 * 100
    score += cert_score * WEIGHTS["certifications"]

    projects_count = resume.projects or 0
    proj_score = min(projects_count, 10) / 10 * 100
    score += proj_score * WEIGHTS["projects"]

    analysis.update({
        "required_skills_matched": matched,
        "required_skills_missing": missing,
        "experience_years": experience,
        "education": resume.education,
        "education_score": edu_score,
        "certifications": cert_count,
        "projects": projects_count,
    })

    return int(score), analysis


def recompute_all_reports():
    resumes = Resume.objects.all()
    for resume in resumes:
        score, analysis = compute_score(resume)
        Report.objects.update_or_create(
            resume=resume,
            defaults={"score": score, "details": analysis}
        )


@api_view(["GET"])
def reports_list(request):
    """
    Return all reports with resume details including absolute file_url.
    """
    recompute_all_reports()
    reports = Report.objects.select_related("resume").all()

    reports_data = []
    for report in reports:
        resume = report.resume
        summary = resume.summary or {}
        if isinstance(summary, str):
            try:
                summary = json.loads(summary)
            except Exception:
                summary = {}

        name = summary.get("name") or getattr(resume, "name", None) or resume.file.name

        # Build absolute file_url using request context
        file_url = None
        if resume.file and hasattr(resume.file, "url"):
            file_url = request.build_absolute_uri(resume.file.url)

        reports_data.append({
            "id": resume.id,
            "name": name,
            "file_url": file_url,
            "date": resume.uploaded_at.strftime("%Y-%m-%d %H:%M"),
            "score": report.score,
            "status": resume.status.title() if resume.status else "Completed",
            "analysis": report.details,
        })

    # Sort by score descending, then date
    reports_data.sort(key=lambda r: (-r["score"], r["date"]))
    return Response(reports_data)


@api_view(["GET"])
def report_detail(request, pk):
    """
    Return single report details including absolute file_url.
    """
    try:
        report = Report.objects.select_related("resume").get(pk=pk)
    except Report.DoesNotExist:
        return Response({"error": "Report not found"}, status=404)

    resume = report.resume
    summary = resume.summary or {}
    if isinstance(summary, str):
        try:
            summary = json.loads(summary)
        except Exception:
            summary = {}

    name = summary.get("name") or getattr(resume, "name", None) or resume.file.name
    file_url = request.build_absolute_uri(resume.file.url) if resume.file else None

    data = {
        "id": resume.id,
        "name": name,
        "file_url": file_url,
        "date": resume.uploaded_at.strftime("%Y-%m-%d %H:%M"),
        "score": report.score,
        "status": resume.status.title() if resume.status else "Completed",
        "analysis": report.details,
    }
    return Response(data)
