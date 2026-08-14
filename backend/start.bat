@echo off
cd /d "%~dp0"

if not exist ".env" (
    echo.
    echo [PrivacyLens] No .env file found in the backend folder.
    echo Create a .env file in the backend folder and add your required keys first.
    echo.
    pause
    exit /b 1
)

if not exist "venv" (
    echo [PrivacyLens] First run - setting up, this may take a minute...
    python -m venv venv
    if errorlevel 1 (
        echo.
        echo [PrivacyLens] Could not create a virtual environment.
        echo Make sure Python is installed and try again.
        echo.
        pause
        exit /b 1
    )
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    if errorlevel 1 (
        echo.
        echo [PrivacyLens] Installing dependencies failed - see the errors above.
        echo.
        pause
        exit /b 1
    )
) else (
    call venv\Scripts\activate.bat
)

echo.
echo [PrivacyLens] Starting backend at http://127.0.0.1:8811
echo Keep this window open while you use the extension or website.
echo Press Ctrl+C to stop.
echo.

uvicorn app:app --reload --port 8811

echo.
echo [PrivacyLens] The server stopped. If this was unexpected, scroll up to see why.
pause
