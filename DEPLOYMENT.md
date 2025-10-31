# Finnish Learning Cards - Deployment Guide

## Quick Start

### Option 1: Docker (Recommended)

#### Using Dockerfile.node (Node.js server)
```bash
docker build -f Dockerfile.node -t finnish-app .
docker run -d -p 9000:9000 --name finnish-app finnish-app
```

#### Using Dockerfile (Nginx)
```bash
docker build -f Dockerfile -t finnish-app .
docker run -d -p 9000:9000 --name finnish-app finnish-app
```

#### Using Docker Compose
```bash
docker-compose up -d
```

### Option 2: Direct Server Script

1. Make the script executable:
```bash
chmod +x deploy.sh
```

2. Run it:
```bash
./deploy.sh
```

The script will automatically:
- Clone/pull the repository
- Start a simple HTTP server on port 9000
- Use Python, Node.js, or PHP (whichever is available)

### Option 3: Manual Setup

1. Clone the repository:
```bash
git clone https://github.com/StanDmitrievAiven/finnish-sentence-game-for-exam.git
cd finnish-sentence-game-for-exam
```

2. Start a simple HTTP server:

**Python 3:**
```bash
python3 -m http.server 9000
```

**Node.js (http-server):**
```bash
npm install -g http-server
http-server . -p 9000 --cors
```

**PHP:**
```bash
php -S 0.0.0.0:9000
```

**Nginx:**
```nginx
server {
    listen 9000;
    server_name _;
    root /path/to/finnish-sentence-game-for-exam;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Accessing the App

Once deployed, access the app at:
- `http://localhost:9000` (local)
- `http://your-server-ip:9000` (remote)

## Stateless Server Considerations

For a truly stateless server that pulls fresh on each deploy:

1. **Docker with volume mount** (if you want to auto-update):
```bash
docker run -d -p 9000:9000 \
  -v /path/to/repo:/usr/share/nginx/html \
  --name finnish-app \
  nginx:alpine
```

2. **Cron job to auto-pull** (add to your server):
```bash
# Add to crontab (crontab -e)
*/5 * * * * cd /path/to/repo && git pull
```

3. **GitHub Actions** for automatic deployment on push.

## Notes

- The app is fully static (HTML/CSS/JS) - no backend required
- All data is embedded in `data.js`
- No database or external dependencies needed
- Works offline once loaded

