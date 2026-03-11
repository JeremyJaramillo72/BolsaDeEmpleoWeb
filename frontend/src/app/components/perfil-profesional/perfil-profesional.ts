  import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
  import { Router } from '@angular/router';
  import { PerfilService } from './perfil.service';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { UiNotificationService } from '../../services/ui-notification.service';
  import { ConfirmService } from '../../services/confirm.service';

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
    mostrarNuevoCargo: boolean = false;
    nuevoNombreCargo: string = '';
    busquedaCargoTexto: string = '';
    busquedaEmpresaTexto: string = '';

    mostrarNuevaEmpresa: boolean = false;

    nuevaEmpresaObj: any = {nombre_empresa: '', ruc: '', id_categoria: null};

    facultades: any[] = [];
    carrerasPorTitulo: any[][] = [];
    idiomasDisponibles: any[] = [];
    niveles: string[] = ['Básico', 'Intermedio (B1/B2)', 'Avanzado (C1)', 'Nativo'];
    cargosDisponibles: any[] = [];
    empresasDisponibles: any[] = [];
    provincias: any[] = [];
    ciudades: any[] = [];
    ciudadesExp: any[] = [];
    categorias: any[] = [];


    modalAcademica: boolean = false;
    modalIdioma: boolean = false;
    modalExperiencia: boolean = false;


    idEdicionAcademica: number | null = null;
    idEdicionIdioma: number | null = null;
    idEdicionExperiencia: number | null = null;
    idEdicionCurso: number | null = null;


    nuevoTitulo: any = {
      id_facultad: null,
      id_carrera: null,
      fechaGraduacion: '',
      registroSenescyt: '',
      archivoReferencia: null,
      nombreArchivo: ''
    };
    carrerasNuevoTitulo: any[] = [];

    modalCurso: boolean = false;
    nuevoCurso: any = {nombre_curso: '', institucion: '', horas_duracion: null, archivo: null, nombreArchivo: ''};
    nuevoIdioma: any = {id_idioma: null, nivel: null, archivo: null, nombreArchivo: ''};


    cargoActual: number | null = null;
    cargosTemporales: any[] = [];
    nuevaExperiencia: any = {
      id_empresa_catalogo: null,
      id_provincia: null,
      id_ciudad: null,
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
      private cdr: ChangeDetectorRef,
      private notif: UiNotificationService,
      private confirmSvc: ConfirmService
    ) {
    }

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
      this.perfilService.getFacultades().subscribe({
        next: res => this.facultades = res,
        error: err => console.warn('No se pudieron cargar las facultades')
      });

      this.perfilService.getIdiomasCatalogo().subscribe({
        next: res => this.idiomasDisponibles = res,
        error: err => console.error('Error crítico al cargar idiomas', err)
      });


      this.perfilService.obtenerCategorias().subscribe({
        next: res => this.categorias = res,
        error: err => console.warn('No se pudieron cargar las categorías')
      });
      this.perfilService.obtenerProvincias().subscribe({
        next: res => {
          this.provincias = res;
        },
        error: err => console.warn('No se pudieron cargar las provincias')
      });
    }

    cargarDatosDesdeBackend(): void {
      console.log("Cargando perfil para el usuario ID:", this.idUsuarioLogueado);

      this.perfilService.obtenerDatosUsuario(this.idUsuarioLogueado).subscribe({
        next: (data: any) => {
          if (!data) {
            console.warn("El backend no devolvió datos para este usuario.");
            return;
          }

          console.log("Datos recibidos del backend:", data);


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
              try {
                return JSON.parse(campo);
              } catch (e) {
                console.error("No se pudo parsear este JSON:", campo);
                return [];
              }
            }
            return campo;
          };


          try {
            const idiomasArray = parsearJsonSeguro(data.idiomas);
            this.perfil.idiomas = idiomasArray.map((i: any) => ({
              id_usuario_idioma: i.id_usuario_idioma,
              id_idioma: i.id_idioma,
              nombre_idioma: i.idioma,
              nivel: i.nivel,
              archivo: null,
              nombreArchivo: i.archivo_certificado || ''
            }));

            const expArray = parsearJsonSeguro(data.experienciaLaboral);
            this.perfil.experiencias = expArray.map((e: any) => ({
              id_exp_laboral: e.id_exp_laboral,
              id_cargo: e.id_cargo,
              id_empresa_catalogo: e.id_empresa_catalogo,
              nombre_cargo: e.cargo,
              nombre_empresa: e.empresa,
              descripcion: e.descripcion,
              fecha_inicio: e.fecha_inicio,
              fecha_fin: e.fecha_fin,

              id_ciudad: e.id_ciudad,
              nombre_ciudad: e.nombre_ciudad,
              id_provincia: e.id_provincia,
              nombre_provincia: e.nombre_provincia,
              nombreArchivo: e.archivo_comprobante || '',
              cargos: e.cargos || []
            }));

            const titulosArray = parsearJsonSeguro(data.formacionAcademica);
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

            const cursosArray = parsearJsonSeguro(data.cursosRealizados);
            this.perfil.cursos = cursosArray.map((c: any) => ({
              id_curso: c.id_curso,
              nombre_curso: c.curso,
              institucion: c.institucion,
              horas_duracion: c.duracion_horas,
              archivo: null,
              nombreArchivo: c.archivo_certificado || ''
            }));

          } catch (error) {
            console.error('Error general al mapear las listas del perfil:', error);
          }

          this.actualizarProgreso();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar el perfil completo desde el backend', err);
        }
      });
    }

    onProvinciaExpChange() {
      this.nuevaExperiencia.id_ciudad = null;
      this.ciudadesExp = [];

      if (this.nuevaExperiencia.id_provincia > 0) {
        this.perfilService.getCiudadesPorProvincia(this.nuevaExperiencia.id_provincia).subscribe(res => {
          this.ciudadesExp = res;
          this.cdr.detectChanges();
        });
      }
    }

    guardarNuevoCargoCatalogo(): void {
      if (!this.nuevoNombreCargo) return;
      const payload = {nombreCargo: this.nuevoNombreCargo};

      this.perfilService.crearNuevoCargo(payload).subscribe({
        next: (res: any) => {
          this.cargosDisponibles.push(res);
          this.cargoActual = res.idCargo;
          this.agregarCargoTemporal();
          this.mostrarNuevoCargo = false;
          this.nuevoNombreCargo = '';
        },
        error: err => {
          console.error('Error detallado:', err);
          this.notif.error(err.error?.error || 'Error al crear el cargo en el servidor');
        }
      });
    }

    guardarNuevaEmpresaCatalogo(): void {

      if (!this.nuevaEmpresaObj.nombre_empresa || this.nuevaEmpresaObj.nombre_empresa.trim() === '') {
        this.notif.advertencia('Por favor, escribe el nombre de la nueva empresa.');
        return;
      }


      console.log("Enviando nueva empresa:", this.nuevaEmpresaObj);

      this.perfilService.crearNuevaEmpresa(this.nuevaEmpresaObj).subscribe({
        next: (res: any) => {
          this.notif.exito('Empresa creada y seleccionada exitosamente.');

          this.empresasDisponibles.push(res);
          this.nuevaExperiencia.id_empresa_catalogo = res.idEmpresaCatalogo;

          this.mostrarNuevaEmpresa = false;
          this.nuevaEmpresaObj = {nombre_empresa: '', ruc: '', id_categoria: null};
          this.cdr.detectChanges();
        },
        error: err => {
          console.error('Error detallado al crear empresa:', err);
          this.notif.error(err.error?.error || 'Error al crear la empresa en el servidor');
        }
      });
    }


    abrirModalAcademica() {
      this.modalAcademica = true;
    }

    abrirModalIdioma() {
      this.modalIdioma = true;
    }

    abrirModalExperiencia() {
      this.modalExperiencia = true;
    }

    abrirModalCurso() {
      this.modalCurso = true;
    }


    cerrarModales() {
      this.modalAcademica = false;
      this.modalIdioma = false;
      this.modalExperiencia = false;
      this.modalCurso = false;

      this.idEdicionAcademica = null;
      this.idEdicionIdioma = null;
      this.idEdicionExperiencia = null;
      this.idEdicionCurso = null;

      this.nuevoTitulo = {
        id_facultad: null,
        id_carrera: null,
        fechaGraduacion: '',
        registroSenescyt: '',
        archivoReferencia: null,
        nombreArchivo: ''
      };
      this.nuevoIdioma = {id_idioma: null, nivel: null, archivo: null, nombreArchivo: ''};
      this.nuevaExperiencia = {
        id_empresa_catalogo: null,
        id_provincia: null,
        id_ciudad: null,
        fecha_inicio: '',
        fecha_fin: '',
        descripcion: '',
        archivo_comprobante: null,
        nombreArchivo: ''
      };
      this.nuevoCurso = {nombre_curso: '', institucion: '', horas_duracion: null, archivo: null, nombreArchivo: ''};
      this.cargosTemporales = [];
    }

    onInputChange(): void {
      this.actualizarProgreso();
    }


    verPdf(urlArchivo: string): void {
      if (urlArchivo && urlArchivo.startsWith('http')) {
        window.open(urlArchivo, '_blank');
      } else if (urlArchivo) {
        this.notif.advertencia('El archivo no tiene un formato de URL válido.');
      } else {
        this.notif.advertencia('No hay ningún documento adjunto para mostrar.');
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
              this.notif.error('No se pudo guardar la imagen en el servidor.');
            }
          });
      }
    }

    onProvinciaChange(): void {
      this.perfil.id_ciudad = null;
      if (this.perfil.id_provincia) {
        this.perfilService.getCiudadesPorProvincia(this.perfil.id_provincia).subscribe(res => {
          this.ciudades = res;
          this.cdr.detectChanges();
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
      } else if (tipo === 'curso') {
        this.nuevoCurso.archivo = file;
        this.nuevoCurso.nombreArchivo = file.name;
      }
    }


    onFacultadNuevaChange(): void {
      this.nuevoTitulo.id_carrera = null;
      if (this.nuevoTitulo.id_facultad) {
        this.perfilService.getCarrerasPorFacultad(this.nuevoTitulo.id_facultad).subscribe(res => {
          this.carrerasNuevoTitulo = res;
          this.cdr.detectChanges();
        });
      }
    }

    agregarCargoTemporal(): void {
      if (this.cargoActual) {
        const cargo = this.cargosDisponibles.find(c => c.idCargo == this.cargoActual);
        this.cargosTemporales.push({id_cargo: cargo.idCargo, nombre_cargo: cargo.nombreCargo});
        this.cargoActual = null;
      }
    }
    buscarCargoDinamico(event: any): void {

      const termino = event.target?.value || '';

      if (termino.trim().length >= 2) {
        this.perfilService.buscarCargosPredictivo(termino.trim()).subscribe({
          next: (res) => {
            this.cargosDisponibles = res;
            this.cdr.detectChanges();
          },
          error: (err) => console.warn('Error al buscar cargos predictivos', err)
        });
      } else {
        this.cargosDisponibles = [];
        this.cdr.detectChanges();
      }
    }

    buscarEmpresaDinamica(event: any): void {
      const termino = event.target?.value || '';

      if (termino.trim().length >= 3) {
        this.perfilService.buscarEmpresasPredictivo(termino.trim()).subscribe({
          next: (res) => {
            this.empresasDisponibles = res;
            this.cdr.detectChanges();
          },
          error: (err) => console.warn('Error al buscar empresas predictivas', err)
        });
      } else {
        this.empresasDisponibles = [];
        this.cdr.detectChanges();
      }
    }

    seleccionarCargoPred(cargo: any): void {
      this.cargoActual = cargo.idCargo;
      this.busquedaCargoTexto = cargo.nombreCargo;
      this.cargosDisponibles = [];
    }

    seleccionarEmpresaPred(empresa: any): void {
      this.nuevaExperiencia.id_empresa_catalogo = empresa.idEmpresaCatalogo;
      this.busquedaEmpresaTexto = empresa.nombreEmpresa;
      this.empresasDisponibles = [];
    }
    eliminarCargoTemporal(index: number): void {
      this.cargosTemporales.splice(index, 1);
    }

    async eliminarCurso(index: number, idItem: number): Promise<void> {
      const confirmado = await this.confirmSvc.abrir('¿Estás seguro de eliminar este curso?', 'Eliminar curso');
      if (confirmado) {
        this.perfilService.eliminarItemPerfil(this.idUsuarioLogueado, 'curso', idItem).subscribe({
          next: () => {
            this.perfil.cursos.splice(index, 1);
            this.actualizarProgreso();
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error(err);
            this.notif.error('Error al eliminar en la base de datos');
          }
        });
      }
    }

    async eliminarTitulo(index: number, idItem: number): Promise<void> {
      const confirmado = await this.confirmSvc.abrir('¿Estás seguro de eliminar esta formación académica?', 'Eliminar título');
      if (confirmado) {
        this.perfilService.eliminarItemPerfil(this.idUsuarioLogueado, 'academico', idItem).subscribe({
          next: () => {
            this.perfil.titulos.splice(index, 1);
            this.actualizarProgreso();
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error(err);
            this.notif.error('Error al eliminar en la base de datos');
          }
        });
      }
    }

    async eliminarExperiencia(index: number, idItem: number): Promise<void> {
      const confirmado = await this.confirmSvc.abrir('¿Estás seguro de eliminar este registro de experiencia laboral?', 'Eliminar experiencia');
      if (confirmado) {
        this.perfilService.eliminarItemPerfil(this.idUsuarioLogueado, 'experiencia', idItem).subscribe({
          next: () => {
            this.perfil.experiencias.splice(index, 1);
            this.actualizarProgreso();
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error(err);
            this.notif.error('Error al eliminar en la base de datos');
          }
        });
      }
    }

    async eliminarIdioma(index: number, idItem: number): Promise<void> {
      const confirmado = await this.confirmSvc.abrir('¿Estás seguro de eliminar este idioma?', 'Eliminar idioma');
      if (confirmado) {
        this.perfilService.eliminarItemPerfil(this.idUsuarioLogueado, 'idioma', idItem).subscribe({
          next: () => {
            this.perfil.idiomas.splice(index, 1);
            this.actualizarProgreso();
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error(err);
            this.notif.error('Error al eliminar en la base de datos');
          }
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

    guardarInformacionPersonal(): void {

      if (!this.perfil.nombreCompleto || !this.perfil.correo) {
        this.notif.advertencia('El nombre completo y el correo son obligatorios.');
        return;
      }


      const payload = {
        nombreCompleto: this.perfil.nombreCompleto,
        fechaNacimiento: this.perfil.fechaNacimiento,
        genero: this.perfil.genero,
        telefono: this.perfil.telefono,
        idCiudad: this.perfil.id_ciudad
      };


      this.perfilService.actualizarDatosPersonales(this.idUsuarioLogueado, payload).subscribe({
        next: (res) => {
          this.notif.exito('Datos personales actualizados exitosamente.');
          this.actualizarProgreso();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al actualizar datos personales:', err);
          this.notif.error('Hubo un error al guardar tu información.');
        }
      });
    }

    agregarTituloBd(): void {
      if (!this.nuevoTitulo.id_carrera || !this.nuevoTitulo.fechaGraduacion) {
        this.notif.advertencia('Llena la carrera y fecha de graduación para guardar este título.');
        return;
      }

      const formData = new FormData();
      formData.append('idCarrera', this.nuevoTitulo.id_carrera.toString());
      formData.append('fechaGraduacion', this.nuevoTitulo.fechaGraduacion);
      formData.append('numeroSenescyt', this.nuevoTitulo.registroSenescyt);
      if (this.nuevoTitulo.archivoReferencia) formData.append('archivo', this.nuevoTitulo.archivoReferencia);


      if (this.idEdicionAcademica) {
        formData.append('idAcademico', this.idEdicionAcademica.toString());
        this.perfilService.actualizarAcademico(formData).subscribe({
          next: () => {
            this.notif.exito('Título académico actualizado exitosamente.');
            this.cargarDatosDesdeBackend();
            this.cerrarModales();
          },
          error: (err) => {
            console.error(err);
            this.notif.error('Error al actualizar el título.');
          }
        });
      } else {
        this.perfilService.registrarItemPerfil(this.idUsuarioLogueado, 'academico', formData).subscribe({
          next: () => {
            this.notif.exito('Título académico guardado exitosamente.');
            this.cargarDatosDesdeBackend();
            this.cerrarModales();
          },
          error: (err) => {
            console.error(err);
            this.notif.error('Error al guardar el título.');
          }
        });
      }
    }

    agregarIdiomaBd(): void {
      if (!this.nuevoIdioma.id_idioma || !this.nuevoIdioma.nivel) {
        this.notif.advertencia('Selecciona un idioma y nivel primero.');
        return;
      }

      const formData = new FormData();
      formData.append('idIdioma', this.nuevoIdioma.id_idioma.toString());
      formData.append('nivel', this.nuevoIdioma.nivel);
      if (this.nuevoIdioma.archivo) formData.append('archivo', this.nuevoIdioma.archivo);

      if (this.idEdicionIdioma) {
        formData.append('idUsuarioIdioma', this.idEdicionIdioma.toString());
        this.perfilService.actualizarIdioma(formData).subscribe({
          next: () => {
            this.notif.exito('Idioma actualizado exitosamente.');
            this.cargarDatosDesdeBackend();
            this.cerrarModales();
          },
          error: (err) => {
            console.error(err);
            this.notif.error('Error al actualizar el idioma.');
          }
        });
      } else {
        this.perfilService.registrarItemPerfil(this.idUsuarioLogueado, 'idioma', formData).subscribe({
          next: () => {
            this.notif.exito('Idioma guardado exitosamente.');
            this.cargarDatosDesdeBackend();
            this.cerrarModales();
          },
          error: (err) => {
            console.error(err);
            this.notif.error('Error al guardar el idioma.');
          }
        });
      }
    }

    agregarExperienciaBd(): void {

      if (this.cargosTemporales.length === 0 || !this.nuevaExperiencia.id_empresa_catalogo || !this.nuevaExperiencia.id_ciudad) {
        this.notif.advertencia('Agrega al menos un cargo, una empresa y una ciudad primero.');
        return;
      }

      const formData = new FormData();

      const idsUnidos = this.cargosTemporales.map(cargo => cargo.id_cargo).join(',');
      formData.append('cargosIds', idsUnidos);

      formData.append('idEmpresaCatalogo', this.nuevaExperiencia.id_empresa_catalogo.toString());
      formData.append('fechaInicio', this.nuevaExperiencia.fecha_inicio);
      if (this.nuevaExperiencia.fecha_fin) formData.append('fechaFin', this.nuevaExperiencia.fecha_fin);
      formData.append('descripcion', this.nuevaExperiencia.descripcion);
      formData.append('idCiudad', this.nuevaExperiencia.id_ciudad.toString());
      if (this.nuevaExperiencia.archivo_comprobante) formData.append('archivo', this.nuevaExperiencia.archivo_comprobante);

      if (this.idEdicionExperiencia) {
        formData.append('idExpLaboral', this.idEdicionExperiencia.toString());

        this.perfilService.actualizarExperiencia(formData).subscribe({
          next: () => {
            this.notif.exito('Experiencia actualizada exitosamente.'); // cambiado a notif
            this.cargarDatosDesdeBackend();
            this.cerrarModales();
          },
          error: (err) => {
            console.error(err);
            this.notif.error('Error al actualizar la experiencia.');
          }
        });
      } else {
        this.perfilService.registrarItemPerfil(this.idUsuarioLogueado, 'experiencia', formData).subscribe({
          next: () => {
            this.notif.exito('Experiencia guardada exitosamente.'); // cambiado a notif
            this.cargarDatosDesdeBackend();
            this.cerrarModales();
          },
          error: (err) => {
            console.error(err);
            this.notif.error('Error al guardar la experiencia.');
          }
        });
      }
    }

    agregarCursoBd(): void {
      if (!this.nuevoCurso.nombre_curso || !this.nuevoCurso.institucion) {
        this.notif.advertencia('El nombre del curso y la institución son obligatorios.');
        return;
      }

      const formData = new FormData();
      formData.append('nombreCurso', this.nuevoCurso.nombre_curso);
      formData.append('institucion', this.nuevoCurso.institucion);
      if (this.nuevoCurso.horas_duracion) formData.append('horasDuracion', this.nuevoCurso.horas_duracion.toString());
      if (this.nuevoCurso.archivo) formData.append('archivo', this.nuevoCurso.archivo);

      if (this.idEdicionCurso) {
        formData.append('idCurso', this.idEdicionCurso.toString());

        this.perfilService.actualizarCurso(formData).subscribe({
          next: () => {
            this.notif.exito('Curso actualizado exitosamente.'); // cambiado a notif
            this.cargarDatosDesdeBackend();
            this.cerrarModales();
          },
          error: (err) => {
            console.error(err);
            this.notif.error('Error al actualizar el curso.');
          } // cambiado a notif
        });
      } else {
        this.perfilService.registrarItemPerfil(this.idUsuarioLogueado, 'curso', formData).subscribe({
          next: () => {
            this.notif.exito('Curso guardado exitosamente.'); // cambiado a notif
            this.cargarDatosDesdeBackend();
            this.cerrarModales();
          },
          error: (err) => {
            console.error(err);
            this.notif.error('Error al guardar el curso.');
          } // cambiado a notif
        });
      }
    }

    editarTitulo(titulo: any) {
      this.idEdicionAcademica = titulo.id_academico;
      this.nuevoTitulo = {
        id_facultad: titulo.id_facultad,
        id_carrera: titulo.id_carrera,
        fechaGraduacion: titulo.fechaGraduacion,
        registroSenescyt: titulo.registroSenescyt,
        archivoReferencia: null,
        nombreArchivo: titulo.nombreArchivo
      };
      if (titulo.id_facultad) {
        this.perfilService.getCarrerasPorFacultad(titulo.id_facultad).subscribe(res => {
          this.carrerasNuevoTitulo = res;
          this.nuevoTitulo.id_carrera = titulo.id_carrera;
          this.cdr.detectChanges();
        });
      }
      this.abrirModalAcademica();
    }

    editarIdioma(idioma: any) {
      this.idEdicionIdioma = idioma.id_usuario_idioma;
      this.nuevoIdioma = {
        id_idioma: idioma.id_idioma,
        nivel: idioma.nivel,
        archivo: null,
        nombreArchivo: idioma.nombreArchivo
      };
      this.abrirModalIdioma();
    }

    editarExperiencia(exp: any) {
      this.idEdicionExperiencia = exp.id_exp_laboral;
      this.nuevaExperiencia = {
        id_empresa_catalogo: exp.id_empresa_catalogo,
        id_provincia: exp.id_provincia,
        id_ciudad: exp.id_ciudad,
        fecha_inicio: exp.fecha_inicio,
        fecha_fin: exp.fecha_fin,
        descripcion: exp.descripcion,
        archivo_comprobante: null,
        nombreArchivo: exp.nombreArchivo
      };
      if (exp.id_provincia) {
        this.perfilService.getCiudadesPorProvincia(exp.id_provincia).subscribe(res => {
          this.ciudadesExp = res;
          this.nuevaExperiencia.id_ciudad = exp.id_ciudad;
          this.cdr.detectChanges();
        });
      }
      this.cargosTemporales = exp.cargos ? [...exp.cargos] : [];
      this.abrirModalExperiencia();


      this.busquedaEmpresaTexto = exp.nombre_empresa;
    }

    editarCurso(curso: any) {
      this.idEdicionCurso = curso.id_curso;
      this.nuevoCurso = {
        nombre_curso: curso.nombre_curso,
        institucion: curso.institucion,
        horas_duracion: curso.horas_duracion,
        archivo: null,
        nombreArchivo: curso.nombreArchivo
      };
      this.abrirModalCurso();
    }
  }
