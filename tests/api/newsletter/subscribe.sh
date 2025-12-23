#!/bin/bash

# Configuration
API_URL="http://localhost:3000/api/newsletter/subscribe"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🚀 Starting Newsletter API Tests..."
echo "Target URL: $API_URL"
echo ""

# Function to run test
run_test() {
    local description=$1
    local email=$2
    local expected_status=$3
    
    echo -n "Testing $description ($email)... "
    
    # Run curl and capture HTTP status code
    response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\"}")
    
    if [ "$response" -eq "$expected_status" ]; then
        echo -e "${GREEN}PASSED ($response)${NC}"
    else
        echo -e "${RED}FAILED (Expected $expected_status, got $response)${NC}"
    fi
}

# 1. Test Valid Subscription
# Generate random email to ensure success
RANDOM_EMAIL="test_$(date +%s)@example.com"
run_test "Valid New Subscription" "$RANDOM_EMAIL" 200

# 2. Test Duplicate Subscription
# Re-use the same email, should still return 200 with different message (but status code checks connection)
run_test "Duplicate Subscription" "$RANDOM_EMAIL" 200

# 3. Test Invalid Email format
run_test "Invalid Email Format" "not-an-email" 400

# 4. Test Empty Email
run_test "Empty Email" "" 400

echo ""
echo "✅ Tests Completed."
