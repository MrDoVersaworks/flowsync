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
