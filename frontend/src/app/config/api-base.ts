const AZURE_BACKEND_ORIGIN =
  'https://bolsa-empleo-api-egfhh7c5e2evcgcp.westus3-01.azurewebsites.net';
const LOCAL_BACKEND_ORIGIN = 'http://localhost:8080';

function resolveBackendOrigin(): string {
  if (typeof window === 'undefined') {
    return LOCAL_BACKEND_ORIGIN;
  }

  // Si estamos en localhost o 127.0.0.1, usar siempre el backend local
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return LOCAL_BACKEND_ORIGIN;
  }

  // Si el usuario forzó explícitamente backend local
  if (localStorage.getItem('USE_LOCAL_BACKEND') === 'true') {
    return LOCAL_BACKEND_ORIGIN;
  }

  // En producción (ej. Vercel)
  return AZURE_BACKEND_ORIGIN;
}

export const BACKEND_ORIGIN = resolveBackendOrigin();
export const USE_LOCAL_BACKEND = BACKEND_ORIGIN === LOCAL_BACKEND_ORIGIN;
export const API_BASE_URL = `${BACKEND_ORIGIN}/api`;
