const AZURE_BACKEND_ORIGIN =
  'https://bolsa-empleo-api-egfhh7c5e2evcgcp.westus3-01.azurewebsites.net';
const LOCAL_BACKEND_ORIGIN = 'http://localhost:8080';

function resolveBackendOrigin(): string {
  if (typeof window === 'undefined') {
    return AZURE_BACKEND_ORIGIN;
  }

  // Modo prueba con backend en IntelliJ (localhost:8080)
  if (localStorage.getItem('USE_LOCAL_BACKEND') === 'true') {
    return LOCAL_BACKEND_ORIGIN;
  }

  // Por defecto: Azure (aunque el frontend corra en localhost:4200)
  return AZURE_BACKEND_ORIGIN;
}

export const BACKEND_ORIGIN = resolveBackendOrigin();
export const USE_LOCAL_BACKEND = BACKEND_ORIGIN === LOCAL_BACKEND_ORIGIN;
export const API_BASE_URL = `${BACKEND_ORIGIN}/api`;
