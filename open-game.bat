@echo off
cd /d "%~dp0"

set PORT=3001

if not exist "node_modules\" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

echo.
echo [3D] port %PORT% ^(2D uses 3000^)
echo Stopping old 3D dev server if any...
echo.

powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { $_.CommandLine -like '*life-rpg-next-3d*' -and $_.CommandLine -like '*next*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT% " ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1

timeout /t 2 /nobreak >nul

start "Life RPG 3D Dev Server" cmd /k npm run dev
echo Server starting. Keep the server window open.
timeout /t 8 /nobreak >nul
start "" http://localhost:%PORT%
echo.
echo Open: http://localhost:%PORT%
echo If refused, check the server window for Ready, then press F5.
echo Do NOT close the server window while playing.
echo.
pause
