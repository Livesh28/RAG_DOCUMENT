#!/bin/bash

echo "================================================="
echo "🚀 UniGuide AI — Production Launch Script"
echo "================================================="

# Step 1: Check Docker Installation
if command -v docker &> /dev/null && (command -v docker-compose &> /dev/null || docker compose version &> /dev/null); then
    echo "📦 Docker detected! Building and starting UniGuide AI containers..."
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d --build
    else
        docker compose up -d --build
    fi
else
    echo "ℹ️ Docker is not installed on this machine. Launching UniGuide AI services directly..."
    export PATH=/Users/livesh/recommendation/node_bin/bin:$PATH
    echo "⚙️ Starting FastAPI backend server..."
    cd "$(dirname "$0")/backend"
    ./venv/bin/python main.py &
    
    echo "💻 Starting React frontend server..."
    cd "$(dirname "$0")/frontend"
    npm run dev &
fi

echo "================================================="
echo "✅ UniGuide AI Production Services Live!"
echo "💻 Frontend Web App:  http://localhost:3000"
echo "⚙️ FastAPI Backend:   http://localhost:8000"
echo "📖 OpenAPI Swagger:   http://localhost:8000/docs"
echo "================================================="
