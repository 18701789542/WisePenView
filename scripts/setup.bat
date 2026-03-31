@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
set "HOSTS_SCRIPT=%SCRIPT_DIR%setup_hosts_v2.py"

echo ==^> WisePenView setup (Windows)

where node >nul 2>nul
if errorlevel 1 (
  echo Error: Node.js is not installed. Please install Node.js first.
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo Error: npm is not available. Please reinstall Node.js.
  exit /b 1
)

for /f %%i in ('node -v') do set "NODE_VERSION=%%i"
for /f %%i in ('npm -v') do set "NPM_VERSION=%%i"
echo Node version: %NODE_VERSION%
echo npm version: %NPM_VERSION%

where corepack >nul 2>nul
if not errorlevel 1 (
  echo ==^> Enabling corepack and preparing pnpm...
  call corepack enable
  call corepack prepare pnpm@latest --activate
) else (
  echo ==^> corepack not found, installing pnpm globally via npm...
  call npm install -g pnpm
)

where pnpm >nul 2>nul
if errorlevel 1 (
  echo Error: pnpm installation failed.
  exit /b 1
)

for /f %%i in ('pnpm -v') do set "PNPM_VERSION=%%i"
echo pnpm version: %PNPM_VERSION%

echo ==^> Installing dependencies with pnpm...
pushd "%PROJECT_ROOT%"
call pnpm install
if errorlevel 1 (
  popd
  echo Error: pnpm install failed.
  exit /b 1
)
popd

if not exist "%HOSTS_SCRIPT%" (
  echo Error: hosts setup script not found at %HOSTS_SCRIPT%
  exit /b 1
)

where python >nul 2>nul
if not errorlevel 1 (
  set "PYTHON_CMD=python"
) else (
  where py >nul 2>nul
  if not errorlevel 1 (
    set "PYTHON_CMD=py"
  ) else (
    echo Error: Python is not installed. Cannot run hosts setup script.
    exit /b 1
  )
)

echo ==^> Running hosts setup script...
echo Note: Please run this .bat as Administrator for hosts modification.
call %PYTHON_CMD% "%HOSTS_SCRIPT%"

echo.
echo Setup finished.
echo You can now start local testing with:
echo   npm run mock
echo or
echo   npm run dev
echo If hosts setup failed due to permissions, re-run this file as Administrator.
exit /b 0
