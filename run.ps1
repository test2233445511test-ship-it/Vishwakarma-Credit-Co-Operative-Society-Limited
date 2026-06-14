param(
    [switch]$NoBrowser
)

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Frontend = Join-Path $Root "frontend"
$Backend = Join-Path $Root "backend"

# Maven path (auto-downloaded if missing)
$MavenHome = Join-Path $env:TEMP "maven\apache-maven-3.9.16"
$MavenBin = Join-Path $MavenHome "bin\mvn.cmd"

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor $Cyan }
function Write-Success($msg) { Write-Host "[OK] $msg" -ForegroundColor $Green }
function Write-Warn($msg) { Write-Host "[!] $msg" -ForegroundColor $Yellow }
function Write-Error($msg) { Write-Host "[ERR] $msg" -ForegroundColor $Red }

Clear-Host
Write-Host "==============================================" -ForegroundColor $Cyan
Write-Host "  Vishwakarma Cooperative Society Bank" -ForegroundColor $Yellow
Write-Host "  Starting Application..." -ForegroundColor $Cyan
Write-Host "==============================================" -ForegroundColor $Cyan
Write-Host ""

# ----- Check Prerequisites -----
Write-Info "Checking prerequisites..."

# Check Node.js
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Error "Node.js is not installed. Please install Node.js from https://nodejs.org"
    exit 1
}
Write-Success "Node.js $nodeVersion"

# Check Java
$javaVersion = java -version 2>&1 | Select-Object -First 1
if (-not $javaVersion) {
    Write-Error "Java is not installed. Please install JDK 17+ from https://adoptium.net"
    exit 1
}
Write-Success "Java $javaVersion"

# Setup Maven if needed
if (-not (Test-Path $MavenBin)) {
    Write-Info "Downloading Maven (first run only)..."
    $MavenZip = "$env:TEMP\maven.zip"
    try {
        Invoke-WebRequest -Uri "https://dlcdn.apache.org/maven/maven-3/3.9.16/binaries/apache-maven-3.9.16-bin.zip" -OutFile $MavenZip -UseBasicParsing
        Expand-Archive -Path $MavenZip -DestinationPath "$env:TEMP\maven" -Force
        Remove-Item $MavenZip -Force
        Write-Success "Maven downloaded successfully"
    } catch {
        Write-Error "Failed to download Maven: $_"
        Write-Warn "Please install Maven manually and ensure 'mvn' is in PATH"
    }
}
if (Test-Path $MavenBin) {
    Write-Success "Maven 3.9.16"
    $env:Path = "$(Split-Path $MavenBin);$env:Path"
}

# ----- Kill any existing processes on required ports -----
$ports = @(5173, 5174, 5175, 8080, 8081)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($process) {
        $procName = (Get-Process -Id $process -ErrorAction SilentlyContinue).ProcessName
        Write-Warn "Port $port in use by $procName (PID $process). Stopping..."
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 500
    }
}

# ----- Start Backend -----
Write-Host ""
Write-Info "Starting Backend (Spring Boot)..."

$BackendLog = Join-Path $Root "backend.log"
$BackendJob = Start-Job -Name "Backend" -ScriptBlock {
    param($dir, $logFile)
    Set-Location -LiteralPath $dir
    $env:Path = "$env:TEMP\maven\apache-maven-3.9.16\bin;$env:Path"
    mvn spring-boot:run -q *>&1 | Tee-Object -FilePath $logFile
} -ArgumentList $Backend, $BackendLog

# Wait for backend to be ready (up to 60 seconds)
Write-Info "Waiting for backend to start..."
$BackendReady = $false
for ($i = 1; $i -le 60; $i++) {
    Start-Sleep -Seconds 1
    $result = Test-NetConnection -ComputerName localhost -Port 8080 -WarningAction SilentlyContinue -InformationLevel Quiet 2>$null
    if ($result -eq $true) {
        $BackendReady = $true
        break
    }
    if ($i % 10 -eq 0) {
        Write-Info "  Still waiting... ($i seconds)"
    }
}

if (-not $BackendReady) {
    Write-Warn "Backend did not start within 60 seconds."
    Write-Warn "Check backend.log for details. Continuing with frontend only..."
} else {
    Write-Success "Backend is running on http://localhost:8080"
}

# ----- Start Frontend -----
Write-Info "Starting Frontend (Vite)..."
$FrontendLog = Join-Path $Root "frontend.log"
$FrontendJob = Start-Job -Name "Frontend" -ScriptBlock {
    param($dir, $logFile)
    Set-Location -LiteralPath $dir
    npm run dev *>&1 | Tee-Object -FilePath $logFile
} -ArgumentList $Frontend, $FrontendLog

# Wait for frontend to be ready (up to 30 seconds)
$FrontendReady = $false
$FrontendUrl = "http://localhost:5173"
for ($i = 1; $i -le 30; $i++) {
    Start-Sleep -Seconds 1
    $portsToCheck = @(5173, 5174, 5175)
    foreach ($p in $portsToCheck) {
        $result = Test-NetConnection -ComputerName localhost -Port $p -WarningAction SilentlyContinue -InformationLevel Quiet 2>$null
        if ($result -eq $true) {
            $FrontendUrl = "http://localhost:$p"
            $FrontendReady = $true
            break
        }
    }
    if ($FrontendReady) { break }
}

if (-not $FrontendReady) {
    Write-Warn "Frontend did not start within 30 seconds."
    Write-Warn "Check frontend.log for details."
} else {
    Write-Success "Frontend is running on $FrontendUrl"
}

# ----- Open Browser -----
Write-Host ""
Write-Host "==============================================" -ForegroundColor $Cyan
Write-Host "  Application is Ready!" -ForegroundColor $Green
if ($BackendReady) {
    Write-Host "  Backend : http://localhost:8080" -ForegroundColor $Cyan
    Write-Host "  H2 DB   : http://localhost:8080/h2-console" -ForegroundColor $Cyan
}
Write-Host "  Frontend: $FrontendUrl" -ForegroundColor $Cyan
Write-Host "==============================================" -ForegroundColor $Cyan
Write-Host "  Press Ctrl+C to stop all services" -ForegroundColor $Yellow
Write-Host "==============================================" -ForegroundColor $Cyan

if (-not $NoBrowser) {
    Start-Process $FrontendUrl
}

# Keep script running and handle Ctrl+C for cleanup
Write-Host ""
Write-Info "Services running. Monitoring logs..."

# Trap Ctrl+C to clean up
$cleanup = {
    Write-Host ""
    Write-Warn "Shutting down..."
    Get-Job -Name "Backend" -ErrorAction SilentlyContinue | Stop-Job | Remove-Job
    Get-Job -Name "Frontend" -ErrorAction SilentlyContinue | Stop-Job | Remove-Job
    Write-Success "All services stopped. Goodbye!"
}

Register-EngineEvent -SourceIdentifier PowerShell.Exiting -SupportEvent -Action $cleanup

try {
    while ($true) {
        $backendState = (Get-Job -Name "Backend" -ErrorAction SilentlyContinue).State
        $frontendState = (Get-Job -Name "Frontend" -ErrorAction SilentlyContinue).State

        if ($backendState -eq "Failed") {
            Write-Error "Backend process has stopped unexpectedly!"
            Write-Warn "Check backend.log for details"
        }
        if ($frontendState -eq "Failed") {
            Write-Error "Frontend process has stopped unexpectedly!"
            Write-Warn "Check frontend.log for details"
        }

        Start-Sleep -Seconds 5
    }
} finally {
    & $cleanup
}
