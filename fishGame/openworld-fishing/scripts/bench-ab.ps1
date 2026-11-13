# bench-ab.ps1 — restart Chrome for each measurement, then report medians.
param(
  [string[]]$Urls,
  [int]$Runs = 3,
  [int]$Seconds = 12
)

$ErrorActionPreference = 'Stop'
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$root = "E:\fishGame\openworld-fishing"
Set-Location $root

function Start-BenchChrome {
  Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
  Start-Sleep -Milliseconds 800
  $profile = Join-Path $root ".chrome-bench"
  Remove-Item -Recurse -Force $profile -ErrorAction SilentlyContinue
  New-Item -ItemType Directory -Force -Path $profile | Out-Null
  Start-Process -FilePath $chrome -ArgumentList @(
    "--headless=new", "--remote-debugging-port=9333", "--user-data-dir=$profile",
    "--no-first-run", "--no-default-browser-check", "--disable-extensions",
    "--disable-background-timer-throttling", "--disable-renderer-backgrounding",
    "--disable-backgrounding-occluded-windows", "--disable-dev-shm-usage",
    "--window-size=1280,800", "--hide-scrollbars", "--mute-audio",
    "--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist",
    "--disable-frame-rate-limit", "about:blank"
  ) -WindowStyle Hidden
  for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Milliseconds 500
    try {
      Invoke-WebRequest "http://127.0.0.1:9333/json/version" -TimeoutSec 2 -UseBasicParsing | Out-Null
      return $true
    } catch { }
  }
  return $false
}

$results = @{}
foreach ($u in $Urls) {
  $rows = @()
  for ($r = 1; $r -le $Runs; $r++) {
    if (-not (Start-BenchChrome)) { Write-Host "chrome failed to start"; break }
    $env:CDP_PORT = "9333"
    $env:BOOT_MS = "20000"
    $raw = & node scripts/bench.mjs $u "--seconds=$Seconds" 2>&1 | Out-String
    $idx = $raw.IndexOf('{')
    if ($idx -lt 0) { Write-Host "run failed: $($raw.Substring(0, [Math]::Min(300, $raw.Length)))"; continue }
    $j = $raw.Substring($idx) | ConvertFrom-Json
    $spf = [Math]::Round($j.cpu.scriptMs / $j.frame.frames, 2)
    Write-Host ("{0} run {1}: fps={2} median={3}ms p95={4}ms script/frame={5}ms calls={6}" -f $u.Substring($u.IndexOf('?')), $r, $j.frame.fps, $j.frame.medianMs, $j.frame.p95Ms, $spf, $j.diag.calls)
    $rows += [pscustomobject]@{ fps = $j.frame.fps; median = $j.frame.medianMs; p95 = $j.frame.p95Ms; spf = $spf; calls = $j.diag.calls }
  }
  if ($rows.Count -gt 0) {
    $sorted = $rows | Sort-Object fps
    $med = $sorted[[int][Math]::Floor($sorted.Count / 2)]
    $results[$u] = [pscustomobject]@{
      runs = $rows.Count
      fps = $med.fps
      medianMs = $med.median
      p95Ms = $med.p95
      scriptPerFrame = $med.spf
      calls = $med.calls
      allFps = ($rows | ForEach-Object { $_.fps }) -join ','
    }
  }
}

Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "`n=== medians ==="
$results.GetEnumerator() | ForEach-Object {
  $k = $_.Key.Substring($_.Key.IndexOf('?'))
  Write-Host ("{0}`n  fps={1}  median={2}ms  p95={3}ms  script/frame={4}ms  calls={5}  all=[{6}]" -f $k, $_.Value.fps, $_.Value.medianMs, $_.Value.p95Ms, $_.Value.scriptPerFrame, $_.Value.calls, $_.Value.allFps)
}
$keys = @($results.Keys)
if ($keys.Count -eq 2) {
  $a = $results[$keys[0]]; $b = $results[$keys[1]]
  Write-Host ("`nFPS delta: {0:N1}%   CPU/frame delta: {1:N1}%" -f ((($b.fps - $a.fps) / $a.fps) * 100), ((($b.scriptPerFrame - $a.scriptPerFrame) / $a.scriptPerFrame) * 100))
}

