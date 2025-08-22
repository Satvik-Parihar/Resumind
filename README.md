# Resumind

Resumind is an intelligent resume parsing and job-matching platform. It extracts skills, education, and work experience from resumes, compares them with job descriptions, and generates insightful reports to help both recruiters and applicants.

---

## 🚀 Features

- 📄 **Resume Parsing** – Extracts text, skills, education, certifications, and experience from PDF/DOCX resumes.  
- 🤖 **Job Matching** – Matches candidate profiles with job requirements using weighted scoring.  
- 📊 **Reports** – Generates detailed compatibility reports for each candidate vs. job role.  
- 🌐 **Frontend (React)** – User-friendly interface for uploading resumes, selecting jobs, and viewing results.  
- 🛠 **Backend (Django + DRF)** – Handles parsing, matching, storage, and API responses.  
- 🗄 **Database** – MongoDB / Django ORM integration for storing parsed resumes and reports.  

---

## 🏗 Project Structure

~~~plaintext
Resumind-main/
├── backend/
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── jobs/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── storage.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── reports/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── resumes/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── parsers.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── backend/
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── assets/
│   │   │   └── logo.png
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── FileUploader.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── UploadPage.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── README.md
└── .gitignore
~~~

---

## ⚙️ Installation & Setup

### ✅ Prerequisites
- Python ≥ 3.10  
- Node.js ≥ 18 and npm ≥ 9  
- Git  
- (Optional) MongoDB running locally or a connection string

### 1) Clone the repository
~~~bash
git clone https://github.com/your-username/Resumind.git
cd Resumind-main
~~~

### 2) Backend Setup (Django + DRF)
~~~bash
cd backend
python -m venv venv
# macOS/Linux
source venv/bin/activate
# Windows (PowerShell)
# .\venv\Scripts\Activate.ps1

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
~~~
Backend runs at: **http://127.0.0.1:8000/**

**Backend environment variables (`backend/.env`):**
~~~env
# Django
SECRET_KEY=change_me
DEBUG=True
ALLOWED_HOSTS=*

# Database (choose one)
# SQLite (default if configured in settings.py)
# no vars needed
# OR Mongo/Postgres example:
DATABASE_URL=postgres://user:pass@localhost:5432/resumind
# or
MONGO_URI=mongodb://localhost:27017/resumind

# JWT or other auth secrets (if applicable)
JWT_SECRET=change_me_too
~~~

### 3) Frontend Setup (React + Vite)
Open a new terminal:
~~~bash
cd frontend
npm install
npm run dev
~~~
Frontend runs at: **http://localhost:5173/**

**Frontend environment variables (`frontend/.env`):**
~~~env
VITE_API_URL=http://127.0.0.1:8000
~~~

---

## ▶️ Usage

1. Start **backend**:
   - Activate venv and run `python manage.py runserver` (port **8000**).
2. Start **frontend**:
   - `npm run dev` (port **5173**).
3. In the web app:
   - Upload a resume (PDF/DOCX).
   - Select/enter a job description or role.
   - View the **report**: parsed data, skills, and match score.

---

## 🧪 Common Commands

~~~bash
# Backend
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend
npm install
npm run dev
npm run build
npm run preview
~~~

---
