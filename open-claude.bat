@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "FOLDER=%~dp0"
if "%FOLDER:~-1%"=="\" set "FOLDER=%FOLDER:~0,-1%"

rem このフォルダの場所を コピーしておく（Ctrl+V で 貼りつけできる）
powershell -NoProfile -Command "Set-Clipboard -Value $env:FOLDER"

rem Claude アプリを ひらく
start "" explorer.exe "shell:AppsFolder\Claude_pzs8sxrjxfjjc!Claude"

echo.
echo Claude を ひらきました。
echo Code タブで このフォルダを えらんでください。
echo フォルダの場所は コピーしてあります（Ctrl+V で 貼りつけ）:
echo   %FOLDER%
echo.
pause
