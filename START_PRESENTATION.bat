@echo off
title Launching Security Policy & Risk Management Presentation
echo Starting presentation server...
start http://localhost:8000
python -m http.server 8000
pause
