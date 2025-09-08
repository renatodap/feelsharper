#!/bin/bash

# FeelSharper Development Startup Script
# Starts both Next.js frontend and Python backend

echo "🚀 Starting FeelSharper Development Environment..."

# Function to kill processes on exit
cleanup() {
    echo "
📝 Stopping servers..."
    kill $NEXTJS_PID 2>/dev/null
    kill $PYTHON_PID 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# Start Python backend
echo "🐍 Starting Python backend on port 8000..."
cd python-backend
python main.py &
PYTHON_PID=$!
cd ..

# Give Python backend time to start
sleep 2

# Start Next.js frontend
echo "⚛️ Starting Next.js frontend on port 3000..."
npm run dev &
NEXTJS_PID=$!

echo "
✅ Development environment started!
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Backend Health: http://localhost:8000/health
   
Press Ctrl+C to stop both servers.
"

# Wait for both processes
wait $NEXTJS_PID $PYTHON_PID