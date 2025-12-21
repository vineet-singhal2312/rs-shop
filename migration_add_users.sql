-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a default admin user (password: adminrs321)
-- Password hash generated using bcrypt with 10 rounds
INSERT INTO users (username, password_hash) 
VALUES ('adminrs', '$2b$10$Jf5xXzKN37fKATwgQVkNUOsUbEPtkoB3aUTUFZJRBAVJVmtp80h5O')
ON CONFLICT (username) DO NOTHING;

-- Note: You should change this password after first login
-- To generate a new password hash, you can use bcrypt online or in Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = bcrypt.hashSync('your-password', 10);
