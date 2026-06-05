# Restaurar backup BOLSA en PostgreSQL local

## Problema

El backup viene de **Azure** e incluye cientos de `GRANT` a roles que no existen en tu PC (`Kennyvera43@gmail.com`, `PruebaRoles`, `RolesBDpruebas`, `grupo_*`, etc.). Los **datos y el esquema sí se restauran**; fallan solo los permisos al final.

## Solución recomendada (sin roles Azure)

### 1. Borrar y recrear la base

En pgAdmin: clic derecho en `Empleos` → Delete/Drop. Crear de nuevo la base `Empleos`.

### 2. Restaurar sin permisos Azure

En PowerShell (ajusta la ruta del `.bac` si es distinta):

```powershell
cd C:\Users\Usuario\Desktop\feria\backend\scripts
$env:PGPASSWORD = "postgreAdmin19"
.\restore-empleos.ps1
```

O manualmente:

```text
"C:\Program Files\PostgreSQL\18\bin\pg_restore.exe" --host localhost --port 5432 --username postgres --no-owner --no-acl -d Empleos --verbose "C:\Users\Usuario\Desktop\feria\BOLSA_~1.BAC"
```

### 3. Permisos de login (admin / empresa / postulante)

Después del restore, ejecuta (o usa `restore-empleos.ps1`, que ya lo incluye):

```powershell
$env:PGPASSWORD = "postgreAdmin19"
psql -h localhost -p 5432 -U postgres -d Empleos -f backend/scripts/setup-local-permissions.sql
```

Contraseñas de conexión BD por tipo de usuario (campo `seguridad.clave_name`):

| Tipo | Contraseña rol PostgreSQL |
|------|---------------------------|
| Administrador | `claveadmin` |
| Empresa | `claveempresa` |
| Postulante | `clavepostulante` |
| Supervisor | `clavesupervisor` |
| Otros roles dinámicos | valor de `clave_name` en la fila |

**Importante:** cierra sesión en la app y vuelve a iniciar sesión para que el backend active el rol correcto.

### 4. application.properties

Ya apunta a `Empleos` con usuario `postgres`. Reinicia el backend Spring Boot.

### 4. Login en la app

Los usuarios de negocio están en `usuarios.usuario` / `seguridad.seguridad` del backup. Para probar, consulta en pgAdmin:

```sql
SELECT correo, nombre, apellido FROM usuarios.usuario LIMIT 20;
```

Usa un correo del backup con la contraseña que tenga guardada en `seguridad` (o regístrate de nuevo si hace falta).

## Si necesitas los roles Azure (opcional)

1. Ejecuta `create-roles-empleos-restore.sql` en la base `postgres`.
2. Vuelve a restaurar solo ACL:  
   `pg_restore --section=acl -d Empleos "ruta\al\backup.bac"`

Para desarrollo local, `--no-acl` + permisos a `postgres` suele ser suficiente.