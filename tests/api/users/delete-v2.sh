#!/bin/bash
COOKIE_FILE="cookies.txt"
BASE_URL="http://localhost:3000"

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
# We expect 409 Conflict here

# 3. Create a Dummy User
echo -e "\n\nCreating Dummy User..."
TIMESTAMP=$(date +%s)
# Use a random email to avoid conflicts
dummy_email="del${TIMESTAMP}@example.com"

# Capture response
RESPONSE=$(curl -s -X POST "$BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$dummy_email\", \"password\":\"Test1234!@\", \"name\":\"ToDelete\", \"role\":\"writer\"}" \
  -b $COOKIE_FILE)

echo "Creation Response: $RESPONSE"

# Extract ID using python (more reliable if jq missing, though jq is likely there)
# Assuming jq is available
DUMMY_ID=$(echo $RESPONSE | jq -r '.user.id')

if [ "$DUMMY_ID" == "null" ] || [ -z "$DUMMY_ID" ]; then
  echo "Failed to create user or extract ID."
  exit 1
fi

echo "Created User ID: $DUMMY_ID"

# 4. Verify User Exists
echo -e "\nChecking User Existence..."
curl -s -X GET "$BASE_URL/api/users/$DUMMY_ID" \
  -b $COOKIE_FILE

# 5. Delete Dummy User
echo -e "\n\nDeleting Dummy User ($DUMMY_ID)..."
DEL_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/users/$DUMMY_ID" \
  -b $COOKIE_FILE)
echo "Delete Response: $DEL_RESPONSE"

# 6. Verify Deletion (Should be 404)
echo -e "\nVerifying 404..."
curl -s -X GET "$BASE_URL/api/users/$DUMMY_ID" \
  -b $COOKIE_FILE

echo -e "\n\nDone."
