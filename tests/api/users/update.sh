#!/bin/bash
COOKIE_FILE="cookies.txt"
BASE_URL="http://localhost:3000"

# 1. Login as Admin
echo "Logging in..."
curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com", "password":"admin123!"}' \
  -c $COOKIE_FILE > /dev/null

# 2. Update Self (Admin updates Admin) - Change Bio
echo -e "\n\nUpdating Admin Bio..."
curl -s -X PUT "$BASE_URL/api/users/1" \
  -H "Content-Type: application/json" \
  -d '{"bio": "Updated Bio via API", "credentials": "Supremer Admin"}' \
  -b $COOKIE_FILE

# 3. Verify Update
echo -e "\n\nVerifying Update..."
curl -s -X GET "$BASE_URL/api/users/1" \
  -b $COOKIE_FILE

# 4. Error Check: Invalid Role
echo -e "\n\nTesting Invalid Role..."
curl -s -X PUT "$BASE_URL/api/users/1" \
  -H "Content-Type: application/json" \
  -d '{"role": "hacker"}' \
  -b $COOKIE_FILE

# 5. Restore Bio (Cleanup)
echo -e "\n\nRestoring Bio..."
curl -s -X PUT "$BASE_URL/api/users/1" \
  -H "Content-Type: application/json" \
  -d '{"bio": "블로그 관리자입니다.", "credentials": "Chief Editor"}' \
  -b $COOKIE_FILE > /dev/null

echo -e "\n\nDone."
