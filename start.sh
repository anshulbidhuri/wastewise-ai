#!/bin/bash
echo "============================================================"
echo " WasteWise AI - Setup & Start"
echo "============================================================"

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js not found. Please install from https://nodejs.org/"
    exit 1
fi

echo "[OK] Node.js $(node --version) found"
echo "Installing dependencies..."
npm install

echo ""
echo "============================================================"
echo " Starting WasteWise AI at http://localhost:3000"
echo "============================================================"
node server.js
