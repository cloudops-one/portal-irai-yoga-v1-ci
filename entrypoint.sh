#!/bin/sh
echo "🌐 ENV: $APP_ENV | VERSION: $VERSION"
exec nginx -g "daemon off;"
