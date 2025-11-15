#!/bin/bash

# Adventure Management Platform - Master Seed Script
# Seeds all databases with test data

set -e

echo "🌱 Starting database seeding..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Wait for PostgreSQL to be ready
echo -e "${BLUE}Waiting for PostgreSQL...${NC}"
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -c '\q'; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done
echo -e "${GREEN}✓ PostgreSQL is ready${NC}"

# Seed Auth Service
echo -e "${BLUE}Seeding Auth Service...${NC}"
PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d adventure_auth -f /seeds/auth-seed.sql
echo -e "${GREEN}✓ Auth Service seeded${NC}"

# Seed Quest Service
echo -e "${BLUE}Seeding Quest Service...${NC}"
PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d adventure_quests -f /seeds/quest-seed.sql
echo -e "${GREEN}✓ Quest Service seeded${NC}"

# Seed Profile Service
echo -e "${BLUE}Seeding Profile Service...${NC}"
PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d adventure_profiles -f /seeds/profile-seed.sql
echo -e "${GREEN}✓ Profile Service seeded${NC}"

# Seed Gamification Service
echo -e "${BLUE}Seeding Gamification Service...${NC}"
PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d adventure_gamification -f /seeds/gamification-seed.sql
echo -e "${GREEN}✓ Gamification Service seeded${NC}"

# Seed Social Service
echo -e "${BLUE}Seeding Social Service...${NC}"
PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d adventure_social -f /seeds/social-seed.sql
echo -e "${GREEN}✓ Social Service seeded${NC}"

echo -e "${GREEN}🎉 All databases seeded successfully!${NC}"
