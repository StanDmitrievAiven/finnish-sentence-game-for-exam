#!/bin/bash

# Simple deployment script for stateless server
# This script pulls the repo and serves it on port 9000

set -e

REPO_URL="https://github.com/StanDmitrievAiven/finnish-sentence-game-for-exam.git"
APP_DIR="/tmp/finnish-app"
PORT=9000

echo "📦 Cloning repository..."
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    git pull
else
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

echo "🌐 Starting server on port $PORT..."

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "Using Python HTTP server..."
    python3 -m http.server $PORT
# Check if Node.js is available
elif command -v node &> /dev/null; then
    echo "Using Node.js HTTP server..."
    if ! command -v http-server &> /dev/null; then
        echo "Installing http-server..."
        npm install -g http-server
    fi
    http-server . -p $PORT --cors
# Check if PHP is available
elif command -v php &> /dev/null; then
    echo "Using PHP built-in server..."
    php -S 0.0.0.0:$PORT
else
    echo "❌ Error: No suitable HTTP server found. Please install Python 3, Node.js, or PHP."
    exit 1
fi

