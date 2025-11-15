-- Auth Service Seed Data
-- Creates 100 test users with different roles

DO $$
DECLARE
    i INT;
    email VARCHAR;
    hashed_password VARCHAR;
BEGIN
    -- Password: 'password123' (bcrypt hashed)
    hashed_password := '$2b$10$rGHvQZv8z9YqN2fJ7xZ7YeC5LqGxK4KxL3Q3Z3Z3Z3Z3Z3Z3Z3Z3Z';
    
    -- Create admin user
    INSERT INTO auth.users (user_id, email, password_hash, role, is_active, email_verified, created_at)
    VALUES (
        gen_random_uuid(),
        'admin@adventure-platform.com',
        hashed_password,
        'admin',
        true,
        true,
        NOW()
    );
    
    -- Create quest creator
    INSERT INTO auth.users (user_id, email, password_hash, role, is_active, email_verified, created_at)
    VALUES (
        gen_random_uuid(),
        'creator@adventure-platform.com',
        hashed_password,
        'creator',
        true,
        true,
        NOW()
    );
    
    -- Create 98 regular users
    FOR i IN 1..98 LOOP
        email := 'user' || i || '@test.com';
        INSERT INTO auth.users (user_id, email, password_hash, role, is_active, email_verified, created_at, last_login)
        VALUES (
            gen_random_uuid(),
            email,
            hashed_password,
            CASE WHEN i % 10 = 0 THEN 'creator' ELSE 'user' END,
            true,
            CASE WHEN i % 5 = 0 THEN false ELSE true END,
            NOW() - (random() * INTERVAL '90 days'),
            CASE WHEN i % 3 = 0 THEN NOW() - (random() * INTERVAL '7 days') ELSE NULL END
        );
    END LOOP;
END $$;

-- Output summary
SELECT 
    role, 
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE email_verified = true) as verified,
    COUNT(*) FILTER (WHERE is_active = true) as active
FROM auth.users
GROUP BY role;
