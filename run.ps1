param(
    [switch]$NoBrowser
)

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Frontend = Join-Path $Root "frontend"
$Backend = Join-Path $Root "backend"

# Maven path
$MavenHome = Join-Path $env:TEMP "maven\apache-maven-3.9.16"
$MavenBin = Join-Path $MavenHome "bin\mvn.cmd"
$JavaBin = "$(Get-Command java | Select-Object -ExpandProperty Source | Split-Path)"

# Colors
$Green, $Yellow, $Red, $Cyan = "Green", "Yellow", "Red", "Cyan"

function Write-Info($m)  { Write-Host "[INFO] $m" -ForegroundColor $Cyan }
function Write-Success($m) { Write-Host "[OK] $m" -ForegroundColor $Green }
function Write-Warn($m) { Write-Host "[!] $m" -ForegroundColor $Yellow }
function Write-Error($m) { Write-Host "[ERR] $m" -ForegroundColor $Red }

# Simple TCP port check (more reliable than Test-NetConnection)
function Test-Port($port) {
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $async = $client.BeginConnect('127.0.0.1', $port, $null, $null)
        if ($async.AsyncWaitHandle.WaitOne(2000)) {
            $client.EndConnect($async) | Out-Null
            $client.Close()
            return $true
        }
        $client.Close()
        return $false
    } catch { return $false }
}

Clear-Host
Write-Host "==============================================" -ForegroundColor $Cyan
Write-Host "  Vishwakarma Cooperative Society Bank" -ForegroundColor $Yellow
Write-Host "  Starting Application..." -ForegroundColor $Cyan
Write-Host "==============================================" -ForegroundColor $Cyan
Write-Host ""

# ----- Check Prerequisites -----
Write-Info "Checking prerequisites..."

$nodeVersion = node --version 2>$null
if (-not $nodeVersion) { Write-Error "Node.js not installed"; exit 1 }
Write-Success "Node.js $nodeVersion"

$javaVersion = java -version 2>&1 | Select-Object -First 1
if (-not $javaVersion) { Write-Error "Java not installed"; exit 1 }
Write-Success "Java $javaVersion"

# Setup Maven if needed
if (-not (Test-Path $MavenBin)) {
    Write-Info "Downloading Maven (first run only)..."
    $MavenZip = "$env:TEMP\maven.zip"
    try {
        Invoke-WebRequest -Uri "https://dlcdn.apache.org/maven/maven-3/3.9.16/binaries/apache-maven-3.9.16-bin.zip" -OutFile $MavenZip -UseBasicParsing
        Expand-Archive -Path $MavenZip -DestinationPath "$env:TEMP\maven" -Force
        Remove-Item $MavenZip -Force
        Write-Success "Maven downloaded"
    } catch {
        Write-Error "Failed to download Maven: $_"
        Write-Warn "Install Maven manually and ensure 'mvn' is in PATH"
    }
}
if (Test-Path $MavenBin) {
    Write-Success "Maven 3.9.16"
}

# ----- Kill processes on required ports -----
Write-Info "Checking port availability..."
foreach ($port in @(5173, 5174, 5175, 8080, 8081)) {
    $proc = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($proc) {
        $pname = (Get-Process -Id $proc.OwningProcess -ErrorAction SilentlyContinue).ProcessName
        Write-Warn "Port $port in use by $pname (PID $($proc.OwningProcess)). Stopping..."
        Stop-Process -Id $proc.OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 500
    }
}

# ----- Build backend first (to catch compile errors early) -----
Write-Host ""
Write-Info "Building Backend..."
$BuildLog = Join-Path $Root "backend-build.log"
$build = Start-Process -NoNewWindow -FilePath $MavenBin -ArgumentList "clean compile -q" -WorkingDirectory $Backend -RedirectStandardOutput $BuildLog -RedirectStandardError "$BuildLog.err" -PassThru
$build.WaitForExit()
if ($build.ExitCode -ne 0) {
    Write-Error "Backend compilation failed! Check $BuildLog for details."
    Write-Host "--- Last 20 lines of build log ---" -ForegroundColor $Yellow
    Get-Content $BuildLog -Tail 20
    exit 1
}
Write-Success "Backend compiled successfully"

# ----- Start Backend -----
Write-Info "Starting Backend (Spring Boot)..."
$BackendLog = Join-Path $Root "backend.log"

# Use Start-Process to run Maven in background (better PATH/Java env inheritance)
$backendProcess = Start-Process -NoNewWindow -FilePath $MavenBin `
    -ArgumentList "spring-boot:run" `
    -WorkingDirectory $Backend `
    -RedirectStandardOutput $BackendLog `
    -RedirectStandardError "$BackendLog.err" `
    -PassThru

# Wait for backend (up to 120s for first-run deps)
Write-Info "Waiting for backend to start..."
$BackendReady = $false
for ($i = 1; $i -le 120; $i++) {
    Start-Sleep -Seconds 1
    if (Test-Port 8080) {
        $BackendReady = $true
        break
    }
    if ($i % 15 -eq 0) {
        Write-Info "  Still waiting... ($i seconds)"
        if ((Get-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue) -eq $null) {
            Write-Error "Backend process exited unexpectedly!"
            Write-Host "--- Last 15 lines of backend log ---" -ForegroundColor $Yellow
            Get-Content $BackendLog -Tail 15
            break
        }
    }
}

if (-not $BackendReady) {
    Write-Warn "Backend did not start. Check backend.log. Continuing with frontend only..."
} else {
    Write-Success "Backend running on http://localhost:8080"
}

# ----- Start Frontend -----
Write-Info "Starting Frontend (Vite)..."
$FrontendLog = Join-Path $Root "frontend.log"
$frontendProcess = Start-Process -NoNewWindow -FilePath "cmd.exe" `
    -ArgumentList "/c npm run dev" `
    -WorkingDirectory $Frontend `
    -RedirectStandardOutput $FrontendLog `
    -RedirectStandardError "$FrontendLog.err" `
    -PassThru

# Wait for frontend (up to 30 seconds)
$FrontendReady = $false
$FrontendUrl = "http://localhost:5173"
for ($i = 1; $i -le 30; $i++) {
    Start-Sleep -Seconds 1
    foreach ($p in @(5173, 5174, 5175)) {
        if (Test-Port $p) {
            $FrontendUrl = "http://localhost:$p"
            $FrontendReady = $true
            break
        }
    }
    if ($FrontendReady) { break }
}

if (-not $FrontendReady) {
    Write-Warn "Frontend did not start. Check frontend.log."
} else {
    Write-Success "Frontend running on $FrontendUrl"
}

# ----- Summary -----
Write-Host ""
Write-Host "==============================================" -ForegroundColor $Cyan
Write-Host "  Application is Ready!" -ForegroundColor $Green
if ($BackendReady) {
    Write-Host "  Backend : http://localhost:8080" -ForegroundColor $Cyan
}
Write-Host "  Frontend: $FrontendUrl" -ForegroundColor $Cyan
Write-Host "==============================================" -ForegroundColor $Cyan
Write-Host "  Press Ctrl+C to stop all services" -ForegroundColor $Yellow
Write-Host "==============================================" -ForegroundColor $Cyan

if (-not $NoBrowser) { Start-Process $FrontendUrl }

Write-Host ""
Write-Info "Services running. Monitoring..."
Write-Host "  (Close this window or press Ctrl+C to stop)" -ForegroundColor $Gray

# Wait for Ctrl+C
try {
    while ($true) {
        $be = Get-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue
        $fe = Get-Process -Id $frontendProcess.Id -ErrorAction SilentlyContinue
        if ($BackendReady -and (-not $be)) { Write-Error "Backend stopped unexpectedly!" }
        if (-not $fe) { Write-Error "Frontend stopped unexpectedly!"; break }
        Start-Sleep -Seconds 3
    }
} finally {
    Write-Host ""
    Write-Warn "Shutting down..."
    if ($be) { $be.Kill() }
    if ($fe) { $fe.Kill() }
    Get-Job -ErrorAction SilentlyContinue | Stop-Job | Remove-Job
    Write-Success "All services stopped. Goodbye!"
}
