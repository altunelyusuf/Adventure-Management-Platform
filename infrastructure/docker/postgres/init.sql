-- PostgreSQL Initialization Script for Adventure Management Platform
-- This script creates the initial database schema and tables

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search similarity

-- Create schemas for different services
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS quests;
CREATE SCHEMA IF NOT EXISTS gamification;
CREATE SCHEMA IF NOT EXISTS social;
CREATE SCHEMA IF NOT EXISTS creator;
CREATE SCHEMA IF NOT EXISTS streaming;
CREATE SCHEMA IF NOT EXISTS notifications;

-- =====================================================
-- AUTH SCHEMA
-- =====================================================

-- Users table (authentication)
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT check_role CHECK (role IN ('user', 'creator', 'moderator', 'admin', 'super_admin'))
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS auth.password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    used BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- USERS SCHEMA
-- =====================================================

-- User profiles
CREATE TABLE IF NOT EXISTS users.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(500),
    bio TEXT,
    date_of_birth DATE,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User preferences
CREATE TABLE IF NOT EXISTS users.preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    privacy_level VARCHAR(20) DEFAULT 'public',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_privacy CHECK (privacy_level IN ('public', 'friends_only', 'private'))
);

-- =====================================================
-- QUESTS SCHEMA
-- =====================================================

-- Quests
CREATE TABLE IF NOT EXISTS quests.quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES auth.users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20) NOT NULL,
    state VARCHAR(20) NOT NULL DEFAULT 'draft',
    xp_reward INTEGER DEFAULT 0,
    estimated_duration INTEGER, -- in minutes
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT check_difficulty CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
    CONSTRAINT check_state CHECK (state IN ('draft', 'published', 'active', 'completed', 'archived'))
);

-- Checkpoints
CREATE TABLE IF NOT EXISTS quests.checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_id UUID NOT NULL REFERENCES quests.quests(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location_lat DECIMAL(10, 8) NOT NULL,
    location_lng DECIMAL(11, 8) NOT NULL,
    validation_type VARCHAR(20) NOT NULL DEFAULT 'gps',
    validation_radius INTEGER DEFAULT 50, -- meters
    xp_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_validation_type CHECK (validation_type IN ('gps', 'photo', 'qr_code', 'ar_marker'))
);

-- Quest participations
CREATE TABLE IF NOT EXISTS quests.participations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_id UUID NOT NULL REFERENCES quests.quests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'started',
    progress INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT check_status CHECK (status IN ('started', 'in_progress', 'completed', 'abandoned')),
    UNIQUE(quest_id, user_id)
);

-- Checkpoint completions
CREATE TABLE IF NOT EXISTS quests.checkpoint_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participation_id UUID NOT NULL REFERENCES quests.participations(id) ON DELETE CASCADE,
    checkpoint_id UUID NOT NULL REFERENCES quests.checkpoints(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    proof_url VARCHAR(500), -- Photo or other proof
    validated BOOLEAN DEFAULT FALSE,
    validation_method VARCHAR(20),
    UNIQUE(participation_id, checkpoint_id)
);

-- =====================================================
-- GAMIFICATION SCHEMA
-- =====================================================

-- Player stats
CREATE TABLE IF NOT EXISTS gamification.player_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    rank VARCHAR(50) DEFAULT 'Novice',
    quests_completed INTEGER DEFAULT 0,
    checkpoints_completed INTEGER DEFAULT 0,
    achievements_unlocked INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Achievements
CREATE TABLE IF NOT EXISTS gamification.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    criteria TEXT NOT NULL,
    xp_reward INTEGER DEFAULT 0,
    rarity VARCHAR(20) DEFAULT 'common',
    icon_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_rarity CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary'))
);

-- User badges (achievement unlocks)
CREATE TABLE IF NOT EXISTS gamification.badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES gamification.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- =====================================================
-- SOCIAL SCHEMA
-- =====================================================

-- Friendships
CREATE TABLE IF NOT EXISTS social.friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id_1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id_2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT check_friendship_status CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    CONSTRAINT check_different_users CHECK (user_id_1 != user_id_2),
    UNIQUE(user_id_1, user_id_2)
);

-- Teams
CREATE TABLE IF NOT EXISTS social.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    leader_id UUID NOT NULL REFERENCES auth.users(id),
    max_members INTEGER DEFAULT 10,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Team members
CREATE TABLE IF NOT EXISTS social.team_members (
    team_id UUID NOT NULL REFERENCES social.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, user_id),
    CONSTRAINT check_team_role CHECK (role IN ('leader', 'officer', 'member'))
);

-- =====================================================
-- CREATOR SCHEMA
-- =====================================================

-- Creator accounts
CREATE TABLE IF NOT EXISTS creator.creators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier VARCHAR(20) DEFAULT 'bronze',
    status VARCHAR(20) DEFAULT 'pending',
    subscriber_count INTEGER DEFAULT 0,
    total_revenue DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_tier CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    CONSTRAINT check_creator_status CHECK (status IN ('pending', 'active', 'suspended', 'deactivated'))
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS creator.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES creator.creators(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL DEFAULT 'basic',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_subscription_tier CHECK (tier IN ('free', 'basic', 'pro', 'elite')),
    CONSTRAINT check_subscription_status CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
    UNIQUE(user_id, creator_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Auth indexes
CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_users_username ON auth.users(username);
CREATE INDEX idx_refresh_tokens_user_id ON auth.refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON auth.refresh_tokens(expires_at);

-- Quests indexes
CREATE INDEX idx_quests_creator_id ON quests.quests(creator_id);
CREATE INDEX idx_quests_state ON quests.quests(state);
CREATE INDEX idx_quests_difficulty ON quests.quests(difficulty);
CREATE INDEX idx_checkpoints_quest_id ON quests.checkpoints(quest_id);
CREATE INDEX idx_participations_user_id ON quests.participations(user_id);
CREATE INDEX idx_participations_quest_id ON quests.participations(quest_id);
CREATE INDEX idx_participations_status ON quests.participations(status);

-- Gamification indexes
CREATE INDEX idx_badges_user_id ON gamification.badges(user_id);
CREATE INDEX idx_badges_achievement_id ON gamification.badges(achievement_id);

-- Social indexes
CREATE INDEX idx_friendships_user_id_1 ON social.friendships(user_id_1);
CREATE INDEX idx_friendships_user_id_2 ON social.friendships(user_id_2);
CREATE INDEX idx_friendships_status ON social.friendships(status);
CREATE INDEX idx_team_members_user_id ON social.team_members(user_id);

-- Creator indexes
CREATE INDEX idx_creators_user_id ON creator.creators(user_id);
CREATE INDEX idx_subscriptions_user_id ON creator.subscriptions(user_id);
CREATE INDEX idx_subscriptions_creator_id ON creator.subscriptions(creator_id);
CREATE INDEX idx_subscriptions_status ON creator.subscriptions(status);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON users.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON quests.quests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_stats_updated_at BEFORE UPDATE ON gamification.player_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions (adjust based on your user setup)
GRANT USAGE ON SCHEMA auth, users, quests, gamification, social, creator, streaming, notifications TO adventure_user;
GRANT ALL ON ALL TABLES IN SCHEMA auth, users, quests, gamification, social, creator, streaming, notifications TO adventure_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth, users, quests, gamification, social, creator, streaming, notifications TO adventure_user;

-- =====================================================
-- SEED DATA (Optional - for development)
-- =====================================================

-- Insert sample admin user (password: admin123 - CHANGE IN PRODUCTION!)
-- Password hash for 'admin123' using bcrypt
INSERT INTO auth.users (id, email, username, password_hash, role, email_verified, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@adventure-platform.com',
    'admin',
    '$2b$10$YourHashedPasswordHere', -- Replace with actual hash
    'super_admin',
    TRUE,
    TRUE
) ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully!';
    RAISE NOTICE 'Schemas created: auth, users, quests, gamification, social, creator, streaming, notifications';
    RAISE NOTICE 'Ready for application deployment.';
END $$;
