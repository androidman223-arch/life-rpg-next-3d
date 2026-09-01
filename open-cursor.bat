@echo off
chcp 65001 >nul
set "PROJECT=E:\JavaSrcipt\cursor_project\life_rpg\life-rpg-next-3d"
set "CURSOR="

cd /d "%~dp0"

if exist "%LOCALAPPDATA%\Programs\cursor\Cursor.exe" (
  set "CURSOR=%LOCALAPPDATA%\Programs\cursor\Cursor.exe"
)
if exist "%LOCALAPPDATA%\Programs\cursor\_\Cursor.exe" (
  set "CURSOR=%LOCALAPPDATA%\Programs\cursor\_\Cursor.exe"
)

where cursor >nul 2>&1
if %errorlevel% equ 0 (
  echo Cursor で life-rpg-next-3d を開きます...
  cursor "%PROJECT%"
  exit /b 0
)

if not defined CURSOR (
  echo.
  echo [エラー] Cursor.exe が見つかりません。
  echo 次を確認してください:
  echo   %LOCALAPPDATA%\Programs\cursor\Cursor.exe
  echo   %LOCALAPPDATA%\Programs\cursor\_\Cursor.exe
  echo.
  echo cursor.com から Cursor を再インストールしてください。
  pause
  exit /b 1
)

if not exist "%PROJECT%\package.json" (
  echo.
  echo [エラー] プロジェクトが見つかりません:
  echo   %PROJECT%
  pause
  exit /b 1
)

echo Cursor で life-rpg-next-3d を開きます...
echo   %CURSOR%
start "" "%CURSOR%" "%PROJECT%"
exit /b 0
