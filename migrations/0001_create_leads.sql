-- Lead capture for the "Tư vấn miễn phí" consultation modal.
-- Inserted by the Worker at POST /api/leads.

CREATE TABLE IF NOT EXISTS leads (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  name       TEXT    NOT NULL,
  phone      TEXT    NOT NULL,
  note       TEXT,
  -- Provenance / anti-spam fields (filled by the Worker, never trust client)
  ip         TEXT,
  country    TEXT,
  user_agent TEXT,
  referer    TEXT
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_phone      ON leads (phone);
