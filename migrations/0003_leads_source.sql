-- Which form a lead came from, so the admin inbox can tell them apart.
-- source: 'test_drive' (Đăng ký lái thử — every lead before this migration) | 'quote' (popup Nhận báo giá)
-- 🔴 Run with --remote BEFORE deploying the Worker that writes this column.

ALTER TABLE leads ADD COLUMN source TEXT NOT NULL DEFAULT 'test_drive';

CREATE INDEX IF NOT EXISTS idx_leads_source ON leads (source);
