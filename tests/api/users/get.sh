#!/bin/bash
COOKIE_FILE="cookies.txt"
BASE_URL="http://localhost:3000"

# 1. Login
echo "Logging in..."
curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com", "password":"admin123!"}' \
  -c $COOKIE_FILE

echo -e "\n\nFetching User 1..."
curl -s -X GET "$BASE_URL/api/users/1" \
  -b $COOKIE_FILE

echo -e "\n\nDone."
