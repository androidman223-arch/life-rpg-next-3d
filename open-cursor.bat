@echo off
cd /d "%~dp0"

where cursor >nul 2>&1
if %errorlevel%==0 (
  cursor .
  exit /b 0
)

if exist "%LOCALAPPDATA%\Programs\cursor\Cursor.exe" (
  start "" "%LOCALAPPDATA%\Programs\cursor\Cursor.exe" "%~dp0"
  exit /b 0
)

echo Cursor not found.
echo Install Cursor or add the cursor command to PATH.
pause
