from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from django.core.files.storage import default_storage
from django.conf import settings  # noqa: F401
from django.db.models import Q
from .models import Resume
from .serializers import ResumeSerializer
import os
import re
import json
from io import BytesIO
from datetime import datetime
from dateutil import parser as date_parser
from resumes.utils import delete_resumes_by_ids

try:
    import pdfplumber
except Exception:
    pdfplumber = None

try:
    from docx import Document
except Exception:
    Document = None

ALLOWED_EXTS = {".pdf", ".docx", ".txt"}

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(?:\+?\d[\d\s\-()]{8,})")
LINKEDIN_RE = re.compile(r"(?:https?://)?(?:www\.)?linkedin\.com/[^\s)]+", re.IGNORECASE)
GITHUB_RE = re.compile(r"(?:https?://)?(?:www\.)?github\.com/[^\s)]+", re.IGNORECASE)
DATE_RANGE_RE = re.compile(
    r"(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|"
    r"January|February|March|April|May|June|July|August|September|October|November|December)?\.?\s?\d{4})"
    r"\s?[-–to]+\s?"
    r"(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|"
    r"January|February|March|April|May|June|July|August|September|October|November|December)?\.?\s?\d{4}|Present|Current)",
    re.IGNORECASE
)

ALL_SKILLS = [
    "Python","Java","Git","Problem Solving","C++","SQL","Excel","Communication","Tableau","Planning",
    "Leadership","Risk Management","Budgeting","Scrum","Time Management","Conflict Resolution","Figma",
    "Adobe XD","Wireframing","Creativity","AWS","Docker","Kubernetes","CI/CD","Terraform","Requirement Gathering",
    "Process Mapping","Roadmap Planning","Stakeholder Management","Analytics","Logistics","Process Improvement",
    "Recruitment","Payroll","Employee Engagement","Onboarding","Candidate Sourcing","Interviewing","Networking",
    "ATS","Job Descriptions","SEO","Content Marketing","Brand Management","Social Media Strategy","Email Marketing",
    "Campaign Planning","Writing","Research","Editing","Copywriting","Blogging","Storytelling","Content Strategy",
    "Adobe Photoshop","Illustrator","Branding","Typography","Layout Design","Motion Graphics","Color Theory",
    "Premiere Pro","After Effects","Color Grading","Sound Editing","Transitions","Social Media Strategy",
    "Content Creation","Community Management","Advertising","Accounting","Financial Modeling","Forecasting",
    "Valuation","Investment Analysis","Regulations","Audit","Policy","Risk Assessment","Internal Controls",
    "Training","Legal Compliance","Contract Law","Negotiation","Compliance","Intellectual Property","Corporate Law",
    "Litigation Support","Drafting Legal Documents","CRM","Patience","Troubleshooting","Hardware/Software Knowledge",
    "Remote Assistance","System Configuration","Technical Writing","Organization","Scheduling","Office Management",
    "Meeting Coordination","Data Entry"
]

def _extract_text_from_pdf(path: str) -> str:
    if not pdfplumber:
        return ""
    text_parts = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text_parts.append(page.extract_text() or "")
    return "\n".join(text_parts)

def _extract_text_from_docx(path: str) -> str:
    if not Document:
        return ""
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs)

def _extract_text_generic(path: str, ext: str) -> str:
    ext = (ext or "").lower()
    if ext == ".pdf":
        return _extract_text_from_pdf(path)
    if ext == ".docx":
        return _extract_text_from_docx(path)
    if ext == ".txt":
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        except Exception:
            return ""
    return ""

def _extract_skills(text: str) -> list:
    text_lower = text.lower()
    found_skills = []
    for skill in ALL_SKILLS:
        if skill.lower() in text_lower and skill not in found_skills:
            found_skills.append(skill)
    return found_skills

def _extract_contacts_and_links(text: str) -> dict:
    email = EMAIL_RE.search(text)
    phone = PHONE_RE.search(text)
    linkedin = LINKEDIN_RE.search(text)
    github = GITHUB_RE.search(text)
    linkedin_url = linkedin.group(0) if linkedin else None
    github_url = github.group(0) if github else None
    if linkedin_url and not linkedin_url.lower().startswith("http"):
        linkedin_url = "https://" + linkedin_url
    if github_url and not github_url.lower().startswith("http"):
        github_url = "https://" + github_url
    return {
        "email": email.group(0) if email else None,
        "phone": phone.group(0) if phone else None,
        "linkedin": linkedin_url,
        "github": github_url,
    }

def _guess_name(text: str) -> str | None:
    for line in text.splitlines():
        cand = line.strip()
        if 5 <= len(cand) <= 60 and len(cand.split()) in (2, 3) and re.match(r"^[A-Za-z .'-]+$", cand):
            return cand
    return None

def _extract_skills_education_projects(text: str) -> dict:
    skills = _extract_skills(text)
    text_lower = text.lower()
    education = ""
    if "phd" in text_lower or "doctorate" in text_lower:
        education = "phd"
    elif "master" in text_lower or "msc" in text_lower:
        education = "master"
    elif "bachelor" in text_lower or "bsc" in text_lower or "be" in text_lower:
        education = "bachelor"
    elif "diploma" in text_lower:
        education = "diploma"
    projects_count = text_lower.count("project")
    certifications = re.findall(r"(?:certified in|certificate in|certification in)\s+([A-Za-z &]+)", text, re.IGNORECASE)
    return {"skills": sorted(set(skills)), "education": education, "projects_count": projects_count, "certifications": certifications}

def _extract_experience_years(text: str) -> float:
    total_months = 0
    for match in DATE_RANGE_RE.findall(text):
        start_str, end_str = match
        try:
            start_date = date_parser.parse(start_str, fuzzy=True)
        except Exception:
            continue
        if re.search(r"present|current", end_str, re.IGNORECASE):
            end_date = datetime.now()
        else:
            try:
                end_date = date_parser.parse(end_str, fuzzy=True)
            except Exception:
                continue
        if end_date < start_date:
            continue
        total_months += (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
    if total_months == 0:
        month_matches = re.findall(r"(\d+)\s+(?:years?|yrs?)", text, re.IGNORECASE)
        for m in month_matches:
            total_months += int(m) * 12
    return round(total_months / 12, 1)

class ResumeUploadView(APIView):
    def post(self, request, *args, **kwargs):
        files = request.FILES.getlist("files")
        if not files:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        extracted_data = []
        upload_subdir = "resumes"
        for file in files:
            name = file.name
            ext = os.path.splitext(name)[1].lower()
            if ext not in ALLOWED_EXTS:
                extracted_data.append({"filename": name, "status": "skipped_unsupported"})
                continue
            file_bytes = BytesIO(file.read())
            text = _extract_text_generic(file_bytes, ext)
            details = _extract_contacts_and_links(text)
            details["name"] = _guess_name(text)
            sections = _extract_skills_education_projects(text)
            details.update(sections)
            details["experience_years"] = _extract_experience_years(text)
            existing = Resume.objects.filter(owner=request.user).filter(
                Q(summary__contains=f'"email": "{details.get("email")}"') |
                Q(summary__contains=f'"phone": "{details.get("phone")}"') |
                Q(summary__contains=f'"linkedin": "{details.get("linkedin")}"') |
                Q(summary__contains=f'"github": "{details.get("github")}"') |
                Q(summary__contains=f'"name": "{details.get("name")}"')
            ).first()
            if existing:
                extracted_data.append({"filename": name, "status": "skipped_duplicate"})
                continue
            file.seek(0)
            rel_path = os.path.join(upload_subdir, name)
            base, extension = os.path.splitext(rel_path)
            i = 1
            while default_storage.exists(rel_path):
                rel_path = f"{base}_{i}{extension}"
                i += 1
            saved_path = default_storage.save(rel_path, file)
            resume = Resume.objects.create(
                file=saved_path,
                owner=request.user if request.user.is_authenticated else None,
                parsed_text=text[:20000],
                skills=", ".join(sections.get("skills", [])),
                certifications=", ".join(sections.get("certifications", [])),
                education=sections.get("education", ""),
                projects=sections.get("projects_count", 0),
                summary=json.dumps(details, ensure_ascii=False),
                status="processed"
            )
            extracted_data.append({
                "id": resume.id,
                "filename": os.path.basename(saved_path),
                "file_url": request.build_absolute_uri(resume.file.url) if resume.file else None,
                **details,
                "status": "parsed"
            })
        return Response({"message": "Files uploaded successfully", "extracted": extracted_data}, status=status.HTTP_201_CREATED)

@api_view(["GET"])
def resume_list(request):
    resumes = Resume.objects.filter(owner=request.user) if request.user.is_authenticated else Resume.objects.none()
    serializer = ResumeSerializer(resumes, many=True, context={"request": request})
    return Response(serializer.data)

@api_view(["GET"])
def resume_detail(request, pk):
    try:
        resume = Resume.objects.get(pk=pk, owner=request.user)
    except Resume.DoesNotExist:
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = ResumeSerializer(resume, context={"request": request})
    return Response(serializer.data)

@api_view(["DELETE"])
def resume_delete(request, pk):
    try:
        resume = Resume.objects.get(pk=pk, owner=request.user)
    except Resume.DoesNotExist:
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
    if resume.file and default_storage.exists(resume.file.name):
        default_storage.delete(resume.file.name)
    resume.delete()
    return Response({"message": "Deleted"}, status=status.HTTP_204_NO_CONTENT)

@api_view(["POST"])
def resume_bulk_delete(request):
    ids = request.data.get("ids", [])
    if not isinstance(ids, list) or not ids:
        return Response({"error": "Provide a list of resume IDs to delete"}, status=400)
    deleted_count = delete_resumes_by_ids(request.user, ids)
    return Response({"message": f"{deleted_count} resumes deleted successfully"})