$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$localRuntime = Join-Path $env:LOCALAPPDATA 'card-dashboard-runtime\node-v22.16.0-win-x64'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  if (Test-Path -LiteralPath (Join-Path $localRuntime 'node.exe')) {
    $env:Path = $localRuntime + ';' + $env:Path
  } else {
    throw 'Node.js 22 이상을 설치한 뒤 다시 실행해 주세요.'
  }
}
if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'node_modules'))) {
  & npm.cmd ci
  if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
}
$dashboardUrl = 'http://127.0.0.1:5173'
$dashboardReady = $false
try {
  $response = Invoke-WebRequest -Uri $dashboardUrl -UseBasicParsing -TimeoutSec 2
  $dashboardReady = $response.StatusCode -eq 200 -and $response.Content.Contains('IBK')
} catch {}
if (-not $dashboardReady) {
  $nodeExecutable = (Get-Command node).Source
  $viteScript = Join-Path $PSScriptRoot 'node_modules\vite\bin\vite.js'
  $logDirectory = Join-Path $PSScriptRoot '.local'
  New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
  $serverProcess = Start-Process -FilePath $nodeExecutable -ArgumentList @(('"' + $viteScript + '"'), '--host', '127.0.0.1', '--port', '5173', '--strictPort') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDirectory 'server.log') -RedirectStandardError (Join-Path $logDirectory 'server-error.log') -PassThru
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    Start-Sleep -Milliseconds 300
    try {
      $response = Invoke-WebRequest -Uri $dashboardUrl -UseBasicParsing -TimeoutSec 2
      if ($response.StatusCode -eq 200 -and $response.Content.Contains('IBK')) {
        $dashboardReady = $true
        break
      }
    } catch {}
    if ($serverProcess.HasExited) { break }
  }
  if (-not $dashboardReady) {
    throw ('Dashboard could not start. Check ' + (Join-Path $logDirectory 'server-error.log'))
  }
  Set-Content -LiteralPath (Join-Path $logDirectory 'server.pid') -Value $serverProcess.Id
}
Start-Process $dashboardUrl
Write-Host ('Dashboard is running: ' + $dashboardUrl)
