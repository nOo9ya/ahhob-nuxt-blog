#!/bin/bash
COOKIE_FILE="cookies.txt"
BASE_URL="http://localhost:3000"
COOKIE_FILE_USER="cookies-user.txt"

# 1. Login as Admin
echo "Logging in as Admin..."
curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com", "password":"admin123!"}' \
  -c $COOKIE_FILE > /dev/null

# 2. Test Conflict (Admin has articles)
echo -e "\n\nTesting Delete Conflict (Admin)..."
curl -s -X DELETE "$BASE_URL/api/users/1" \
  -b $COOKIE_FILE

# 3. Create a Dummy User to Delete
echo -e "\n\nCreating Dummy User..."
TIMESTAMP=$(date +%s)
dummy_email="dummy${TIMESTAMP}@example.com"
curl -s -X POST "$BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$dummy_email\", \"password\":\"Test1234!@\", \"name\":\"Dummy User\", \"role\":\"writer\"}" \
  -b $COOKIE_FILE > temp_user.json

DUMMY_ID=$(jq '.user.id' temp_user.json)
echo "Created User ID: $DUMMY_ID"

# 4. Delete Default (Success)
echo -e "\n\nDeleting Dummy User ($DUMMY_ID)..."
curl -s -X DELETE "$BASE_URL/api/users/$DUMMY_ID" \
  -b $COOKIE_FILE

# 5. Verify Deletion
echo -e "\n\nVerifying Deletion..."
curl -s -X GET "$BASE_URL/api/users/$DUMMY_ID" \
  -b $COOKIE_FILE

rm temp_user.json
echo -e "\n\nDone."
