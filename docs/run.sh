#!/bin/bash
# Quick Start Guide for Bookmark Manager
# Run this script to start the bookmark manager on macOS

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔖  Intelligent Bookmark Manager - Quick Start              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if Python is available
if command -v python3 &> /dev/null; then
    PORT=8000
    echo "✅ Python3 found"
    echo ""
    echo "Starting server on http://localhost:$PORT"
    echo ""
    echo "📖 Application URLs:"
    echo "   Main App:           http://localhost:$PORT/frontend/"
    echo "   DSA Visualization:  http://localhost:$PORT/visualization/"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    
    # Open in browser
    sleep 1
    open "http://localhost:$PORT/frontend/"
    
    # Start server
    python3 -m http.server $PORT
else
    echo "❌ Python3 not found"
    echo ""
    echo "Alternative: Open directly in browser"
    echo "   Main App:     file://$(pwd)/frontend/index.html"
    echo "   Visualization: file://$(pwd)/visualization/visual.html"
    echo ""
    echo "📌 Note: Some features may not work with file:// protocol"
fi
