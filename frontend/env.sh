#!/bin/sh

# Replace placeholders in JS files (adjust paths as needed)
# It's safer to replace in all JS files inside /usr/share/nginx/html/assets

for file in /usr/share/nginx/html/assets/*.js /usr/share/nginx/html/index.html; do
  echo "Processing $file"
  sed -i "s|__VITE_BACKEND_API_BASE_URL__|${VITE_BACKEND_API_BASE_URL}|g" "$file"
  sed -i "s|__VITE_FIREBASE_API_KEY__|${VITE_FIREBASE_API_KEY}|g" "$file"
  sed -i "s|__VITE_FIREBASE_AUTH_DOMAIN__|${VITE_FIREBASE_AUTH_DOMAIN}|g" "$file"
  sed -i "s|__VITE_FIREBASE_PROJECT_ID__|${VITE_FIREBASE_PROJECT_ID}|g" "$file"
  sed -i "s|__VITE_FIREBASE_STORAGE_BUCKET__|${VITE_FIREBASE_STORAGE_BUCKET}|g" "$file"
  sed -i "s|__VITE_FIREBASE_MESSAGING_SENDER_ID__|${VITE_FIREBASE_MESSAGING_SENDER_ID}|g" "$file"
  sed -i "s|__VITE_FIREBASE_APP_ID__|${VITE_FIREBASE_APP_ID}|g" "$file"
done

# Start nginx
exec "$@"
