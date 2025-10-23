#!/bin/bash
# Quick Health Check Script
# Checks status of all Docker Compose services

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Adventure Platform - Service Health Check"
echo "=========================================="
echo ""

# Check if Docker Compose is running
if ! docker compose ps >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker Compose services are not running${NC}"
    echo "Run: docker compose up -d"
    exit 1
fi

# Function to check service
check_service() {
    local service=$1
    local port=$2
    local description=$3

    # Check if container is running
    if docker compose ps --format json | jq -e ".[] | select(.Service == \"$service\" and .State == \"running\")" >/dev/null 2>&1; then
        echo -e "${GREEN}✅${NC} $description ($service) - Running"
    else
        echo -e "${RED}❌${NC} $description ($service) - Not running"
    fi
}

# Check each service
echo "Core Databases:"
check_service "postgres" "5432" "PostgreSQL"
check_service "mongodb" "27017" "MongoDB"
check_service "redis" "6379" "Redis"
check_service "elasticsearch" "9200" "Elasticsearch"

echo ""
echo "Message Queue:"
check_service "rabbitmq" "5672" "RabbitMQ"

echo ""
echo "Object Storage:"
check_service "minio" "9000" "Minio"

echo ""
echo "Monitoring:"
check_service "prometheus" "9090" "Prometheus"
check_service "grafana" "3001" "Grafana"
check_service "jaeger" "16686" "Jaeger"

echo ""
echo "Development Tools:"
check_service "mailhog" "8025" "Mailhog"

echo ""
echo "=========================================="

# Quick connectivity tests
echo ""
echo "Connectivity Tests:"

# PostgreSQL
if docker compose exec -T postgres pg_isready -U adventure_user >/dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} PostgreSQL - Accepting connections"
else
    echo -e "${RED}❌${NC} PostgreSQL - Connection failed"
fi

# Redis
if docker compose exec -T redis redis-cli ping | grep -q PONG 2>/dev/null; then
    echo -e "${GREEN}✅${NC} Redis - Responding"
else
    echo -e "${RED}❌${NC} Redis - Connection failed"
fi

# Elasticsearch (may take longer to start)
if curl -s http://localhost:9200 >/dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} Elasticsearch - Responding"
else
    echo -e "${YELLOW}⚠️${NC}  Elasticsearch - May still be initializing"
fi

# Prometheus
if curl -s http://localhost:9090/-/healthy >/dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} Prometheus - Healthy"
else
    echo -e "${YELLOW}⚠️${NC}  Prometheus - May still be initializing"
fi

echo ""
echo "=========================================="
echo ""
echo "View logs: docker compose logs -f [service]"
echo "Restart services: docker compose restart"
echo "Stop services: docker compose down"
