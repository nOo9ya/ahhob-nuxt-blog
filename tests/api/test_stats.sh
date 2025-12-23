#!/bin/bash

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE_URL="http://localhost:3000"
COOKIE_FILE="$SCRIPT_DIR/cookies.txt"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "========================================"
echo "   Stats API Test"
echo "========================================"

# 1. Login as Admin
echo -e "\n1. Logging in as Admin..."
curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com", "password":"admin123!"}' \
  -c $COOKIE_FILE
echo "Login completed."

# 2. Get Stats
echo -e "\n2. Fetching Stats..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/stats" \
  -b $COOKIE_FILE)

echo "Response: $RESPONSE"

# 3. Verify
if [[ $RESPONSE == *"success"* ]] && [[ $RESPONSE == *"totalUsers"* ]]; then
    echo -e "\n${GREEN}✅ Stats Test PASSED${NC}"
else
    echo -e "\n${RED}❌ Stats Test FAILED${NC}"
    rm $COOKIE_FILE
    exit 1
fi

# 4. Logout (Cleanup)
echo -e "\n3. Logging out..."
curl -s -X POST "$BASE_URL/api/auth/logout" -b $COOKIE_FILE
rm $COOKIE_FILE

echo -e "\nTest completed."
