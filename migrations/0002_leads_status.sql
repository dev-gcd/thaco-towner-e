-- Add lead lifecycle fields for the admin inbox.
-- status: 'new' (default) | 'contacted'

ALTER TABLE leads ADD COLUMN status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE leads ADD COLUMN updated_at TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
