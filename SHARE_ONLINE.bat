@echo off
title Cybersecurity Presentation - Public Cloud Link
echo ========================================================
echo  Generating live HTTPS presentation link...
echo  (Keep this window open while presenting)
echo ========================================================
echo.
ssh -R 80:localhost:8000 -o StrictHostKeyChecking=no nokey@localhost.run
pause
