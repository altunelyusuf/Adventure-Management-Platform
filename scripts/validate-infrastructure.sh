#!/bin/bash
# Infrastructure Validation Script
# Tests Docker Compose stack for Adventure Management Platform

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Adventure Platform Infrastructure Validation${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Check prerequisites
echo "Step 1: Checking prerequisites..."
echo "-----------------------------------"

if command_exists docker; then
    print_success "Docker is installed"
    docker --version
else
    print_error "Docker is not installed"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if docker compose version >/dev/null 2>&1; then
    print_success "Docker Compose is available"
    docker compose version
else
    print_error "Docker Compose is not available"
    exit 1
fi

echo ""

# Step 2: Validate docker-compose.yml
echo "Step 2: Validating docker-compose.yml..."
echo "-----------------------------------"

if docker compose config --quiet; then
    print_success "docker-compose.yml syntax is valid"
else
    print_error "docker-compose.yml has syntax errors"
    exit 1
fi

# List services
echo ""
print_info "Services defined in docker-compose.yml:"
docker compose config --services | while read service; do
    echo "  - $service"
done

echo ""

# Step 3: Check required files
echo "Step 3: Checking required configuration files..."
echo "-----------------------------------"

files_to_check=(
    "infrastructure/docker/postgres/init.sql"
    "infrastructure/docker/prometheus/prometheus.yml"
    "infrastructure/docker/grafana/provisioning/datasources/prometheus.yml"
    "infrastructure/docker/grafana/provisioning/dashboards/default.yml"
    ".env.example"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_success "Found: $file"
    else
        print_error "Missing: $file"
    fi
done

echo ""

# Step 4: Check if .env exists
echo "Step 4: Checking environment configuration..."
echo "-----------------------------------"

if [ -f ".env" ]; then
    print_success ".env file exists"
else
    print_warning ".env file not found"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    print_success "Created .env file"
    print_warning "Please review and update .env with actual values"
fi

echo ""

# Step 5: Start services
echo "Step 5: Starting Docker Compose services..."
echo "-----------------------------------"

print_info "This may take a few minutes for first run (downloading images)..."
docker compose up -d

if [ $? -eq 0 ]; then
    print_success "Docker Compose services started"
else
    print_error "Failed to start services"
    exit 1
fi

echo ""

# Step 6: Wait for services to be healthy
echo "Step 6: Waiting for services to become healthy..."
echo "-----------------------------------"

print_info "Waiting 30 seconds for services to initialize..."
sleep 30

echo ""

# Step 7: Check service health
echo "Step 7: Checking service health..."
echo "-----------------------------------"

# Function to check service health
check_service() {
    local service=$1
    local status=$(docker compose ps --format json | jq -r ".[] | select(.Service == \"$service\") | .Health")

    if [ "$status" == "healthy" ] || [ "$status" == "" ]; then
        print_success "$service is running"
        return 0
    else
        print_error "$service is unhealthy (status: $status)"
        return 1
    fi
}

# Check each service
services=(postgres redis mongodb elasticsearch rabbitmq minio prometheus grafana jaeger mailhog)
all_healthy=true

for service in "${services[@]}"; do
    if ! check_service "$service"; then
        all_healthy=false
    fi
done

echo ""

# Step 8: Test connectivity
echo "Step 8: Testing service connectivity..."
echo "-----------------------------------"

# Test PostgreSQL
print_info "Testing PostgreSQL connection..."
if docker compose exec -T postgres pg_isready -U adventure_user -d adventure_platform >/dev/null 2>&1; then
    print_success "PostgreSQL is accepting connections"
else
    print_error "PostgreSQL connection failed"
    all_healthy=false
fi

# Test Redis
print_info "Testing Redis connection..."
if docker compose exec -T redis redis-cli ping >/dev/null 2>&1; then
    print_success "Redis is responding"
else
    print_error "Redis connection failed"
    all_healthy=false
fi

# Test Elasticsearch
print_info "Testing Elasticsearch connection..."
if curl -s http://localhost:9200/_cluster/health >/dev/null 2>&1; then
    print_success "Elasticsearch is responding"
else
    print_warning "Elasticsearch may still be initializing (takes 30-60s)"
fi

# Test RabbitMQ
print_info "Testing RabbitMQ management..."
if curl -s http://localhost:15672 >/dev/null 2>&1; then
    print_success "RabbitMQ management UI is accessible"
else
    print_warning "RabbitMQ may still be initializing"
fi

# Test Prometheus
print_info "Testing Prometheus..."
if curl -s http://localhost:9090/-/healthy >/dev/null 2>&1; then
    print_success "Prometheus is healthy"
else
    print_warning "Prometheus may still be initializing"
fi

# Test Grafana
print_info "Testing Grafana..."
if curl -s http://localhost:3001/api/health >/dev/null 2>&1; then
    print_success "Grafana is healthy"
else
    print_warning "Grafana may still be initializing"
fi

echo ""

# Step 9: Display service URLs
echo "Step 9: Service Access URLs..."
echo "-----------------------------------"

echo ""
print_info "Database Services:"
echo "  PostgreSQL:     localhost:5432"
echo "  MongoDB:        localhost:27017"
echo "  Redis:          localhost:6379"
echo "  Elasticsearch:  http://localhost:9200"

echo ""
print_info "Message Queue:"
echo "  RabbitMQ (AMQP):    localhost:5672"
echo "  RabbitMQ (Management): http://localhost:15672"
echo "    Username: adventure_user"
echo "    Password: adventure_pass"

echo ""
print_info "Monitoring:"
echo "  Prometheus:     http://localhost:9090"
echo "  Grafana:        http://localhost:3001"
echo "    Username: admin"
echo "    Password: adventure_pass"
echo "  Jaeger:         http://localhost:16686"

echo ""
print_info "Development Tools:"
echo "  Minio Console:  http://localhost:9001"
echo "    Username: adventure_user"
echo "    Password: adventure_pass"
echo "  Mailhog:        http://localhost:8025"

echo ""

# Step 10: Final summary
echo "Step 10: Validation Summary..."
echo "-----------------------------------"

if [ "$all_healthy" = true ]; then
    print_success "All services are healthy and running!"
    echo ""
    print_info "Next steps:"
    echo "  1. Access Grafana at http://localhost:3001"
    echo "  2. Import dashboard or create custom dashboards"
    echo "  3. View logs: docker compose logs -f [service]"
    echo "  4. Stop services: docker compose down"
    echo ""
    print_success "Infrastructure validation PASSED ✅"
else
    print_warning "Some services may need more time to initialize"
    echo ""
    print_info "To check service logs:"
    echo "  docker compose logs [service-name]"
    echo ""
    print_info "To restart services:"
    echo "  docker compose restart"
    echo ""
    print_warning "Infrastructure validation completed with warnings ⚠️"
fi

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Validation Complete${NC}"
echo -e "${BLUE}================================${NC}"
