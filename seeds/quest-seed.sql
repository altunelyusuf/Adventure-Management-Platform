-- Quest Service Seed Data
-- Creates 50 sample quests with checkpoints

DO $$
DECLARE
    quest_id UUID;
    creator_id UUID;
    i INT;
    j INT;
    cities TEXT[] := ARRAY['San Francisco', 'New York', 'London', 'Tokyo', 'Paris', 'Sydney'];
    difficulties TEXT[] := ARRAY['easy', 'medium', 'hard', 'expert'];
    quest_title TEXT;
BEGIN
    -- Get a sample creator ID from auth service (assumes auth-seed.sql has been run)
    SELECT user_id INTO creator_id FROM auth.users WHERE role = 'creator' LIMIT 1;
    
    -- Create 50 quests
    FOR i IN 1..50 LOOP
        quest_id := gen_random_uuid();
        quest_title := cities[1 + (i % array_length(cities, 1))] || ' Adventure ' || i;
        
        INSERT INTO quests.quests (
            quest_id,
            title,
            description,
            difficulty,
            estimated_duration,
            total_distance,
            xp_reward,
            status,
            creator_id,
            created_at,
            updated_at
        ) VALUES (
            quest_id,
            quest_title,
            'Explore the hidden gems of ' || cities[1 + (i % array_length(cities, 1))] || '. Complete checkpoints to finish this adventure!',
            difficulties[1 + (i % array_length(difficulties, 1))],
            30 + (i % 120), -- 30-150 minutes
            2.5 + (i % 10), -- 2.5-12.5 km
            50 + (i * 10), -- XP scales with quest number
            CASE WHEN i % 10 = 0 THEN 'pending' ELSE 'approved' END,
            creator_id,
            NOW() - (random() * INTERVAL '60 days'),
            NOW() - (random() * INTERVAL '30 days')
        );
        
        -- Create 3-7 checkpoints for each quest
        FOR j IN 1..(3 + (i % 5)) LOOP
            INSERT INTO quests.checkpoints (
                checkpoint_id,
                quest_id,
                name,
                description,
                latitude,
                longitude,
                order_index,
                radius,
                points,
                hint,
                created_at
            ) VALUES (
                gen_random_uuid(),
                quest_id,
                'Checkpoint ' || j,
                'Complete this checkpoint by reaching the location',
                37.7749 + (random() * 0.1 - 0.05), -- San Francisco area
                -122.4194 + (random() * 0.1 - 0.05),
                j,
                50,
                10 + (j * 5),
                'Look for the landmark',
                NOW() - (random() * INTERVAL '60 days')
            );
        END LOOP;
    END LOOP;
END $$;

-- Output summary
SELECT 
    difficulty,
    COUNT(*) as quest_count,
    AVG(estimated_duration)::INT as avg_duration_minutes,
    AVG(total_distance)::NUMERIC(10,2) as avg_distance_km
FROM quests.quests
GROUP BY difficulty
ORDER BY 
    CASE difficulty
        WHEN 'easy' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'hard' THEN 3
        WHEN 'expert' THEN 4
    END;

SELECT COUNT(*) as total_checkpoints FROM quests.checkpoints;
