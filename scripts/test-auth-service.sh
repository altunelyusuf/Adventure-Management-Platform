#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3001/api/v1/auth"
MAILHOG_URL="http://localhost:8025"

# Test results
PASSED=0
FAILED=0

# Helper functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_test() {
    echo -e "${YELLOW}TEST:${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓ PASS:${NC} $1"
    ((PASSED++))
}

print_fail() {
    echo -e "${RED}✗ FAIL:${NC} $1"
    ((FAILED++))
}

print_info() {
    echo -e "${BLUE}ℹ INFO:${NC} $1"
}

# Wait for service to be ready
wait_for_service() {
    print_header "Waiting for Auth Service to be ready..."

    MAX_RETRIES=30
    RETRY_COUNT=0

    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if curl -s -f "$BASE_URL/health" > /dev/null 2>&1; then
            print_success "Auth Service is ready!"
            return 0
        fi

        echo -n "."
        sleep 2
        ((RETRY_COUNT++))
    done

    print_fail "Auth Service did not become ready in time"
    exit 1
}

# Test 1: Health Check
test_health_check() {
    print_header "Test 1: Health Check"
    print_test "GET $BASE_URL/health"

    RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)

    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Health check returned 200"
        echo "Response: $BODY"
    else
        print_fail "Health check failed with status $HTTP_CODE"
        echo "Response: $BODY"
    fi
}

# Test 2: User Registration
test_registration() {
    print_header "Test 2: User Registration"
    print_test "POST $BASE_URL/register"

    # Generate unique email with timestamp
    TIMESTAMP=$(date +%s)
    TEST_EMAIL="test_${TIMESTAMP}@example.com"
    TEST_USERNAME="testuser_${TIMESTAMP}"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$TEST_EMAIL\",
            \"password\": \"TestPass123!\",
            \"username\": \"$TEST_USERNAME\"
        }")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)

    if [ "$HTTP_CODE" = "201" ]; then
        print_success "User registration successful"
        USER_ID=$(echo "$BODY" | grep -o '"userId":"[^"]*' | cut -d'"' -f4)
        echo "User ID: $USER_ID"
        echo "Email: $TEST_EMAIL"
        echo "Username: $TEST_USERNAME"

        # Save for later tests
        echo "$TEST_EMAIL" > /tmp/test_email.txt
        echo "$TEST_USERNAME" > /tmp/test_username.txt
        echo "$USER_ID" > /tmp/test_userid.txt
    else
        print_fail "Registration failed with status $HTTP_CODE"
        echo "Response: $BODY"
    fi
}

# Test 3: Check Mailhog for Verification Email
test_verification_email() {
    print_header "Test 3: Check Verification Email"
    print_test "Check Mailhog for verification email"

    sleep 2  # Wait for email to be sent

    MAILHOG_RESPONSE=$(curl -s "$MAILHOG_URL/api/v2/messages")

    if echo "$MAILHOG_RESPONSE" | grep -q "Verify Your Email"; then
        print_success "Verification email found in Mailhog"
        print_info "View emails at: $MAILHOG_URL"

        # Try to extract verification token (basic extraction)
        # Note: This is simplified - in real scenario, parse HTML properly
        echo "$MAILHOG_RESPONSE" > /tmp/mailhog_response.json
        print_info "Email response saved to /tmp/mailhog_response.json"
    else
        print_fail "Verification email not found in Mailhog"
    fi
}

# Test 4: Login Without Email Verification
test_login_unverified() {
    print_header "Test 4: Login Without Email Verification"
    print_test "POST $BASE_URL/login (should fail)"

    TEST_EMAIL=$(cat /tmp/test_email.txt 2>/dev/null || echo "test@example.com")

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$TEST_EMAIL\",
            \"password\": \"TestPass123!\"
        }")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)

    if [ "$HTTP_CODE" = "401" ] && echo "$BODY" | grep -q "verify your email"; then
        print_success "Login correctly rejected for unverified email"
    else
        print_fail "Expected 401 with email verification message, got $HTTP_CODE"
        echo "Response: $BODY"
    fi
}

# Test 5: Resend Verification Email
test_resend_verification() {
    print_header "Test 5: Resend Verification Email"
    print_test "POST $BASE_URL/resend-verification"

    TEST_EMAIL=$(cat /tmp/test_email.txt 2>/dev/null || echo "test@example.com")

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/resend-verification" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$TEST_EMAIL\"
        }")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)

    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Verification email resent successfully"
        echo "Response: $BODY"
    else
        print_fail "Resend verification failed with status $HTTP_CODE"
        echo "Response: $BODY"
    fi
}

# Test 6: Invalid Email Format
test_invalid_email() {
    print_header "Test 6: Invalid Email Format"
    print_test "POST $BASE_URL/register (invalid email)"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/register" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "invalid-email",
            "password": "TestPass123!",
            "username": "testuser"
        }')

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)

    if [ "$HTTP_CODE" = "400" ]; then
        print_success "Invalid email correctly rejected with 400"
        echo "Response: $BODY"
    else
        print_fail "Expected 400 for invalid email, got $HTTP_CODE"
        echo "Response: $BODY"
    fi
}

# Test 7: Weak Password
test_weak_password() {
    print_header "Test 7: Weak Password Validation"
    print_test "POST $BASE_URL/register (weak password)"

    TIMESTAMP=$(date +%s)

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"weak_${TIMESTAMP}@example.com\",
            \"password\": \"weak\",
            \"username\": \"weakuser_${TIMESTAMP}\"
        }")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)

    if [ "$HTTP_CODE" = "400" ]; then
        print_success "Weak password correctly rejected with 400"
        echo "Response: $BODY"
    else
        print_fail "Expected 400 for weak password, got $HTTP_CODE"
        echo "Response: $BODY"
    fi
}

# Test 8: Duplicate Email Registration
test_duplicate_email() {
    print_header "Test 8: Duplicate Email Registration"
    print_test "POST $BASE_URL/register (duplicate email)"

    TEST_EMAIL=$(cat /tmp/test_email.txt 2>/dev/null || echo "test@example.com")

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$TEST_EMAIL\",
            \"password\": \"TestPass123!\",
            \"username\": \"anotheruser\"
        }")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)

    if [ "$HTTP_CODE" = "409" ]; then
        print_success "Duplicate email correctly rejected with 409"
        echo "Response: $BODY"
    else
        print_fail "Expected 409 for duplicate email, got $HTTP_CODE"
        echo "Response: $BODY"
    fi
}

# Test 9: Forgot Password Flow
test_forgot_password() {
    print_header "Test 9: Forgot Password Flow"
    print_test "POST $BASE_URL/forgot-password"

    TEST_EMAIL=$(cat /tmp/test_email.txt 2>/dev/null || echo "test@example.com")

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/forgot-password" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$TEST_EMAIL\"
        }")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)

    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Forgot password request successful"
        echo "Response: $BODY"
        print_info "Check Mailhog at $MAILHOG_URL for reset email"
    else
        print_fail "Forgot password failed with status $HTTP_CODE"
        echo "Response: $BODY"
    fi
}

# Test 10: Invalid Login Credentials
test_invalid_login() {
    print_header "Test 10: Invalid Login Credentials"
    print_test "POST $BASE_URL/login (wrong password)"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "nonexistent@example.com",
            "password": "WrongPassword123!"
        }')

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)

    if [ "$HTTP_CODE" = "401" ]; then
        print_success "Invalid login correctly rejected with 401"
        echo "Response: $BODY"
    else
        print_fail "Expected 401 for invalid login, got $HTTP_CODE"
        echo "Response: $BODY"
    fi
}

# Print Summary
print_summary() {
    print_header "Test Summary"

    TOTAL=$((PASSED + FAILED))

    echo -e "Total Tests: $TOTAL"
    echo -e "${GREEN}Passed: $PASSED${NC}"
    echo -e "${RED}Failed: $FAILED${NC}"

    if [ $FAILED -eq 0 ]; then
        echo -e "\n${GREEN}🎉 All tests passed!${NC}"
        return 0
    else
        echo -e "\n${RED}❌ Some tests failed${NC}"
        return 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════╗"
    echo "║  Auth Service Integration Test Suite  ║"
    echo "╔════════════════════════════════════════╗"
    echo -e "${NC}"

    wait_for_service

    test_health_check
    test_registration
    test_verification_email
    test_login_unverified
    test_resend_verification
    test_invalid_email
    test_weak_password
    test_duplicate_email
    test_forgot_password
    test_invalid_login

    print_summary
    exit $?
}

# Run main
main
