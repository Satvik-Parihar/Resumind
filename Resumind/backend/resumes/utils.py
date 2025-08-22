import re
import os  # noqa: F401
import pdfplumber # pyright: ignore[reportMissingImports]
from docx import Document # pyright: ignore[reportMissingImports]
from resumes.models import Resume
from django.core.files.storage import default_storage

# basic keyword list for demo; extend with master list later
SKILL_KEYWORDS = [
    'python','django','flask','react','javascript','node','sql','mysql','mongodb',
    'aws','azure','docker','kubernetes','pandas','numpy','tensorflow','nlp'
]

def extract_text_from_pdf(path):
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            p = page.extract_text()
            if p:
                text += p + "\n"
    return text

def extract_text_from_docx(path):
    doc = Document(path)
    return "\n".join([p.text for p in doc.paragraphs])

def extract_text_and_skills(path):
    text = ""
    try:
        ext = path.lower().split('.')[-1]
        if ext == 'pdf':
            text = extract_text_from_pdf(path)
        elif ext in ('docx','doc'):
            text = extract_text_from_docx(path)
        else:
            with open(path, 'r', errors='ignore') as f:
                text = f.read()
    except Exception as e:
        return "", [], {"error": str(e)}

    lower = text.lower()
    found = []
    for kw in SKILL_KEYWORDS:
        if re.search(r'\b' + re.escape(kw) + r'\b', lower):
            found.append(kw)

    summary = {
        "length": len(text),
        "skills_found": found
    }
    return text, found, summary
# in resumes/utils.py


def delete_resumes_by_ids(user, ids):
    resumes = Resume.objects.filter(id__in=ids, owner=user)
    deleted_count = resumes.count()
    for resume in resumes:
        if resume.file and default_storage.exists(resume.file.name):
            default_storage.delete(resume.file.name)
    resumes.delete()
    return deleted_count
