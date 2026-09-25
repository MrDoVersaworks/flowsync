-- Refuse to hide duplicate membership state behind a non-unique table.
DELETE FROM workspace_members a
USING workspace_members b
WHERE a.ctid < b.ctid
  AND a.user_id = b.user_id
  AND a.workspace_id = b.workspace_id;

ALTER TABLE workspace_members
  ADD CONSTRAINT workspace_members_pk PRIMARY KEY (user_id, workspace_id);

ALTER TABLE platform_reviews
  ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS refresh_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash varchar(64) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS refresh_sessions_user_id_idx ON refresh_sessions(user_id);

UPDATE users SET email = lower(trim(email)) WHERE email <> lower(trim(email));

DO $$
BEGIN
  IF EXISTS (
    SELECT lower(email)
    FROM users
    GROUP BY lower(email)
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Case-insensitive duplicate user emails exist; resolve them before completing FlowSync security migration';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique_idx ON users (lower(email));

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workspace_members_role_check') THEN
    ALTER TABLE workspace_members ADD CONSTRAINT workspace_members_role_check CHECK (role IN ('member', 'viewer', 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_priority_check') THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'platform_reviews_rating_check') THEN
    ALTER TABLE platform_reviews ADD CONSTRAINT platform_reviews_rating_check CHECK (rating BETWEEN 1 AND 5);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  bucket_key varchar(255) NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket_key, window_start)
);
