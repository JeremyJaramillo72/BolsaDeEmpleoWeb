import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { PerfilService } from './perfil.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil-profesional',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-profesional.html',
  styleUrls: ['./perfil-profesional.css']
})
export class PerfilProfesionalComponent implements OnInit {


  perfil: any = {
    nombre: '',
    apellido: '',
    nombreCompleto: '',
    cedula: '',
    fechaNacimiento: '',
    genero: '',
    correo: '',
    telefono: '',
    direccion: '',
    id_provincia: null,
    id_ciudad: null,
    titulos: [],
    idiomas: [],
    experiencias: []
  };

  completitudPerfil: number = 0;
  rol: string = 'Postulante';
  fotoUrl: string | ArrayBuffer | null = null;
  idUsuarioLogueado: number = 0;


  facultades: any[] = [];
  carrerasPorTitulo: any[][] = [];
  idiomasDisponibles: any[] = [];
  niveles: string[] = ['Básico', 'Intermedio (B1/B2)', 'Avanzado (C1)', 'Nativo'];
  cargosDisponibles: any[] = [];
  empresasDisponibles: any[] = [];
  provincias: any[] = [];
  ciudades: any[] = [];


  modalAcademica: boolean = false;
  modalIdioma: boolean = false;
  modalExperiencia: boolean = false;


  nuevoTitulo: any = { id_facultad: null, id_carrera: null, fechaGraduacion: '', registroSenescyt: '', archivoReferencia: null, nombreArchivo: '' };
  carrerasNuevoTitulo: any[] = [];

  modalCurso: boolean = false;
  nuevoCurso: any = { nombre_curso: '', institucion: '', horas_duracion: null, archivo: null, nombreArchivo: '' };

  nuevoIdioma: any = { id_idioma: null, nivel: null, archivo: null, nombreArchivo: '' };

  cargoActual: number | null = null;
  cargosTemporales: any[] = [];
  nuevaExperiencia: any = {
    id_empresa_catalogo: null,
    ubicacion: '',
    fecha_inicio: '',
    fecha_fin: '',
    descripcion: '',
    archivo_comprobante: null,
    nombreArchivo: ''
  };

  constructor(
    private perfilService: PerfilService,
    private router: Router,
    private cdr: ChangeDetectorRef
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
    this.perfilService.getFacultades().subscribe(res => this.facultades = res);
    this.perfilService.getIdiomasCatalogo().subscribe(res => this.idiomasDisponibles = res);
    this.perfilService.getCargosCatalogo().subscribe(res => this.cargosDisponibles = res);
    this.perfilService.getEmpresasCatalogo().subscribe(res => this.empresasDisponibles = res);
    this.perfilService.getProvincias().subscribe(res => this.provincias = res);
  }

  cargarDatosDesdeBackend(): void {
    this.perfilService.obtenerDatosUsuario(this.idUsuarioLogueado).subscribe({
      next: (data: any) => {


        this.perfil.nombreCompleto = `${data.nombre || ''} ${data.apellido || ''}`.trim();
        this.perfil.correo = data.correo || '';
        this.perfil.telefono = data.telefono || '';
        this.perfil.genero = data.genero || '';
        this.perfil.fechaNacimiento = data.fechaNacimiento || '';
        this.perfil.direccion = data.ubicacion || '';
        this.fotoUrl = data.urlFotoPerfil || null;


        try {
          const idiomasArray = data.idiomas ? JSON.parse(data.idiomas) : [];
          this.perfil.idiomas = idiomasArray.map((i: any) => ({
            id_idioma: i.id_idioma,
            nombre_idioma: i.idioma,
            nivel: i.nivel,
            archivo: null,
            nombreArchivo: i.archivo_certificado || ''
          }));

          const expArray = data.experienciaLaboral ? JSON.parse(data.experienciaLaboral) : [];
          this.perfil.experiencias = expArray.map((e: any) => ({
            id_cargo: e.id_cargo,
            id_empresa_catalogo: e.id_empresa_catalogo,
            nombre_cargo: e.cargo,
            nombre_empresa: e.empresa,
            descripcion: e.descripcion,
            fecha_inicio: e.fecha_inicio,
            fecha_fin: e.fecha_fin,
            ubicacion: e.ubicacion,
            nombreArchivo: e.archivo_comprobante || ''
          }));

          const titulosArray = data.formacionAcademica ? JSON.parse(data.formacionAcademica) : [];
          this.perfil.titulos = titulosArray.map((t: any) => ({
            id_academico: t.id_academico,
            id_facultad: t.id_facultad,
            id_carrera: t.id_carrera,
            nombreFacultad: t.facultad,
            nombreCarrera: t.carrera,
            fechaGraduacion: t.fecha_graduacion,
            registroSenescyt: t.registro_senescyt,
            archivoReferencia: null,
            nombreArchivo: t.archivo_referencia || ''
          }));


          const cursosArray = data.cursosRealizados ? JSON.parse(data.cursosRealizados) : [];
          this.perfil.cursos = cursosArray.map((c: any) => ({
            id_curso: c.id_curso,
            nombre_curso: c.curso,
            institucion: c.institucion,
            horas_duracion: c.duracion_horas,
            archivo: null,
            nombreArchivo: c.archivo_certificado || ''
          }));

        } catch (error) {
          console.error('Error al parsear el JSON del perfil:', error);
        }

        this.actualizarProgreso();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar el perfil completo desde el backend', err);
      }
    });
  }



  abrirModalAcademica() { this.modalAcademica = true; }
  abrirModalIdioma() { this.modalIdioma = true; }
  abrirModalExperiencia() { this.modalExperiencia = true; }
  abrirModalCurso() { this.modalCurso = true; }


  cerrarModales() {
    this.modalAcademica = false;
    this.modalIdioma = false;
    this.modalExperiencia = false;
    this.modalCurso = false;
  }

  onInputChange(): void {
    this.actualizarProgreso();
  }



  verPdf(urlArchivo: string): void {
    if (urlArchivo && urlArchivo.startsWith('http')) {
      window.open(urlArchivo, '_blank');
    } else if (urlArchivo) {
      alert(`El archivo no tiene un formato de URL válido: ${urlArchivo}`);
    } else {
      alert('No hay ningún documento adjunto para mostrar.');
    }
  }

  triggerFileInput(): void {
    document.getElementById('fotoInput')?.click();
  }

  archivoSeleccionado: File | null = null;


  seleccionarImagen(event: any) {
    const archivo = event.target.files[0];
    if (archivo) {
      this.archivoSeleccionado = archivo;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fotoUrl = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(archivo);
      this.subirImagen();
    }
  }

  subirImagen() {
    // Usamos idUsuarioLogueado que ya tenemos validado en el ngOnInit
    if (this.archivoSeleccionado && this.idUsuarioLogueado) {
      this.perfilService.subirLogoProfesional(this.idUsuarioLogueado, this.archivoSeleccionado)
        .subscribe({
          next: (respuesta: any) => {
            console.log('¡foto subida con éxito!', respuesta);
            this.perfil.urlImagen = respuesta.urlImagen;
            this.fotoUrl = respuesta.urlImagen;

            this.actualizarProgreso();
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('error al subir la foto', err);
            alert('No se pudo guardar la imagen en el servidor.');
          }
        });
    }
  }

  onProvinciaChange(): void {
    this.perfil.id_ciudad = null;
    if (this.perfil.id_provincia) {
      this.perfilService.getCiudadesPorProvincia(this.perfil.id_provincia).subscribe(res => {
        this.ciudades = res;
      });
    }
    this.actualizarProgreso();
  }
  onFileSelected(event: any, tipo: string): void {
    const file = event.target.files[0];
    if (!file) return;

    if (tipo === 'academico') {
      this.nuevoTitulo.archivoReferencia = file;
      this.nuevoTitulo.nombreArchivo = file.name;
    } else if (tipo === 'idioma') {
      this.nuevoIdioma.archivo = file;
      this.nuevoIdioma.nombreArchivo = file.name;
    } else if (tipo === 'experiencia') {
      this.nuevaExperiencia.archivo_comprobante = file;
      this.nuevaExperiencia.nombreArchivo = file.name;
    }
    else if (tipo === 'curso') {
         this.nuevoCurso.archivo = file;
         this.nuevoCurso.nombreArchivo = file.name;
      }
  }



  onFacultadNuevaChange(): void {
    this.nuevoTitulo.id_carrera = null;
    if (this.nuevoTitulo.id_facultad) {
      this.perfilService.getCarrerasPorFacultad(this.nuevoTitulo.id_facultad).subscribe(res => {
        this.carrerasNuevoTitulo = res;
      });
    }
  }

  agregarCargoTemporal(): void {
    if (this.cargoActual) {
      const cargo = this.cargosDisponibles.find(c => c.idCargo == this.cargoActual);
      this.cargosTemporales.push({ id_cargo: cargo.idCargo, nombre_cargo: cargo.nombreCargo });
      this.cargoActual = null;
    }
  }

  eliminarCargoTemporal(index: number): void {
    this.cargosTemporales.splice(index, 1);
  }

  eliminarCurso(index: number, idItem: number): void {
    if (confirm('¿Estás seguro de eliminar este curso?')) {
      this.perfilService.eliminarItemPerfil(this.idUsuarioLogueado, 'curso', idItem).subscribe({
        next: () => {
          this.perfil.cursos.splice(index, 1);
          this.actualizarProgreso();
          this.cdr.detectChanges();
        },
        error: (err) => { console.error(err); alert('Error al eliminar en la base de datos'); }
      });
    }
  }

  eliminarTitulo(index: number, idItem: number): void {
    if (confirm('¿Estás seguro de eliminar esta formación académica?')) {
      this.perfilService.eliminarItemPerfil(this.idUsuarioLogueado, 'academico', idItem).subscribe({
        next: () => {
          this.perfil.titulos.splice(index, 1);
          this.actualizarProgreso();
          this.cdr.detectChanges();
        },
        error: (err) => { console.error(err); alert('Error al eliminar en la base de datos'); }
      });
    }
  }

  eliminarExperiencia(index: number, idItem: number): void {
    if (confirm('¿Estás seguro de eliminar este registro de experiencia laboral?')) {
      this.perfilService.eliminarItemPerfil(this.idUsuarioLogueado, 'experiencia', idItem).subscribe({
        next: () => {
          this.perfil.experiencias.splice(index, 1);
          this.actualizarProgreso();
          this.cdr.detectChanges();
        },
        error: (err) => { console.error(err); alert('Error al eliminar en la base de datos'); }
      });
    }
  }

  eliminarIdioma(index: number, idItem: number): void {
    if (confirm('¿Estás seguro de eliminar este idioma?')) {
      this.perfilService.eliminarItemPerfil(this.idUsuarioLogueado, 'idioma', idItem).subscribe({
        next: () => {
          this.perfil.idiomas.splice(index, 1);
          this.actualizarProgreso();
          this.cdr.detectChanges();
        },
        error: (err) => { console.error(err); alert('Error al eliminar en la base de datos'); }
      });
    }
  }



  actualizarProgreso(): void {
    let camposCompletados = 0;
    const camposObligatorios = [
      this.perfil.cedula, this.perfil.nombreCompleto,
      this.perfil.fechaNacimiento, this.perfil.genero,
      this.perfil.correo, this.perfil.telefono
    ];

    camposObligatorios.forEach(campo => {
      if (campo && campo.toString().trim() !== '') camposCompletados++;
    });

    if (this.fotoUrl) camposCompletados++;
    if (this.perfil.titulos?.length > 0) camposCompletados++;
    if (this.perfil.idiomas?.length > 0) camposCompletados++;
    if (this.perfil.experiencias?.length > 0) camposCompletados++;

    const total = camposObligatorios.length + 4;
    this.completitudPerfil = Math.round((camposCompletados / total) * 100);
  }

  guardarPerfilCompleto(): void {
    alert('Datos personales actualizados exitosamente.');
    this.actualizarProgreso();
  }

  agregarTituloBd(): void {
    if (!this.nuevoTitulo.id_carrera || !this.nuevoTitulo.fechaGraduacion) {
      alert('⚠️ Llena la carrera y fecha de graduación para guardar este título.');
      return;
    }

    const formData = new FormData();
    formData.append('idCarrera', this.nuevoTitulo.id_carrera);
    formData.append('fechaGraduacion', this.nuevoTitulo.fechaGraduacion);
    formData.append('numeroSenescyt', this.nuevoTitulo.registroSenescyt);
    if (this.nuevoTitulo.archivoReferencia) formData.append('archivo', this.nuevoTitulo.archivoReferencia);

    this.perfilService.registrarItemPerfil(this.idUsuarioLogueado, 'academico', formData).subscribe({
      next: () => {
        alert('Título académico guardado exitosamente.');
        this.cargarDatosDesdeBackend();
        this.cerrarModales();
        this.nuevoTitulo = { id_facultad: null, id_carrera: null, fechaGraduacion: '', registroSenescyt: '', archivoReferencia: null, nombreArchivo: '' };
      },
      error: (err) => { console.error(err); alert(' Error al guardar el título.'); }
    });
  }

  agregarIdiomaBd(): void {
    if (!this.nuevoIdioma.id_idioma || !this.nuevoIdioma.nivel) {
      alert(' Selecciona un idioma y nivel primero.');
      return;
    }

    const formData = new FormData();
    formData.append('idIdioma', this.nuevoIdioma.id_idioma.toString());
    formData.append('nivel', this.nuevoIdioma.nivel);
    if (this.nuevoIdioma.archivo) formData.append('archivo', this.nuevoIdioma.archivo);

    this.perfilService.registrarItemPerfil(this.idUsuarioLogueado, 'idioma', formData).subscribe({
      next: () => {
        alert('Idioma guardado exitosamente.');
        this.cargarDatosDesdeBackend();
        this.cerrarModales();
        this.nuevoIdioma = { id_idioma: null, nivel: null, archivo: null, nombreArchivo: '' };
      },
      error: (err) => { console.error(err); alert('Error al guardar el idioma.'); }
    });
  }

  agregarExperienciaBd(): void {
    if (this.cargosTemporales.length === 0 || !this.nuevaExperiencia.id_empresa_catalogo) {
      alert(' Agrega un cargo y una empresa primero.');
      return;
    }

    const formData = new FormData();
    formData.append('idCargo', this.cargosTemporales[0].id_cargo.toString());
    formData.append('idEmpresaCatalogo', this.nuevaExperiencia.id_empresa_catalogo.toString());
    formData.append('fechaInicio', this.nuevaExperiencia.fecha_inicio);
    if (this.nuevaExperiencia.fecha_fin) formData.append('fechaFin', this.nuevaExperiencia.fecha_fin);
    formData.append('descripcion', this.nuevaExperiencia.descripcion);
    formData.append('ubicacion', this.nuevaExperiencia.ubicacion || '');
    if (this.nuevaExperiencia.archivo_comprobante) formData.append('archivo', this.nuevaExperiencia.archivo_comprobante);

    this.perfilService.registrarItemPerfil(this.idUsuarioLogueado, 'experiencia', formData).subscribe({
      next: () => {
        alert('Experiencia guardada exitosamente.');
        this.cargarDatosDesdeBackend();
        this.cerrarModales();
        this.cargosTemporales = [];
        this.nuevaExperiencia = { id_empresa_catalogo: null, ubicacion: '', fecha_inicio: '', fecha_fin: '', descripcion: '', archivo_comprobante: null, nombreArchivo: '' };
      },
      error: (err) => { console.error(err); alert('Error al guardar la experiencia.'); }
    });
  }

  agregarCursoBd(): void {
    if (!this.nuevoCurso.nombre_curso || !this.nuevoCurso.institucion) {
      alert('⚠️ El nombre del curso y la institución son obligatorios.');
      return;
    }

    const formData = new FormData();
    formData.append('nombreCurso', this.nuevoCurso.nombre_curso);
    formData.append('institucion', this.nuevoCurso.institucion);
    if (this.nuevoCurso.horas_duracion) formData.append('horasDuracion', this.nuevoCurso.horas_duracion.toString());
    if (this.nuevoCurso.archivo) formData.append('archivo', this.nuevoCurso.archivo);

    this.perfilService.registrarItemPerfil(this.idUsuarioLogueado, 'curso', formData).subscribe({
      next: () => {
        alert('Curso guardado exitosamente.');
        this.cargarDatosDesdeBackend();
        this.cerrarModales();
        this.nuevoCurso = { nombre_curso: '', institucion: '', horas_duracion: null, archivo: null, nombreArchivo: '' };
      },
      error: (err) => { console.error(err); alert(' Error al guardar el curso.'); }
    });
  }
}
