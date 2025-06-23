#!/bin/sh

# Replace placeholders in index.html with actual environment variables
sed -i "s|VITE_BACKEND_API_BASE_URL|${VITE_BACKEND_API_BASE_URL}|g" /usr/share/nginx/html/index.html
sed -i "s|VITE_FIREBASE_API_KEY|${VITE_FIREBASE_API_KEY}|g" /usr/share/nginx/html/index.html
sed -i "s|VITE_FIREBASE_AUTH_DOMAIN|${VITE_FIREBASE_AUTH_DOMAIN}|g" /usr/share/nginx/html/index.html
sed -i "s|VITE_FIREBASE_PROJECT_ID|${VITE_FIREBASE_PROJECT_ID}|g" /usr/share/nginx/html/index.html
sed -i "s|VITE_FIREBASE_STORAGE_BUCKET|${VITE_FIREBASE_STORAGE_BUCKET}|g" /usr/share/nginx/html/index.html
sed -i "s|VITE_FIREBASE_MESSAGING_SENDER_ID|${VITE_FIREBASE_MESSAGING_SENDER_ID}|g" /usr/share/nginx/html/index.html
sed -i "s|VITE_FIREBASE_APP_ID|${VITE_FIREBASE_APP_ID}|g" /usr/share/nginx/html/index.html

# Execute the command passed to the container (i.e., start nginx)
exec "$@"
