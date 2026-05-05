CREATE TABLE beta_testers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    profession TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);