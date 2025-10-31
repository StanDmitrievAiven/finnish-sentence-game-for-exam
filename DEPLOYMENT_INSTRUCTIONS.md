# Finnish Learning Cards - Cloud Deployment Instructions

## Deployment Setup

### For Services that Support Dockerfile/Containerfile (Aiven, Railway, Render, etc.)

This app includes both `Dockerfile` and `Containerfile` - use whichever your service prefers.

#### Fill out the deployment form with these values:

**Source URL:**
```
https://github.com/StanDmitrievAiven/finnish-sentence-game-for-exam.git
```

**Branch:**
```
main
```

**Application name:**
```
finnish-sentence-game
```
(Or any name you prefer - this cannot be changed afterwards)

**Base directory:**
```
/
```
(The Dockerfile is in the root directory)

**Port Configuration:**
- The app runs on port **9000** internally
- Make sure your service maps port 9000 to an external port
- Some services auto-detect ports, but you may need to set `PORT=9000` environment variable

### Environment Variables (if needed)

Some services may require:
- `PORT=9000` - Explicitly set the port

### Post-Deployment

Once deployed, access your app at:
- The URL provided by your service
- Or `http://your-service-url:9000` if port mapping is required

### What Happens During Deployment

1. Service clones the GitHub repository
2. Finds `Dockerfile` or `Containerfile` in the root directory
3. Builds the Docker image:
   - Clones the repo inside the container
   - Sets up Nginx to serve files
   - Configures Nginx to listen on port 9000
4. Starts the container
5. Serves `index.html` and all static files

### Troubleshooting

If the app doesn't load:
1. Check that port 9000 is exposed/mapped correctly
2. Verify the build logs show successful git clone
3. Ensure nginx is configured to listen on port 9000
4. Check if your service requires a `PORT` environment variable

### Alternative: Node.js Version

If Nginx doesn't work, you can use `Dockerfile.node` instead:
1. Rename `Dockerfile.node` to `Dockerfile` in your repo
2. Or specify `Dockerfile.node` as the dockerfile path in your service settings

