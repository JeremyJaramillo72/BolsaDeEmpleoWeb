import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, map, tap } from 'rxjs';
import {
  DocumentoPdfRef,
  nombreDesdeUrlAzure,
  resolverNombreDocumento,
  resolverUrlDocumento,
  sanitizarNombreArchivo,
  urlDescargarDocumento,
  urlVerDocumento
} from '../utils/documento-storage-url';

@Injectable({ providedIn: 'root' })
export class DocumentoPdfService implements OnDestroy {

  private objectUrls: string[] = [];

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  /** Carga el PDF como blob → iframe sin problemas cross-origin. */
  obtenerUrlIframe(urlAzure: string, nombre?: string): Observable<SafeResourceUrl> {
    const apiUrl = urlVerDocumento(urlAzure, nombre);
    return this.http.get(apiUrl, { responseType: 'blob' }).pipe(
      map(blob => this.crearUrlSeguraDesdeBlob(blob))
    );
  }

  /** Abre vista previa en pestaña con título de archivo correcto. */
  abrirVistaPrevia(ref: string | DocumentoPdfRef): void {
    const url = resolverUrlDocumento(ref);
    const nombre = resolverNombreDocumento(ref, nombreDesdeUrlAzure(url));
    this.http.get(urlVerDocumento(url, nombre), { responseType: 'blob' }).subscribe({
      next: blob => {
        const objectUrl = this.registrarObjectUrl(blob);
        const titulo = nombre || 'documento.pdf';
        const ventana = window.open(objectUrl, '_blank');
        if (ventana) {
          ventana.document.title = titulo;
          const fijarTitulo = () => { try { ventana.document.title = titulo; } catch { /* ignore */ } };
          fijarTitulo();
          ventana.addEventListener('load', fijarTitulo);
        }
      },
      error: () => console.error('No se pudo abrir el PDF')
    });
  }

  /** Descarga con nombre legible (no "anonymous"). */
  descargar(ref: string | DocumentoPdfRef): void {
    const url = resolverUrlDocumento(ref);
    const nombre = sanitizarNombreArchivo(
      resolverNombreDocumento(ref, nombreDesdeUrlAzure(url)) || 'documento.pdf'
    );
    this.http.get(urlDescargarDocumento(url, nombre), { responseType: 'blob' }).subscribe({
      next: blob => {
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = nombre;
        a.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: () => console.error('No se pudo descargar el PDF')
    });
  }

  ngOnDestroy(): void {
    this.revokeAll();
  }

  revokeAll(): void {
    this.objectUrls.forEach(u => URL.revokeObjectURL(u));
    this.objectUrls = [];
  }

  private crearUrlSeguraDesdeBlob(blob: Blob): SafeResourceUrl {
    const typed = blob.type === 'application/pdf'
      ? blob
      : new Blob([blob], { type: 'application/pdf' });
    const objectUrl = this.registrarObjectUrl(typed);
    return this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
  }

  private registrarObjectUrl(blob: Blob): string {
    const typed = blob.type === 'application/pdf'
      ? blob
      : new Blob([blob], { type: 'application/pdf' });
    const objectUrl = URL.createObjectURL(typed);
    this.objectUrls.push(objectUrl);
    return objectUrl;
  }
}
