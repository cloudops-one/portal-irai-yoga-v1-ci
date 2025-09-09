# STAGE 1: Build React/Vue app
FROM node:20-alpine as builder
WORKDIR /app

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build   # React = "build" | Vue/Angular = "build" → dist folder

# STAGE 2: Serve with NGINX
FROM nginx:stable-alpine

RUN addgroup -S cloudops && adduser -S cloudops -G cloudops && \
    mkdir -p /tmp/nginx_temp/client_temp \
             /tmp/nginx_temp/proxy_temp \
             /tmp/nginx_temp/fastcgi_temp \
             /tmp/nginx_temp/uwsgi_temp \
             /tmp/nginx_temp/scgi_temp \
             /var/cache/nginx && \
    chown -R cloudops:cloudops /usr/share/nginx /etc/nginx /tmp/nginx_temp /var/cache/nginx

# React output is in /app/build, Vue/Angular usually in /app/dist
COPY --from=builder /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

USER cloudops
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
