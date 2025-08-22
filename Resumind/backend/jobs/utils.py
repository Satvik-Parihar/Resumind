jobs_skills = {
    "Software Engineer": ["Python", "Java", "Git", "Problem Solving", "C++"],
    "Data Analyst": ["Python", "SQL", "Excel", "Communication", "Tableau"],
    "Project Manager": ["Planning", "Leadership", "Communication", "Risk Management", "Budgeting", "Scrum", "Time Management", "Conflict Resolution"],
    "UI/UX Designer": ["Figma", "Adobe XD", "Wireframing", "Creativity"],
    "DevOps Engineer": ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
    "Business Analyst": ["Requirement Gathering", "SQL", "Communication", "Process Mapping"],
    "Product Manager": ["Roadmap Planning", "Stakeholder Management", "Analytics"],
    "Operations Manager": ["Logistics", "Planning", "Process Improvement", "Leadership"],
    "HR Specialist": ["Recruitment", "Payroll", "Communication", "Employee Engagement", "Onboarding"],
    "Recruiter": ["Candidate Sourcing", "Interviewing", "Networking", "ATS", "Job Descriptions"],
    "Marketing Manager": ["SEO", "Content Marketing", "Analytics", "Creativity", "Brand Management", "Social Media Strategy", "Email Marketing", "Campaign Planning"],
    "Content Writer": ["Writing", "Research", "SEO", "Editing", "Copywriting", "Blogging", "Storytelling", "Content Strategy"],
    "Graphic Designer": ["Adobe Photoshop", "Illustrator", "Creativity", "Branding", "Typography", "Layout Design", "Motion Graphics", "Color Theory"],
    "Video Editor": ["Premiere Pro", "After Effects", "Storytelling", "Creativity", "Color Grading", "Sound Editing", "Motion Graphics", "Transitions"],
    "Social Media Manager": ["Social Media Strategy", "Content Creation", "Analytics", "Community Management", "Advertising"],
    "Accountant": ["Accounting", "Excel", "Taxation", "Reporting", "Bookkeeping", "Financial Statements", "Budgeting", "Audit Compliance"],
    "Financial Analyst": ["Excel", "Financial Modeling", "Analytics", "Forecasting", "Valuation", "Investment Analysis", "Budgeting", "Power BI"],
    "Compliance Officer": ["Regulations", "Audit", "Policy", "Reporting", "Risk Assessment", "Internal Controls", "Training", "Legal Compliance"],
    "Legal Advisor": ["Contract Law", "Negotiation", "Compliance", "Research", "Intellectual Property", "Corporate Law", "Litigation Support", "Drafting Legal Documents"],
    "Customer Support": ["Communication", "Problem Solving", "CRM", "Patience", "Conflict Resolution", "Product Knowledge", "Active Listening", "Ticketing Systems"],
    "Sales Executive": ["Negotiation", "CRM", "Networking", "Communication", "Lead Generation", "Customer Retention",],
    "Technical Support": ["Troubleshooting", "Communication", "Hardware/Software Knowledge", "Patience", "Remote Assistance", "Documentation", "System Configuration", "Technical Writing"],
    "Administrative Assistant": ["Organization", "Communication", "Scheduling", "Documentation", "Time Management", "Office Management", "Meeting Coordination", "Data Entry"]
}

def get_skills_for_job(job_title):
    return jobs_skills.get(job_title, [])
