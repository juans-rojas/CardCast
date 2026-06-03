@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
cls

echo =========================================
echo             CardCast
echo     TCG Streaming Overlay Tool
echo =========================================
echo.

:: Download Node.js if needed
if not exist "node-portable\node.exe" (
    echo Setting up CardCast for first time use...
    echo This is a one-time setup that takes about 2-3 minutes.
    echo.
    
    mkdir node-portable 2>nul
    
    echo Downloading Node.js runtime...
    powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v16.20.2/node-v16.20.2-win-x64.zip' -OutFile '%TEMP%\node.zip'"
    
    if not exist "%TEMP%\node.zip" (
        echo.
        echo ERROR: Failed to download Node.js. Please check your internet connection.
        echo.
        pause
        exit /b 1
    )
    
    echo Extracting files...
    powershell -Command "Expand-Archive -Path '%TEMP%\node.zip' -DestinationPath '%TEMP%' -Force"
    
    xcopy /E /I /Q /Y "%TEMP%\node-v16.20.2-win-x64\*" "node-portable\" >nul
    
    del "%TEMP%\node.zip" 2>nul
    rmdir /s /q "%TEMP%\node-v16.20.2-win-x64" 2>nul
    
    echo Runtime installed successfully!
    echo.
)

:: Install dependencies if needed
if not exist "node_modules\" (
    echo Installing CardCast components...
    echo This only happens on first run...
    echo.
    
    :: CRITICAL: Set PATH to use ONLY our portable Node.js
    set "PATH=%~dp0node-portable;%~dp0node-portable\node_modules\npm\bin"
    set "NODE_PATH=%~dp0node-portable\node_modules"
    
    :: Use better-sqlite3 v7 which has proper Node 16 support
    call "%~dp0node-portable\npm.cmd" install axios@0.27.2 better-sqlite3@7.6.2 cheerio@1.0.0-rc.10 express@4.18.2 socket.io@4.5.4 --loglevel=error
    
    if !errorlevel! neq 0 (
        echo.
        echo ERROR: Failed to install components.
        echo Please check your internet connection and try again.
        echo.
        pause
        exit /b 1
    )
    
    echo.
    echo ✓ CardCast is ready to use!
    echo.
)

:: Create required directories
if not exist "data" mkdir "data" 2>nul
if not exist "cache" mkdir "cache" 2>nul

:: Start the server
echo =========================================
echo Starting CardCast server...
echo.
echo Your browser will open automatically.
echo To stop CardCast: Close this window
echo =========================================
echo.

:: Run the server
node-portable\node.exe server.js

:: If we get here, server was stopped
echo.
echo CardCast has been stopped.
pause