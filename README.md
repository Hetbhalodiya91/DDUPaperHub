# DDUPaperHub (Dharmsinh Desai University Academic Resource Portal)

DDUPaperHub is a centralized document repository for university students, faculty, and contributors to search, preview, download, upload, and review academic examination question papers, lab manuals, and lecture notes.

---

## 🏛️ System Architecture

```text
DDUPaperHub/
├── backend/                  # Spring Boot 3.3.5 (Java 21) REST API
│   ├── src/main/java/com/ddu/paperhub/
│   │   ├── config/           # Security, S3/R2 Storage, Data Seeder
│   │   ├── controller/       # Auth, Papers, Subjects, Admin, Reports
│   │   ├── dto/              # Request / Response DTOs
│   │   ├── entity/           # JPA Entities (User, Paper, Subject, Report, etc.)
│   │   ├── repository/       # Spring Data JPA Repositories
│   │   ├── security/         # JWT Provider, Auth Filter & Details
│   │   └── service/          # PaperService, Storage, AuthService, etc.
│   └── pom.xml
├── frontend/                 # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/       # Navbar, Footer, ResourceCard, PDFModal, ReportModal
│   │   ├── context/          # AuthContext (JWT & Role management)
│   │   ├── pages/            # Home, Search, Upload, MySubmissions, Admin, Auth
│   │   └── services/         # Axios API Client
│   └── package.json
└── docker-compose.yml        # PostgreSQL 16 container definition
```

---

## 👥 Role Permissions Matrix

| Feature / Action | Admin | Contributor | Student |
|---|:---:|:---:|:---:|
| **Browse and download PDFs** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Upload new question papers / notes** | ✅ Yes | ✅ Yes | ❌ No |
| **Track personal submission review status** | ✅ Yes | ✅ Yes | ❌ No |
| **Approve or reject uploaded PDFs** | ✅ Yes | ❌ No | ❌ No |
| **Assign or change user roles** | ✅ Yes | ❌ No | ❌ No |
| **Manage users & moderate reports** | ✅ Yes | ❌ No | ❌ No |
| **Report incorrect or damaged PDFs** | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 🚀 How to Run the Project

### 1. Start the Backend
Open a terminal in `backend/`:

#### Option A: Quick Dev Mode with In-Memory H2 Database (No setup needed)
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

#### Option B: With PostgreSQL (Docker Compose)
```bash
# Start PostgreSQL in root directory
docker compose up -d

# Run backend
cd backend
mvn spring-boot:run
```

The backend starts at: **`http://localhost:8080`**

### 2. Start the Frontend
In a separate terminal in `frontend/`:
```bash
cd frontend
npm run dev
```

The frontend application opens at: **`http://localhost:5173`**

---

## 🔑 Pre-Seeded Demo Accounts

Click the **One-Click Demo Account** buttons on the Sign In page, or use:

| Role | Email | Password | What You Can Test |
|---|---|---|---|
| **Admin** | `admin@ddu.ac.in` | `Admin@123` | Review Queue (Approve/Reject), Change User Roles, Moderate Reports |
| **Contributor** | `contributor@ddu.ac.in` | `Contributor@123` | Upload new PDF papers, track status in "My Submissions" |
| **Student** | `student@ddu.ac.in` | `Student@123` | Search, filter by Department/Semester, Preview & Download PDF, Report Issue |

---

## ☁️ Cloud Object Storage (Cloudflare R2 / AWS S3)

To switch from local disk storage (`./uploads`) to Cloudflare R2 or Amazon S3, set the environment variables in `backend/`:

```bash
STORAGE_TYPE=s3
S3_BUCKET_NAME=ddu-paperhub
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
AWS_REGION=auto
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
```
