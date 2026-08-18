# Restaura BOLSA backup en PostgreSQL local sin roles de Azure
# Uso: .\restore-empleos.ps1
# Requiere: PostgreSQL 18 en PATH, password postgres en $env:PGPASSWORD

$ErrorActionPreference = "Stop"
$pgRestore = "C:\Program Files\PostgreSQL\18\bin\pg_restore.exe"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$backup = "C:\Users\Usuario\Desktop\feria\BOLSA_~1.BAC"
$dbName = "Empleos"
$pgUser = "postgres"
$pgHost = "localhost"
$pgPort = "5432"

if (-not $env:PGPASSWORD) {
    Write-Host "Define la variable de entorno PGPASSWORD con la clave de postgres." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $pgRestore)) {
    Write-Host "No se encontro pg_restore en $pgRestore" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $backup)) {
    Write-Host "No se encontro el backup: $backup" -ForegroundColor Red
    exit 1
}

Write-Host "1. Recreando base $dbName ..." -ForegroundColor Cyan
& $psql -h $pgHost -p $pgPort -U $pgUser -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname IN ('Empleos','empleos') AND pid <> pg_backend_pid();"
& $psql -h $pgHost -p $pgPort -U $pgUser -d postgres -c 'DROP DATABASE IF EXISTS "Empleos";'
& $psql -h $pgHost -p $pgPort -U $pgUser -d postgres -c "DROP DATABASE IF EXISTS empleos;"
& $psql -h $pgHost -p $pgPort -U $pgUser -d postgres -c 'CREATE DATABASE "Empleos";'

Write-Host "2. Restaurando datos (sin ACL ni owner de Azure) ..." -ForegroundColor Cyan
& $pgRestore --host $pgHost --port $pgPort --username $pgUser --no-owner --no-acl -d $dbName --verbose $backup

if ($LASTEXITCODE -ne 0) {
    Write-Host "pg_restore termino con codigo $LASTEXITCODE (revisa errores arriba)." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "3. Permisos postgres + roles de login (admin/empresa/postulante) ..." -ForegroundColor Cyan
$grantScript = Join-Path $PSScriptRoot "grant-postgres-local.sql"
$permScript = Join-Path $PSScriptRoot "setup-local-permissions.sql"
& $psql -h $pgHost -p $pgPort -U $pgUser -d $dbName -f $grantScript
& $psql -h $pgHost -p $pgPort -U $pgUser -d $dbName -f $permScript

Write-Host "Listo. Base $dbName restaurada. Cierra sesion en la app y vuelve a entrar." -ForegroundColor Green