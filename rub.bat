@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"

title VQEAF Theme Studio - Local Server

cls
echo ============================================================
echo               VQEAF Theme Studio Launcher
echo ============================================================
echo.

rem Tim mot cong trong tu 8080 den 8099.
set /a PORT=8080
:find_port
netstat -ano -p tcp 2>nul | findstr /R /C:":!PORT! .*LISTENING" >nul 2>&1
if not errorlevel 1 (
    set /a PORT+=1
    if !PORT! LEQ 8099 goto find_port
    echo [ERROR] Khong tim thay cong trong trong khoang 8080-8099.
    echo Hay dong server dang chiem cong roi thu lai.
    pause
    exit /b 1
)

set "URL=http://127.0.0.1:!PORT!/"
set "SERVER_KIND="

rem Uu tien Python Launcher tren Windows.
py -3 --version >nul 2>&1
if not errorlevel 1 set "SERVER_KIND=PYLAUNCHER"

if not defined SERVER_KIND (
    python --version >nul 2>&1
    if not errorlevel 1 set "SERVER_KIND=PYTHON"
)

if not defined SERVER_KIND (
    python3 --version >nul 2>&1
    if not errorlevel 1 set "SERVER_KIND=PYTHON3"
)

echo [OK] Thu muc: %CD%
echo [OK] Dia chi: !URL!
echo.
echo Trinh duyet se tu mo sau khi server khoi dong.
echo Nhan Ctrl+C trong cua so nay de dung server.
echo ============================================================
echo.

rem Mo trinh duyet tre mot chut de server kip khoi dong.
start "" /b powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Milliseconds 900; Start-Process '!URL!'" >nul 2>&1

if /I "!SERVER_KIND!"=="PYLAUNCHER" (
    echo [SERVER] py -3 -m http.server !PORT!
    py -3 -m http.server !PORT! --bind 127.0.0.1
    goto :server_end
)

if /I "!SERVER_KIND!"=="PYTHON" (
    echo [SERVER] python -m http.server !PORT!
    python -m http.server !PORT! --bind 127.0.0.1
    goto :server_end
)

if /I "!SERVER_KIND!"=="PYTHON3" (
    echo [SERVER] python3 -m http.server !PORT!
    python3 -m http.server !PORT! --bind 127.0.0.1
    goto :server_end
)

echo [INFO] Khong tim thay Python. Dang dung PowerShell static server du phong...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port !PORT!

:server_end
set "EXIT_CODE=%ERRORLEVEL%"
echo.
if not "%EXIT_CODE%"=="0" (
    echo [ERROR] Server dung voi ma loi %EXIT_CODE%.
    echo Neu cong bi chiem, hay chay lai rub.bat.
) else (
    echo [OK] Server da dung.
)
echo.
pause
exit /b %EXIT_CODE%
