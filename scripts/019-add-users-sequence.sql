
-- Create sequence for users table
CREATE SEQUENCE IF NOT EXISTS users_id_seq
    START WITH 4  -- Start after the last inserted ID (3)
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Alter the users table to use the sequence as default for id
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');

-- Update the sequence to the current max id value
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users), true);
