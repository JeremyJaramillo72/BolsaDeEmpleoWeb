import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarPerfilComponent } from '../perfil-profesional/sidebar-perfil/sidebar-perfil';
import { FormDatosPersonalesComponent } from  '../perfil-profesional/form-datos-personales/form-datos-personales';
import { SeccionAcademicaComponent } from '../perfil-profesional/seccion-academica/seccion-academica';
import { SeccionIdiomasComponent } from '../perfil-profesional/seccion-idiomas/seccion-idiomas';
import { SeccionExperienciaComponent } from '../perfil-profesional/seccion-experiencia/seccion-experiencia';
import { SeccionCursosComponent } from '../perfil-profesional/seccion-cursos/seccion-cursos';

import { PerfilService } from './perfil.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiNotificationService } from '../../services/ui-notification.service';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-perfil-profesional',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarPerfilComponent, FormDatosPersonalesComponent, SeccionAcademicaComponent, SeccionIdiomasComponent, SeccionCursosComponent, SeccionExperienciaComponent],
  templateUrl: './perfil-profesional.html',
  styleUrls: ['./perfil-profesional.css'],
  encapsulation: ViewEncapsulation.None
})
export class PerfilProfesionalComponent implements OnInit {


  perfil: any = {
    nombre: '', apellido: '', nombreCompleto: '', cedula: '',
    fechaNacimiento: '', genero: '', correo: '', telefono: '',
    direccion: '', id_provincia: null, id_ciudad: null,
    titulos: [], idiomas: [], experiencias: [], cursos: []
  };

  completitudPerfil: number = 0;
  rol: string = 'Postulante';
  fotoUrl: string | ArrayBuffer | null = null;
  idUsuarioLogueado: number = 0;
  archivoSeleccionado: File | null = null;


  facultades: any[] = [];
  carrerasNuevoTitulo: any[] = [];
  idiomasDisponibles: any[] = [];
  niveles: string[] = ['Básico', 'Intermedio (B1/B2)', 'Avanzado (C1)', 'Nativo'];
  cargosDisponibles: any[] = [];
  empresasDisponibles: any[] = [];
  provincias: any[] = [];
  ciudades: any[] = [];
  ciudadesExp: any[] = [];
  categorias: any[] = [];

  constructor(
    private perfilService: PerfilService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notif: UiNotificationService,
    private confirmSvc: ConfirmService
  ) {}

  ngOnInit(): void {
    const idLocal = localStorage.getItem('idUsuario');
    if (idLocal) {
      this.idUsuarioLogueado = Number(idLocal);
      this.cargarCatalogos();
      this.cargarDatosDesdeBackend();
    } else {
      this.router.navigate(['/login']);
    }
  }


  cargarCatalogos(): void {
    this.perfilService.getFacultades().subscribe({ next: res => this.facultades = res, error: err => console.warn('Error', err) });
    this.perfilService.getIdiomasCatalogo().subscribe({ next: res => this.idiomasDisponibles = res, error: err => console.error('Error', err) });
    this.perfilService.obtenerCategorias().subscribe({ next: res => this.categorias = res, error: err => console.warn('Error', err) });
    this.perfilService.obtenerProvincias().subscribe({ next: res => { this.provincias = res; }, error: err => console.warn('Error', err) });
  }

  cargarDatosDesdeBackend(): void {
    this.perfilService.obtenerDatosUsuario(this.idUsuarioLogueado).subscribe({
      next: (data: any) => {
        if (!data) return;

        this.perfil.nombreCompleto = `${data.nombre || ''} ${data.apellido || ''}`.trim();
        this.perfil.correo = data.correo || '';
        this.perfil.telefono = data.telefono || '';
        this.perfil.genero = data.genero || '';
        this.perfil.fechaNacimiento = data.fechaNacimiento || '';
        this.perfil.direccion = data.ubicacion || '';
        this.fotoUrl = data.urlFotoPerfil || null;
        this.perfil.id_provincia = data.idProvincia || null;
        this.perfil.id_ciudad = data.idCiudad || null;

        if (this.perfil.id_provincia) {
          this.perfilService.getCiudadesPorProvincia(this.perfil.id_provincia).subscribe(res => {
            this.ciudades = res;
            this.cdr.detectChanges();
          });
        }

        const parsearJsonSeguro = (campo: any) => {
          if (!campo) return [];
          if (typeof campo === 'string') {
            try { return JSON.parse(campo); } catch (e) { return []; }
          }
          return campo;
        };

        try {
          const idiomasArray = parsearJsonSeguro(data.idiomas);
          this.perfil.idiomas = idiomasArray.map((i: any) => ({
            id_usuario_idioma: i.id_usuario_idioma, id_idioma: i.id_idioma, nombre_idioma: i.idioma,
            nivel: i.nivel, archivo: null, nombreArchivo: i.archivo_certificado || ''
          }));

          const expArray = parsearJsonSeguro(data.experienciaLaboral);
          this.perfil.experiencias = expArray.map((e: any) => ({
            id_exp_laboral: e.id_exp_laboral, id_cargo: e.id_cargo, id_empresa_catalogo: e.id_empresa_catalogo,
            nombre_cargo: e.cargo, nombre_empresa: e.empresa, descripcion: e.descripcion,
            fecha_inicio: e.fecha_inicio, fecha_fin: e.fecha_fin, id_ciudad: e.id_ciudad,
            nombre_ciudad: e.nombre_ciudad, id_provincia: e.id_provincia, nombre_provincia: e.nombre_provincia,
            nombreArchivo: e.archivo_comprobante || '', cargos: e.cargos || []
          }));

          const titulosArray = parsearJsonSeguro(data.formacionAcademica);
          this.perfil.titulos = titulosArray.map((t: any) => ({
            id_academico: t.id_academico, id_facultad: t.id_facultad, id_carrera: t.id_carrera,
            nombreFacultad: t.facultad, nombreCarrera: t.carrera, fechaGraduacion: t.fecha_graduacion,
            registroSenescyt: t.registro_senescyt, archivoReferencia: null, nombreArchivo: t.archivo_referencia || ''
          }));

          const cursosArray = parsearJsonSeguro(data.cursosRealizados);
          this.perfil.cursos = cursosArray.map((c: any) => ({
            id_curso: c.id_curso, nombre_curso: c.curso, institucion: c.institucion,
            horas_duracion: c.duracion_horas, archivo: null, nombreArchivo: c.archivo_certificado || ''
          }));

        } catch (error) {
          console.error('Error general al mapear las listas del perfil:', error);
        }

        this.actualizarProgreso();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar perfil', err)
    });
  }


  onInputChange(): void {
    this.actualizarProgreso();
  }

  actualizarProgreso(): void {
    let camposCompletados = 0;

    // 1. Quitamos 'cedula' porque no está en la UI
    // 2. Agregamos 'id_provincia' e 'id_ciudad' para que sumen al progreso
    const camposObligatorios = [
      this.perfil.nombreCompleto,
      this.perfil.fechaNacimiento,
      this.perfil.genero,
      this.perfil.correo,
      this.perfil.telefono,
      this.perfil.id_provincia,
      this.perfil.id_ciudad
    ];

    camposObligatorios.forEach(campo => {
      if (campo !== null && campo !== undefined && campo.toString().trim() !== '') {
        camposCompletados++;
      }
    });

    if (this.fotoUrl) camposCompletados++;
    if (this.perfil.titulos?.length > 0) camposCompletados++;
    if (this.perfil.idiomas?.length > 0) camposCompletados++;
    if (this.perfil.experiencias?.length > 0) camposCompletados++;
    if (this.perfil.cursos?.length > 0) camposCompletados++;

    const total = camposObligatorios.length + 5;

    this.completitudPerfil = Math.round((camposCompletados / total) * 100);
  }

  verPdf(urlArchivo: string): void {
    if (urlArchivo && urlArchivo.startsWith('http')) { window.open(urlArchivo, '_blank'); }
    else if (urlArchivo) { this.notif.advertencia('El archivo no tiene un formato de URL válido.'); }
    else { this.notif.advertencia('No hay ningún documento adjunto para mostrar.'); }
  }


  seleccionarImagen(event: any) {
    const archivo = event.target.files[0];
    if (archivo) {
      this.archivoSeleccionado = archivo;
      const reader = new FileReader();
      reader.onload = (e: any) => { this.fotoUrl = e.target.result; this.cdr.detectChanges(); };
      reader.readAsDataURL(archivo);
      this.subirImagen();
    }
  }

  subirImagen() {
    if (this.archivoSeleccionado && this.idUsuarioLogueado) {
      this.perfilService.subirLogoProfesional(this.idUsuarioLogueado, this.archivoSeleccionado).subscribe({
        next: (respuesta: any) => {
          this.perfil.urlImagen = respuesta.urlImagen;
          this.fotoUrl = respuesta.urlImagen;
          this.actualizarProgreso();
          this.cdr.detectChanges();
        },
        error: (err) => this.notif.error('No se pudo guardar la imagen.')
      });
    }
  }


  onProvinciaChange(): void {
    this.perfil.id_ciudad = null;
    if (this.perfil.id_provincia) {
      this.perfilService.getCiudadesPorProvincia(this.perfil.id_provincia).subscribe(res => {
        this.ciudades = res; this.cdr.detectChanges();
      });
    }
    this.actualizarProgreso();
  }

  guardarInformacionPersonal(): void {
    if (!this.perfil.nombreCompleto || !this.perfil.correo) { this.notif.advertencia('El nombre completo y el correo son obligatorios.'); return; }

    const payload = { nombreCompleto: this.perfil.nombreCompleto, fechaNacimiento: this.perfil.fechaNacimiento, genero: this.perfil.genero, telefono: this.perfil.telefono, idCiudad: this.perfil.id_ciudad };

    this.perfilService.actualizarDatosPersonales(this.idUsuarioLogueado, payload).subscribe({
      next: (res) => { this.notif.exito('Datos personales actualizados exitosamente.'); this.actualizarProgreso(); this.cdr.detectChanges(); },
      error: (err) => this.notif.error('Hubo un error al guardar tu información.')
    });
  }


  async eliminarTitulo(index: number, idItem: number): Promise<void> {
    const confirmado = await this.confirmSvc.abrir('¿Estás seguro de eliminar esta formación académica?', 'Eliminar título');
    if (confirmado) {
      this.perfilService.eliminarItemPerfil(this.idUsuarioLogueado, 'academico', idItem).subscribe({
        next: () => { this.perfil.titulos.splice(index, 1); this.actualizarProgreso(); this.cdr.detectChanges(); },
        error: (err) => this.notif.error('Error al eliminar en la base de datos')
      });
    }
  }

  async eliminarIdioma(index: number, idItem: number): Promise<void> {
    const confirmado = await this.confirmSvc.abrir('¿Estás seguro de eliminar este idioma?', 'Eliminar idioma');
    if (confirmado) {
      this.perfilService.eliminarItemPerfil(this.idUsuarioLogueado, 'idioma', idItem).subscribe({
        next: () => { this.perfil.idiomas.splice(index, 1); this.actualizarProgreso(); this.cdr.detectChanges(); },
        error: (err) => this.notif.error('Error al eliminar')
      });
    }
  }

  async eliminarExperiencia(index: number, idItem: number): Promise<void> {
    const confirmado = await this.confirmSvc.abrir('¿Estás seguro de eliminar este registro?', 'Eliminar experiencia');
    if (confirmado) {
      this.perfilService.eliminarItemPerfil(this.idUsuarioLogueado, 'experiencia', idItem).subscribe({
        next: () => { this.perfil.experiencias.splice(index, 1); this.actualizarProgreso(); this.cdr.detectChanges(); },
        error: (err) => this.notif.error('Error al eliminar')
      });
    }
  }

  async eliminarCurso(index: number, idItem: number): Promise<void> {
    const confirmado = await this.confirmSvc.abrir('¿Estás seguro de eliminar este curso?', 'Eliminar curso');
    if (confirmado) {
      this.perfilService.eliminarItemPerfil(this.idUsuarioLogueado, 'curso', idItem).subscribe({
        next: () => { this.perfil.cursos.splice(index, 1); this.actualizarProgreso(); this.cdr.detectChanges(); },
        error: (err) => this.notif.error('Error al eliminar en la base de datos')
      });
    }
  }


  guardarAcademicaDesdeHijo(evento: {formData: FormData, idEdicion: number | null}): void {
    if (evento.idEdicion) {
      evento.formData.append('idAcademico', evento.idEdicion.toString());
      this.perfilService.actualizarAcademico(evento.formData).subscribe({
        next: () => { this.notif.exito('Título actualizado.'); this.cargarDatosDesdeBackend(); },
        error: (err) => this.notif.error('Error al actualizar el título.')
      });
    } else {
      this.perfilService.registrarItemPerfil(this.idUsuarioLogueado, 'academico', evento.formData).subscribe({
        next: () => { this.notif.exito('Título guardado.'); this.cargarDatosDesdeBackend(); },
        error: (err) => this.notif.error('Error al guardar el título.')
      });
    }
  }

  guardarIdiomaDesdeHijo(evento: {formData: FormData, idEdicion: number | null}): void {
    if (evento.idEdicion) {
      evento.formData.append('idUsuarioIdioma', evento.idEdicion.toString());
      this.perfilService.actualizarIdioma(evento.formData).subscribe({
        next: () => { this.notif.exito('Idioma actualizado.'); this.cargarDatosDesdeBackend(); },
        error: (err) => this.notif.error('Error al actualizar el idioma.')
      });
    } else {
      this.perfilService.registrarItemPerfil(this.idUsuarioLogueado, 'idioma', evento.formData).subscribe({
        next: () => { this.notif.exito('Idioma guardado.'); this.cargarDatosDesdeBackend(); },
        error: (err) => this.notif.error('Error al guardar el idioma.')
      });
    }
  }

  guardarExperienciaDesdeHijo(evento: {formData: FormData, idEdicion: number | null}): void {
    if (evento.idEdicion) {
      evento.formData.append('idExpLaboral', evento.idEdicion.toString());
      this.perfilService.actualizarExperiencia(evento.formData).subscribe({
        next: () => { this.notif.exito('Experiencia actualizada.'); this.cargarDatosDesdeBackend(); },
        error: (err) => this.notif.error('Error al actualizar la experiencia.')
      });
    } else {
      this.perfilService.registrarItemPerfil(this.idUsuarioLogueado, 'experiencia', evento.formData).subscribe({
        next: () => { this.notif.exito('Experiencia guardada.'); this.cargarDatosDesdeBackend(); },
        error: (err) => this.notif.error('Error al guardar la experiencia.')
      });
    }
  }

  guardarCursoDesdeHijo(evento: {formData: FormData, idEdicion: number | null}): void {
    if (evento.idEdicion) {
      evento.formData.append('idCurso', evento.idEdicion.toString());
      this.perfilService.actualizarCurso(evento.formData).subscribe({
        next: () => { this.notif.exito('Curso actualizado.'); this.cargarDatosDesdeBackend();this.cdr.detectChanges();},
        error: (err) => this.notif.error('Error al actualizar el curso.')
      });
    } else {
      this.perfilService.registrarItemPerfil(this.idUsuarioLogueado, 'curso', evento.formData).subscribe({
        next: () => { this.notif.exito('Curso guardado.'); this.cargarDatosDesdeBackend(); },
        error: (err) => this.notif.error('Error al guardar el curso.')
      });
    }
  }


  cargarCarrerasPorFacultad(idFacultad: number): void {
    this.perfilService.getCarrerasPorFacultad(idFacultad).subscribe(res => {
      this.carrerasNuevoTitulo = res; this.cdr.detectChanges();
    });
  }

  cargarCiudadesExpPadre(idProvincia: number) {
    this.perfilService.getCiudadesPorProvincia(idProvincia).subscribe(res => {
      this.ciudadesExp = res; this.cdr.detectChanges();
    });
  }

  buscarCargoDinamicoPadre(termino: string) {
    if (termino.trim().length >= 2) {
      this.perfilService.buscarCargosPredictivo(termino.trim()).subscribe(res => {
        this.cargosDisponibles = res; this.cdr.detectChanges();
      });
    } else {
      this.cargosDisponibles = []; this.cdr.detectChanges();
    }
  }

  buscarEmpresaDinamicaPadre(termino: string) {
    if (termino.trim().length >= 3) {
      this.perfilService.buscarEmpresasPredictivo(termino.trim()).subscribe(res => {
        this.empresasDisponibles = res; this.cdr.detectChanges();
      });
    } else {
      this.empresasDisponibles = []; this.cdr.detectChanges();
    }
  }

  crearCargoDesdeHijo(evento: {nombre: string, callback: (res: any) => void}) {
    this.perfilService.crearNuevoCargo({nombreCargo: evento.nombre}).subscribe({
      next: (res) => { this.notif.exito('Cargo creado.'); evento.callback(res); },
      error: err => this.notif.error('Error al crear el cargo')
    });
  }

  crearEmpresaDesdeHijo(evento: {empresa: any, callback: (res: any) => void}) {
    this.perfilService.crearNuevaEmpresa(evento.empresa).subscribe({
      next: (res) => { this.notif.exito('Empresa creada.'); evento.callback(res); },
      error: err => this.notif.error('Error al crear la empresa')
    });
  }
}
