#!/usr/bin/env python3
"""
Script to start both frontend and backend servers simultaneously
Usage: python start_all.py
"""

import subprocess
import time
import sys
import os
from threading import Thread

def run_backend():
    """Start the FastAPI backend server"""
    print("🚀 Starting Backend Server...")
    backend_cmd = [
        sys.executable, "-m", "uvicorn", 
        "backend.backend:app", 
        "--reload", 
        "--host", "127.0.0.1", 
        "--port", "8000"
    ]
    
    try:
        subprocess.run(backend_cmd, cwd=".", check=True)
    except KeyboardInterrupt:
        print("\n🛑 Backend server stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ Backend server failed to start: {e}")

def run_frontend():
    """Start the React frontend server"""
    print("🚀 Starting Frontend Server...")
    
    # Wait a bit for backend to start first
    time.sleep(3)
    
    try:
        subprocess.run(["npm", "start"], cwd=".", check=True)
    except KeyboardInterrupt:
        print("\n🛑 Frontend server stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ Frontend server failed to start: {e}")
    except FileNotFoundError:
        print("❌ npm not found. Make sure Node.js is installed.")

def main():
    print("🌙 Poem Pulse Development Server Starter")
    print("=" * 50)
    print("📍 Backend will run on: http://127.0.0.1:8000")
    print("📍 Frontend will run on: http://localhost:3000")
    print("=" * 50)
    print("Press Ctrl+C to stop both servers...\n")
    
    try:
        # Start backend in a separate thread
        backend_thread = Thread(target=run_backend, daemon=True)
        backend_thread.start()
        
        # Start frontend in main thread
        run_frontend()
        
    except KeyboardInterrupt:
        print("\n🛑 Shutting down both servers...")
        print("✅ Development servers stopped")

if __name__ == "__main__":
    main()
