# Azure Blob Storage — PDFs y documentos

El backend sube los PDF a Azure y **solo guarda la URL** en PostgreSQL (postulaciones, perfil profesional, ofertas, etc.).

## 1. Crear cuenta de almacenamiento (Portal Azure)

1. Entra a [Azure Portal](https://portal.azure.com).
2. **Crear un recurso** → **Storage account** (Cuenta de almacenamiento).
3. Configuración sugerida:
   - **Suscripción / Grupo de recursos**: el mismo que usan para `bolsi-empleo-dbpg` (o uno nuevo del equipo).
   - **Nombre de la cuenta**: solo minúsculas y números, único global, ej. `bolsaempleopdfs2025` (3–24 caracteres).
   - **Región**: la misma que la base de datos (ej. East US).
   - **Rendimiento**: Standard.
   - **Redundancia**: LRS (suficiente para desarrollo/pruebas).
4. **Revisar y crear**.

## 2. Obtener credenciales

1. Abre la cuenta de almacenamiento creada.
2. Menú **Seguridad y redes** → **Claves de acceso**.
3. Copia:
   - **Nombre de la cuenta de almacenamiento**
   - **clave1** (o clave2)

## 3. Configurar el backend

Edita `backend/src/main/resources/application.properties`:

```properties
azure.storage.account-name=TU_NOMBRE_CUENTA
azure.storage.account-key=TU_CLAVE_DE_64_CARACTERES
```

(O pega la cadena completa en `azure.storage.connection-string` desde **Cadena de conexión** → clave1.)

## 4. Contenedores

Al **reiniciar el backend**, se crean automáticamente si no existen:

| Contenedor   | Uso                                      | Acceso sugerido      |
|-------------|-------------------------------------------|----------------------|
| `documents` | PDFs (postulaciones, perfil, ofertas)     | Blob (lectura anónima) |
| `backups`   | Respaldos ZIP de la base de datos         | Privado              |

Los archivos de documentos se guardan bajo la ruta: `pdfs/<uuid>.pdf`.

Si el contenedor `documents` ya existía como privado, en Portal:

**Contenedores** → `documents` → **Cambiar nivel de acceso** → **Blob (acceso de lectura anónimo solo para blobs)**.

## 5. Comprobar que funciona

Con el backend en marcha:

```http
GET http://localhost:8080/api/storage/estado
```

Respuesta esperada:

```json
{
  "configurado": true,
  "contenedorDocumentos": "documents",
  "documentosExiste": true,
  "contenedorBackups": "backups",
  "backupsExiste": true
}
```

Luego prueba:

- Subir un PDF en **perfil profesional** (formación con adjunto).
- **Postular** a una oferta con CV en PDF.

En la BD debe quedar una URL tipo:

`https://TU_CUENTA.blob.core.windows.net/documents/pdfs/xxxxxxxx.pdf`

## 6. Script PowerShell (opcional, requiere Azure CLI)

Si tienes `az login` instalado:

```powershell
cd backend\scripts
.\setup-azure-storage.ps1 -StorageAccountName "bolsaempleopdfs2025" -ResourceGroup "TU_GRUPO"
```

Después copia el nombre de cuenta y la clave al `application.properties`.

## Seguridad

- No subas `application.properties` con claves reales a un repositorio público.
- En producción, restringe el acceso de red de la cuenta de almacenamiento si hace falta.
