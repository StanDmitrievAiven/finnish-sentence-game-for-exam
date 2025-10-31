FROM nginx:alpine

# Install git
RUN apk add --no-cache git

# Clone the repository
RUN git clone https://github.com/StanDmitrievAiven/finnish-sentence-game-for-exam.git /usr/share/nginx/html

# Expose port 9000
EXPOSE 9000

# Change nginx port from 80 to 9000 and update server config
RUN sed -i 's/listen       80;/listen       9000;/' /etc/nginx/conf.d/default.conf && \
    sed -i 's/listen       \[::\]:80;/listen       \[::\]:9000;/' /etc/nginx/conf.d/default.conf

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

