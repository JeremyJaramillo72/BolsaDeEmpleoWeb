param(
  [string]$Correo,
  [string]$Contrasena
)
$body = @{ correo = $Correo; contrasena = $Contrasena } | ConvertTo-Json
try {
  $r = Invoke-WebRequest -Uri 'http://localhost:8080/api/auth/login' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
  Write-Output "OK $($r.StatusCode): $($r.Content.Substring(0, [Math]::Min(120, $r.Content.Length)))"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  Write-Output "FAIL $code"
}
