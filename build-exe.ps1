# Compiles launcher.cs -> InterviewPrep.exe
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$csc = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path $csc)) {
    $csc = (Get-ChildItem "C:\Windows\Microsoft.NET\Framework64" -Recurse -Filter csc.exe |
            Sort-Object FullName -Descending | Select-Object -First 1).FullName
}

$out = Join-Path $root "InterviewPrep.exe"
& $csc /nologo /target:exe /platform:anycpu /optimize+ /out:"$out" (Join-Path $root "launcher.cs")

if (Test-Path $out) {
    Write-Host "Built: $out" -ForegroundColor Green
} else {
    Write-Host "Build failed." -ForegroundColor Red
    exit 1
}
