$date = Get-Date -Format "yyyyMMdd_HHmm"
$backupName = "TopHitsBr_Backup_$date.zip"
$tempDir = "TempBackup_$date"

Write-Host "Iniciando Backup: $backupName"

# Create Temp Directory using consistent naming
$clientDir = "$tempDir\client"
$serverDir = "$tempDir\server"

New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
New-Item -ItemType Directory -Force -Path $clientDir | Out-Null
New-Item -ItemType Directory -Force -Path $serverDir | Out-Null

# Copy Client
Write-Host "Copiando Client..."
# Recursively copy src and public
Copy-Item -Path "client\src" -Destination $clientDir -Recurse
Copy-Item -Path "client\public" -Destination $clientDir -Recurse
# Copy files in client root
Get-ChildItem -Path "client\*" -File | Copy-Item -Destination $clientDir

# Copy Server
Write-Host "Copiando Server..."
# Recursively copy src
# If src exists
if (Test-Path "server\src") {
    Copy-Item -Path "server\src" -Destination $serverDir -Recurse
}
# Copy all files in server root
Get-ChildItem -Path "server\*" -File | Copy-Item -Destination $serverDir

# Copy Root Files
Get-ChildItem -Path "*" -File | Where-Object { $_.Name -ne $backupName } | Copy-Item -Destination $tempDir

# Compress
Write-Host "Compactando..."
Compress-Archive -Path "$tempDir\*" -DestinationPath $backupName -Force

# Cleanup
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Backup Concluido: $backupName"
