-- ============================================================================
-- DDUPaperHub — Supabase PostgreSQL Schema
-- ============================================================================
-- This schema mirrors the JPA entity model exactly so the Spring Boot app can
-- boot against it with hibernate.ddl-auto=update (no drift, no migrations).
--
-- Run ONCE in the Supabase SQL Editor (Dashboard → SQL → paste & run).
-- It is idempotent: uses CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS.
--
-- Tables (in FK-safe order):
--   users -> departments -> subjects -> papers -> bookmarks -> reports -> audit_logs
-- ============================================================================

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(150)    NOT NULL UNIQUE,
    password    VARCHAR         NOT NULL,
    role        VARCHAR(30)     NOT NULL,
    enabled     BOOLEAN         NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- departments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id      BIGSERIAL PRIMARY KEY,
    name    VARCHAR(100) NOT NULL UNIQUE,
    code    VARCHAR(20)  NOT NULL UNIQUE
);

-- ---------------------------------------------------------------------------
-- subjects
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(150)   NOT NULL,
    code            VARCHAR(50)    NOT NULL,
    semester        INTEGER        NOT NULL,
    department_id   BIGINT         NOT NULL REFERENCES departments(id)
);

-- ---------------------------------------------------------------------------
-- papers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS papers (
    id                  BIGSERIAL PRIMARY KEY,
    title               VARCHAR(200)   NOT NULL,
    description         TEXT,
    resource_type       VARCHAR(30)    NOT NULL,
    exam_year           INTEGER        NOT NULL,
    subject_id          BIGINT         NOT NULL REFERENCES subjects(id),
    uploader_id         BIGINT         NOT NULL REFERENCES users(id),
    status              VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    rejection_reason    TEXT,
    file_key            VARCHAR(255)   NOT NULL,
    thumbnail_key       VARCHAR(255),
    file_name           VARCHAR(255)   NOT NULL,
    file_size_bytes     BIGINT         NOT NULL,
    content_type        VARCHAR(100)   NOT NULL DEFAULT 'application/pdf',
    download_count      BIGINT         NOT NULL DEFAULT 0,
    view_count          BIGINT         NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT now(),
    reviewed_at         TIMESTAMPTZ,
    reviewed_by_id      BIGINT         REFERENCES users(id),

    -- Covers every ResourceType enum value (including legacy aliases).
    -- This replaces the old papers_resource_type_check constraint that the
    -- DataInitializer had to drop via raw SQL on older databases.
    CONSTRAINT papers_resource_type_check CHECK (resource_type IN (
        'SESSIONAL_1', 'SESSIONAL_2', 'SESSIONAL_3', 'EXTERNAL', 'REMEDIAL',
        'LAB_MANUAL', 'LECTURE_NOTES', 'MID_SEM_1', 'MID_SEM_2', 'END_SEM', 'OTHER'
    ))
);

CREATE INDEX IF NOT EXISTS idx_paper_status ON papers(status);
CREATE INDEX IF NOT EXISTS idx_paper_subject ON papers(subject_id);
CREATE INDEX IF NOT EXISTS idx_paper_year ON papers(exam_year);

-- ---------------------------------------------------------------------------
-- bookmarks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookmarks (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id),
    paper_id    BIGINT NOT NULL REFERENCES papers(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, paper_id)
);

-- ---------------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
    id          BIGSERIAL PRIMARY KEY,
    paper_id    BIGINT NOT NULL REFERENCES papers(id),
    reporter_id BIGINT NOT NULL REFERENCES users(id),
    reason      VARCHAR(1000) NOT NULL,
    status      VARCHAR(30)    NOT NULL DEFAULT 'OPEN',
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- audit_logs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    action          VARCHAR(50)    NOT NULL,
    actor_email     VARCHAR(150)   NOT NULL,
    target_resource VARCHAR(200),
    details         TEXT,
    ip_address      VARCHAR(50),
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_email);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- ---------------------------------------------------------------------------
-- updated_at trigger (mirrors Hibernate @UpdateTimestamp on User.updatedAt)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();