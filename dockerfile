
# 🚀 STAGE 2: Serve with NGINX
FROM nginx:stable-alpine

# Create NGINX user (same as cloudops to avoid permission issues)
RUN addgroup -S cloudops && adduser -S cloudops -G cloudops

# ✅ Fix: Create *all* temp folders expected by nginx.conf
RUN mkdir -p /tmp/nginx_temp/client_temp \
             /tmp/nginx_temp/proxy_temp \
             /tmp/nginx_temp/fastcgi_temp \
             /tmp/nginx_temp/uwsgi_temp \
             /tmp/nginx_temp/scgi_temp \
             /var/cache/nginx && \
    chown -R cloudops:cloudops /usr/share/nginx /etc/nginx /tmp/nginx_temp /var/cache/nginx

# Copy built app from builder stage to NGINX serving directory
COPY dist /usr/share/nginx/html

# Copy custom NGINX config file
COPY nginx.conf /etc/nginx/nginx.conf

# Use non-root user to run the NGINX server
USER cloudops

# Expose port 8080 for the NGINX server
EXPOSE 8080

# Run NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]
