# Crea cuenta de almacenamiento y contenedores documents + backups en Azure
# Requisito: Azure CLI (az) y sesion iniciada: az login
#
# Uso:
#   .\setup-azure-storage.ps1 -StorageAccountName "bolsaempleopdfs2025" -ResourceGroup "mi-grupo-rg"

param(
    [Parameter(Mandatory = $true)]
    [string]$StorageAccountName,

    [string]$ResourceGroup = "rg-bolsa-empleo",

    [string]$Location = "eastus",

    [string]$ContainerDocuments = "documents",

    [string]$ContainerBackups = "backups"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Host "Azure CLI no instalado. Sigue los pasos manuales en AZURE-STORAGE.md" -ForegroundColor Yellow
    exit 1
}

Write-Host "1. Grupo de recursos..." -ForegroundColor Cyan
az group create --name $ResourceGroup --location $Location | Out-Null

Write-Host "2. Cuenta de almacenamiento: $StorageAccountName ..." -ForegroundColor Cyan
az storage account create `
    --name $StorageAccountName `
    --resource-group $ResourceGroup `
    --location $Location `
    --sku Standard_LRS `
    --kind StorageV2 `
    --allow-blob-public-access true | Out-Null

Write-Host "3. Contenedor $ContainerDocuments (lectura blob publica)..." -ForegroundColor Cyan
az storage container create `
    --name $ContainerDocuments `
    --account-name $StorageAccountName `
    --auth-mode login `
    --public-access blob | Out-Null

Write-Host "4. Contenedor $ContainerBackups (privado)..." -ForegroundColor Cyan
az storage container create `
    --name $ContainerBackups `
    --account-name $StorageAccountName `
    --auth-mode login `
    --public-access off | Out-Null

$key = az storage account keys list `
    --resource-group $ResourceGroup `
    --account-name $StorageAccountName `
    --query "[0].value" -o tsv

Write-Host ""
Write-Host "Listo. Agrega en application.properties:" -ForegroundColor Green
Write-Host "azure.storage.account-name=$StorageAccountName"
Write-Host "azure.storage.account-key=$key"
Write-Host ""
Write-Host "Reinicia el backend y prueba: GET http://localhost:8080/api/storage/estado"
