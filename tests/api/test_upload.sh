#!/bin/bash

# Configuration
# Get the directory where the script is stored
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

BASE_URL="http://localhost:3000"
COOKIE_FILE="$SCRIPT_DIR/cookies.txt"
TEST_IMAGE="$SCRIPT_DIR/test_image.jpg"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "========================================"
echo "   File Upload API Test"
echo "========================================"

# Check if test image exists
if [ ! -f "$TEST_IMAGE" ]; then
    echo "Error: Test image not found at $TEST_IMAGE"
    exit 1
fi

# 1. Login
echo -e "\n1. Logging in..."
curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com", "password":"admin123!"}' \
  -c $COOKIE_FILE
echo "Login completed."

# 2. Upload File
echo -e "\n2. Uploading file..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@$TEST_IMAGE;type=image/jpeg" \
  -b $COOKIE_FILE)

echo "Response: $RESPONSE"

# 3. Verify
if [[ $RESPONSE == *"success"* ]] && [[ $RESPONSE == *"url"* ]]; then
    echo -e "\n${GREEN}✅ Upload Test PASSED${NC}"
else
    echo -e "\n${RED}❌ Upload Test FAILED${NC}"
    exit 1
fi

echo -e "\nTest completed."
