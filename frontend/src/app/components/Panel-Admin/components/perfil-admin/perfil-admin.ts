import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfilAdminService, PerfilAdminDTO } from '../../services/perfil-admin.service';

@Component({
  selector: 'app-perfil-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-admin.html',
  styleUrls: ['./perfil-admin.css']
})
export class PerfilAdminComponent implements OnInit {

  perfil: PerfilAdminDTO | null = null;

  nombre          = '';
  apellido        = '';
  telefono        = '';
  genero          = '';
  fechaNacimiento = '';

  fotoPreviewUrl: string | null = null;
  archivoFoto:    File | null   = null;
  subiendoFoto    = false;
  isDragging      = false;

  cargando  = true;
  guardando = false;

  mensajeExito = '';
  mensajeError = '';

  readonly opcionesGenero = [
    { valor: 'M',                 label: 'Masculino'         },
    { valor: 'F',                 label: 'Femenino'          },
    { valor: 'PREFIERO_NO_DECIR', label: 'Prefiero no decir' },
  ];

  constructor(
      private service: PerfilAdminService,
      private cdr:     ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idStr = localStorage.getItem('idUsuario');
    if (idStr) this.cargarPerfil(Number(idStr));
  }

  cargarPerfil(idUsuario: number): void {
    this.cargando = true;
    this.service.obtenerPerfil(idUsuario).subscribe({
      next: (p: PerfilAdminDTO) => {
        this.perfil          = p;
        this.nombre          = p.nombre          ?? '';
        this.apellido        = p.apellido        ?? '';
        this.telefono        = p.telefono        ?? '';
        this.genero          = p.genero          ?? '';
        this.fechaNacimiento = p.fechaNacimiento ?? '';
        this.fotoPreviewUrl  = null;
        this.archivoFoto     = null;
        this.cargando        = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.mensajeError = 'Error al cargar el perfil.';
        this.cargando     = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirSelector(): void {
    (document.getElementById('fotoInput') as HTMLInputElement)?.click();
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault(); e.stopPropagation();
    this.isDragging = true; this.cdr.detectChanges();
  }
  onDragLeave(e: DragEvent): void {
    e.preventDefault(); e.stopPropagation();
    this.isDragging = false; this.cdr.detectChanges();
  }
  onDrop(e: DragEvent): void {
    e.preventDefault(); e.stopPropagation();
    this.isDragging = false;
    const f = e.dataTransfer?.files?.[0];
    if (f) this.procesarArchivo(f);
    this.cdr.detectChanges();
  }
  onArchivoSeleccionado(e: Event): void {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) this.procesarArchivo(f);
  }

  private procesarArchivo(archivo: File): void {
    if (!archivo.type.startsWith('image/')) {
      this.mostrarError('Solo se permiten imágenes (JPG, PNG, WebP...).'); return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      this.mostrarError('La imagen no puede superar 5 MB.'); return;
    }
    this.archivoFoto = archivo;
    const r = new FileReader();
    r.onload = () => { this.fotoPreviewUrl = r.result as string; this.cdr.detectChanges(); };
    r.readAsDataURL(archivo);
  }

  subirFoto(): void {
    if (!this.archivoFoto || !this.perfil) return;
    this.subiendoFoto = true;
    this.service.actualizarFoto(this.perfil.idUsuario, this.archivoFoto).subscribe({
      next: (res: { mensaje: string; urlImagen: string; perfil: PerfilAdminDTO }) => {
        this.mostrarExito('✅ Foto actualizada correctamente.');
        this.service.emitirFoto(res.urlImagen ?? '');
        this.archivoFoto = null; this.fotoPreviewUrl = null;
        const inp = document.getElementById('fotoInput') as HTMLInputElement;
        if (inp) inp.value = '';
        this.cargarPerfil(this.perfil!.idUsuario);
        this.subiendoFoto = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.mostrarError('❌ Error al subir foto: ' + (err.error?.error || err.message));
        this.subiendoFoto = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelarFoto(): void {
    this.archivoFoto = null; this.fotoPreviewUrl = null; this.isDragging = false;
    const inp = document.getElementById('fotoInput') as HTMLInputElement;
    if (inp) inp.value = '';
    this.cdr.detectChanges();
  }

  guardar(): void {
    if (!this.nombre.trim())   { this.mostrarError('El nombre es obligatorio.');   return; }
    if (!this.apellido.trim()) { this.mostrarError('El apellido es obligatorio.'); return; }
    this.guardando = true;
    this.service.actualizarPerfil(this.perfil!.idUsuario, {
      nombre:          this.nombre.trim(),
      apellido:        this.apellido.trim(),
      telefono:        this.telefono.trim()        || null,
      genero:          this.genero                 || null,
      fechaNacimiento: this.fechaNacimiento        || null,
    }).subscribe({
      next: (p: PerfilAdminDTO) => {
        this.perfil    = p;
        this.guardando = false;
        // ✅ Emitir nombre en tiempo real — menú se actualiza sin F5
        this.service.emitirNombre(p.nombre, p.apellido);
        this.mostrarExito('✅ Perfil actualizado correctamente.');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.mostrarError('❌ Error al guardar: ' + (err.error?.error || err.message));
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelar(): void {
    if (!this.perfil) return;
    this.nombre          = this.perfil.nombre          ?? '';
    this.apellido        = this.perfil.apellido        ?? '';
    this.telefono        = this.perfil.telefono        ?? '';
    this.genero          = this.perfil.genero          ?? '';
    this.fechaNacimiento = this.perfil.fechaNacimiento ?? '';
    this.cancelarFoto();
    this.mensajeExito = ''; this.mensajeError = '';
    this.cdr.detectChanges();
  }

  get fotoActual(): string | null {
    return this.fotoPreviewUrl ?? this.perfil?.urlImagen ?? null;
  }
  get iniciales(): string {
    const n = this.perfil?.nombre?.[0]   ?? '';
    const a = this.perfil?.apellido?.[0] ?? '';
    return (n + a).toUpperCase();
  }

  formatearFecha(f: string | null): string {
    if (!f) return '—';
    return new Date(f).toLocaleDateString('es-EC',
        { year: 'numeric', month: 'long', day: 'numeric' });
  }

  mostrarExito(msg: string): void {
    this.mensajeExito = msg; this.mensajeError = '';
    setTimeout(() => { this.mensajeExito = ''; this.cdr.detectChanges(); }, 5000);
  }
  mostrarError(msg: string): void {
    this.mensajeError = msg; this.mensajeExito = '';
    setTimeout(() => { this.mensajeError = ''; this.cdr.detectChanges(); }, 7000);
  }
}
