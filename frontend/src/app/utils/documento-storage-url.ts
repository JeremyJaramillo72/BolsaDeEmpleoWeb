const API_BASE = 'http://localhost:8080/api';

export interface DocumentoPdfRef {
  url: string;
  nombre?: string;
}

export function esUrlAzure(url: string | null | undefined): boolean {
  return !!url && url.includes('blob.core.windows.net');
}

/** Nombre de archivo desde la ruta del blob (pdfs/uuid.pdf). */
export function nombreDesdeUrlAzure(urlAzure: string): string {
  const limpia = urlAzure.split('?')[0];
  const segmento = limpia.split('/').filter(Boolean).pop() || 'documento.pdf';
  return segmento.toLowerCase().endsWith('.pdf') ? segmento : `${segmento}.pdf`;
}

export function sanitizarNombreArchivo(nombre: string): string {
  const base = nombre.trim().replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, '_');
  return base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`;
}

function buildStorageQuery(urlAzure: string, nombre?: string): string {
  const urlLimpia = urlAzure.split('?')[0];
  const params = new URLSearchParams({ url: urlLimpia });
  if (nombre) {
    params.set('nombre', sanitizarNombreArchivo(nombre));
  }
  return params.toString();
}

/** URL para vista previa (inline) en iframe o pestaña. */
export function urlVerDocumento(urlAzure: string | null | undefined, nombre?: string): string {
  if (!urlAzure) return '';
  if (!esUrlAzure(urlAzure)) return urlAzure;
  return `${API_BASE}/storage/ver?${buildStorageQuery(urlAzure, nombre)}`;
}

/** URL para forzar descarga con nombre de archivo. */
export function urlDescargarDocumento(urlAzure: string | null | undefined, nombre?: string): string {
  if (!urlAzure) return '';
  if (!esUrlAzure(urlAzure)) return urlAzure;
  return `${API_BASE}/storage/descargar?${buildStorageQuery(urlAzure, nombre)}`;
}

export function resolverUrlDocumento(ref: string | DocumentoPdfRef): string {
  return typeof ref === 'string' ? ref : ref.url;
}

export function resolverNombreDocumento(ref: string | DocumentoPdfRef, fallback?: string): string | undefined {
  if (typeof ref === 'string') return fallback;
  return ref.nombre || fallback;
}

export function refDocumento(url: string, nombreLegible: string): DocumentoPdfRef {
  return { url, nombre: sanitizarNombreArchivo(nombreLegible) };
}
