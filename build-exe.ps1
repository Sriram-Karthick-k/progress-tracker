# Builds the Interview Prep Tracker for Windows:
#   1) builds the Next app with the Notebook editor ENABLED (read-only OFF)
#   2) compiles launcher.cs -> InterviewPrep.exe
# A shell-set NEXT_PUBLIC_* var takes precedence over .env files, so this forces
# the editable build even if .env.local sets NEXT_PUBLIC_NOTES_READONLY=1.
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root

# --- 1) build the web app (editor enabled) ---
$env:NEXT_PUBLIC_NOTES_READONLY = "0"
if (-not (Test-Path (Join-Path $root "node_modules"))) {
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) { Write-Host "npm install failed." -ForegroundColor Red; exit 1 }
}
Write-Host "Building the app (Notebook editor enabled)..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "npm run build failed." -ForegroundColor Red; exit 1 }

# --- 2) compile the launcher exe ---
$csc = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path $csc)) {
    $csc = (Get-ChildItem "C:\Windows\Microsoft.NET\Framework64" -Recurse -Filter csc.exe |
            Sort-Object FullName -Descending | Select-Object -First 1).FullName
}

$out = Join-Path $root "InterviewPrep.exe"
& $csc /nologo /target:exe /platform:anycpu /optimize+ /out:"$out" (Join-Path $root "launcher.cs")

if (Test-Path $out) {
    Write-Host "Built: $out" -ForegroundColor Green
    Write-Host "Double-click InterviewPrep.exe to launch (serves http://localhost:7373)." -ForegroundColor Green
} else {
    Write-Host "Build failed." -ForegroundColor Red
    exit 1
}
