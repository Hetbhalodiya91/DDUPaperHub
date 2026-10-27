# DDUPaperHub Backend (Spring Boot 3 + Java 21)

Production-ready REST API backend for **DDUPaperHub**, the Dharmsinh Desai University academic resource and previous-year paper portal.

---

## 🛠️ Tech Stack & Key Features
- **Java 21** & **Spring Boot 3.3.5**
- **Spring Security 6** with **Stateless JWT** (Bearer token authentication)
- **Role-Based Access Control (RBAC)**:
  - `ROLE_STUDENT` (default on registration)
  - `ROLE_CONTRIBUTOR` (can upload and track submissions)
  - `ROLE_ADMIN` (can review papers, assign roles, manage users & reports)
- **Spring Data JPA & Hibernate** with support for **PostgreSQL** (production) and **H2** (zero-config local dev)
- **Flexible Object Storage**:
  - `LocalFileStorageService` (stores in `./uploads` for local dev)
  - `S3FileStorageService` (compatible with **Cloudflare R2** and **AWS S3** via AWS SDK v2)
- **Automated Data Seeder** (`DataInitializer`): Pre-populates DDU engineering departments (CE, IT, EC, CH, MH, CL), semesters, standard subjects, test users, and a sample approved paper with PDF.

---

## 🚀 Quick Start

### Option A: Run with In-Memory H2 Database (Zero configuration needed)
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```
- Server starts at `http://localhost:8080`
- H2 Console available at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:paperhub`, User: `sa`, Password: blank)

### Option B: Run with PostgreSQL (Docker Compose)
1. Start PostgreSQL:
   ```bash
   docker compose up -d
   ```
2. Run backend:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

---

## 👥 Pre-seeded Default Accounts

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | `admin@ddu.ac.in` | `Admin@123` | Full access, review queue, assign user roles |
| **Contributor** | `contributor@ddu.ac.in` | `Contributor@123` | Upload papers, track own submissions |
| **Student** | `student@ddu.ac.in` | `Student@123` | Search, preview, download, report files |

---

## 📡 REST API Reference

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user (`ROLE_STUDENT` default)
- `POST /api/auth/login` - Authenticate with email & password, returns JWT
- `GET /api/auth/me` - Get current user profile (requires `Bearer <token>`)

### 2. Academic Resources & Papers (`/api/papers`)
- `GET /api/papers/search` - Search & filter approved papers (Public)
  - Query params: `departmentId`, `semester`, `subjectId`, `resourceType`, `examYear`, `keyword`, `page`, `size`
- `GET /api/papers/{id}` - Get resource metadata (Public)
- `GET /api/papers/{id}/preview` - Stream PDF for in-browser preview (Public)
- `GET /api/papers/{id}/download` - Download PDF attachment (Public, increments download counter)
- `POST /api/papers/upload` - Upload a paper (Multipart: title, description, resourceType, examYear, subjectId, file) (`CONTRIBUTOR`, `ADMIN`)
- `GET /api/papers/my-submissions` - View own uploaded papers and review statuses (`CONTRIBUTOR`, `ADMIN`)
- `DELETE /api/papers/{id}` - Delete submission (Uploader if pending, or Admin)
- `GET /api/papers/stats` - Public resource counts (approved, pending, etc.)

### 3. Departments & Subjects
- `GET /api/departments` - List all departments (CE, IT, EC, CH, MH, CL)
- `GET /api/subjects?departmentId={id}&semester={sem}` - Filter subjects by department and semester

### 4. Admin Management (`/api/admin`) - Requires `ROLE_ADMIN`
- `GET /api/admin/papers/review-queue?status=PENDING` - Review pending uploads
- `PUT /api/admin/papers/{id}/review` - Approve or reject paper (`{"status": "APPROVED" | "REJECTED", "rejectionReason": "..."}`)
- `DELETE /api/admin/papers/{id}` - Remove inappropriate resource
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/{id}/role` - Assign or change user role (`{"role": "ROLE_CONTRIBUTOR" | "ROLE_STUDENT" | "ROLE_ADMIN"}`)
- `PUT /api/admin/users/{id}/status?enabled=true|false` - Enable/disable account
- `GET /api/admin/reports` - View student error reports
- `PUT /api/admin/reports/{id}/status?status=RESOLVED|DISMISSED` - Resolve report
- `GET /api/admin/dashboard` - Admin dashboard summary stats

### 5. Student Reports (`/api/reports`)
- `POST /api/reports` - Report incorrect or damaged file (`{"paperId": 1, "reason": "Missing questions 4 to 6"}`)

---

## ☁️ Cloud Object Storage Configuration (Cloudflare R2 / AWS S3)

To store PDFs in Cloudflare R2 or Amazon S3 instead of local disk, set the following environment variables:

```bash
STORAGE_TYPE=s3
S3_BUCKET_NAME=ddu-paperhub
S3_ENDPOINT=https://<your-cloudflare-account-id>.r2.cloudflarestorage.com
AWS_REGION=auto
AWS_ACCESS_KEY_ID=<your-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
```
