$ErrorActionPreference = 'Stop'

$taskName = 'NexusMusic Discord Presence'
$installDir = Join-Path $env:LOCALAPPDATA 'NexusMusic\discord-bridge'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$identity = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name

function Test-BridgePort {
    $client = [System.Net.Sockets.TcpClient]::new()
    try {
        $connect = $client.BeginConnect('127.0.0.1', 17845, $null, $null)
        if (-not $connect.AsyncWaitHandle.WaitOne(300)) {
            return $false
        }
        $client.EndConnect($connect)
        return $true
    } catch {
        return $false
    } finally {
        $client.Dispose()
    }
}

$node = Get-Command node.exe -ErrorAction SilentlyContinue
$npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $node -or -not $npm) {
    throw 'Instala Node.js 18 o posterior (incluyendo npm) y vuelve a ejecutar este instalador.'
}

$nodeVersion = (& $node.Source --version).TrimStart('v')
if ([version]$nodeVersion -lt [version]'18.0') {
    throw "Se requiere Node.js 18 o posterior; se encontró $nodeVersion."
}

foreach ($file in @('package.json', 'bridge.cjs')) {
    if (-not (Test-Path (Join-Path $scriptDir $file))) {
        throw "No se encontró $file junto al instalador. Ejecuta el script desde la carpeta discord-bridge completa."
    }
}

$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask -and $existingTask.State -eq 'Running') {
    Stop-ScheduledTask -TaskName $taskName
    $deadline = (Get-Date).AddSeconds(10)
    while ((Test-BridgePort) -and (Get-Date) -lt $deadline) {
        Start-Sleep -Milliseconds 250
    }
}
if (Test-BridgePort) {
    throw 'El puerto 17845 ya está ocupado por otro asistente. Cierra el asistente NexusMusic anterior y vuelve a ejecutar el instalador.'
}

New-Item -ItemType Directory -Path $installDir -Force | Out-Null
Copy-Item (Join-Path $scriptDir 'package.json') (Join-Path $installDir 'package.json') -Force
Copy-Item (Join-Path $scriptDir 'bridge.cjs') (Join-Path $installDir 'bridge.cjs') -Force

Push-Location $installDir
try {
    & $npm.Source install --omit=dev
    if ($LASTEXITCODE -ne 0) {
        throw "npm install falló con el código $LASTEXITCODE."
    }
} finally {
    Pop-Location
}

$bridgePath = Join-Path $installDir 'bridge.cjs'
$action = New-ScheduledTaskAction `
    -Execute $node.Source `
    -Argument "`"$bridgePath`"" `
    -WorkingDirectory $installDir
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $identity
$principal = New-ScheduledTaskPrincipal `
    -UserId $identity `
    -LogonType Interactive `
    -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -ExecutionTimeLimit ([TimeSpan]::Zero) `
    -MultipleInstances IgnoreNew `
    -Hidden

Register-ScheduledTask `
    -TaskName $taskName `
    -Description 'NexusMusic Discord Rich Presence' `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Force | Out-Null
Start-ScheduledTask -TaskName $taskName

$deadline = (Get-Date).AddSeconds(10)
while (-not (Test-BridgePort) -and (Get-Date) -lt $deadline) {
    Start-Sleep -Milliseconds 250
}
if (-not (Test-BridgePort)) {
    throw "El instalador creó la tarea, pero el asistente no abrió el puerto 17845. Revisa la tarea '$taskName' en el Programador de tareas."
}

Write-Host 'Instalado y activo. Se iniciará automáticamente cuando inicies sesión en Windows.'
Write-Host 'Abre Discord y visita https://nexusmusicx.vercel.app/listen?web=1 para activar la presencia.'
