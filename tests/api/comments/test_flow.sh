#!/bin/bash

# Configuration
BASE_URL="http://localhost:3000"
COOKIE_FILE="cookies.txt"

# 1. Login (as Admin)
echo "Logging in..."
response=$(curl -s -c $COOKIE_FILE -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com", "password":"admin123!"}')

echo "Login Response: $response"

# 2. Get Article ID (Assume ID 1 exists, or fetch list)
ARTICLE_ID=1

# 3. Create Comment
echo -e "\nCreating Comment on Article $ARTICLE_ID..."
create_res=$(curl -s -b $COOKIE_FILE -X POST "$BASE_URL/api/articles/$ARTICLE_ID/comments" \
  -H "Content-Type: application/json" \
  -d '{"content":"Test Comment via Script"}')

echo "Create Response: $create_res"

# Extract Comment ID (Simple grep, better with jq but assuming basic environment)
COMMENT_ID=$(echo $create_res | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -z "$COMMENT_ID" ]; then
  echo "Failed to create comment."
else
  echo "Created Comment ID: $COMMENT_ID"

  # 4. Get Comments
  echo -e "\nFetching Comments..."
  curl -s -b $COOKIE_FILE "$BASE_URL/api/articles/$ARTICLE_ID/comments"

  # 5. Delete Comment
  echo -e "\nDeleting Comment $COMMENT_ID..."
  curl -s -b $COOKIE_FILE -X DELETE "$BASE_URL/api/comments/$COMMENT_ID"
fi
