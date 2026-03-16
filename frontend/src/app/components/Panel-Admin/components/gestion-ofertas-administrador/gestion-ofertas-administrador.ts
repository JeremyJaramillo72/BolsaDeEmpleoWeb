import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OfertaService } from '../../../../services/oferta.service';
import { UiNotificationService } from '../../../../services/ui-notification.service';

@Component({
  selector: 'app-gestion-ofertas-administrador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-ofertas-administrador.html',
  styleUrls: ['./gestion-ofertas-administrador.css']
})
export class RegistroOfertasAdministradorComponent implements OnInit {

  mostrarFormulario: boolean = false;
  ofertasFisicas: any[] = [];
  textoBusqueda: string = '';
  filtroEstado: string = 'Todos';

  // --- VARIABLES DE LA OFERTA ---
  listaCategorias: any[] = [];
  listaModalidades: any[] = [];
  listaJornadas: any[] = [];
  listaProvincias: any[] = [];
  listaCiudades: any[] = [];
  listaTiposHabilidad: any[] = [];
  listaHabilidadesFiltradas: any[] = [];

  tempIdProvincia: number = 0;
  tempIdTipoHabilidad: number = 0;
  tempIdHabilidad: number = 0;
  tempNivel: string = 'Básico';
  tempObligatorio: boolean = false;
  tempRequisitoManual: string = '';
  busquedaEmpresaTexto: string = '';
  resultadosEmpresas: any[] = [];
  empresaSeleccionada: any = null;
  nuevaOferta: any;

  listaEmpresas: any[] = [];
  listaCiudadesEmpresa: any[] = [];
  mostrarFormularioEmpresa: boolean = false;
  nuevaEmpresaObj: any = { nombre_empresa: '', ruc: '', sitio_web: '', id_provincia: 0, id_ciudad: null, id_categoria: null, correo: '', contrasenia: '' };

  constructor(
    private ofertaService: OfertaService,
    private cdr: ChangeDetectorRef,
    private ui: UiNotificationService
  ) {
    this.nuevaOferta = this.inicializarOferta();
  }

  ngOnInit(): void {
    this.cargarCatalogosDinamicos();
    this.cargarOfertasFisicas();
  }

  cargarOfertasFisicas(): void {
    this.ofertaService.obtenerOfertasFisicasAdmin().subscribe({
      next: (res: any[]) => {
        this.ofertasFisicas = res;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar la lista de ofertas físicas', err);
        this.ui.error('No se pudieron cargar las ofertas físicas registradas.');
      }
    });
  }

  get ofertasFiltradas(): any[] {
    if (!this.ofertasFisicas) return [];

    return this.ofertasFisicas.filter((oferta: any) => {
      const titulo = oferta.titulo ? oferta.titulo.toLowerCase() : '';
      const empresa = oferta.nombreEmpresa ? oferta.nombreEmpresa.toLowerCase() : '';
      const texto = this.textoBusqueda ? this.textoBusqueda.toLowerCase() : '';

      const coincideTexto = titulo.includes(texto) || empresa.includes(texto);
      const estadoReal = oferta.estadoOferta || oferta.estado_oferta || '';

      const coincideEstado = this.filtroEstado === 'Todos' || estadoReal.toLowerCase() === this.filtroEstado.toLowerCase();

      return coincideTexto && coincideEstado;
    });
  }

  abrirFormularioNuevo(): void {
    this.limpiarFormulario();
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
  }

  editarOferta(ofertaSeleccionada: any): void {
    const oferta = JSON.parse(JSON.stringify(ofertaSeleccionada));

    const habsRaw = oferta.habilidades;
    const reqsRaw = oferta.requisitosManuales || oferta.requisitos_manuales;

    this.empresaSeleccionada = {
      id: oferta.id_empresa || oferta.idEmpresa,
      nombre: oferta.nombreEmpresa || oferta.nombre_empresa || 'Empresa Vinculada',
      ruc: oferta.ruc || ''
    };
    this.busquedaEmpresaTexto = this.empresaSeleccionada.nombre;

    this.nuevaOferta = {
      idOferta: oferta.id_oferta || oferta.idOferta,
      idEmpresa: oferta.id_empresa || oferta.idEmpresa,
      idModalidad: Number(oferta.id_modalidad || oferta.idModalidad || 0),
      idCategoria: Number(oferta.id_categoria || oferta.idCategoria || 0),
      idJornada: Number(oferta.id_jornada || oferta.idJornada || 0),
      idProvincia: Number(oferta.id_provincia || oferta.idProvincia || 0),
      idCiudad: null,
      titulo: oferta.titulo,
      descripcion: oferta.descripcion,
      salarioMin: oferta.salario_min || oferta.salarioMin,
      salarioMax: oferta.salario_max || oferta.salarioMax,
      cantidadVacantes: oferta.cantidad_vacantes || oferta.cantidadVacantes,
      experienciaMinima: oferta.experiencia_minima || oferta.experienciaMinima,
      fechaCierre: oferta.fecha_cierre || oferta.fechaCierre || '',
      estadoOferta: oferta.estado_oferta || oferta.estadoOferta || 'pendiente',

      habilidades: typeof habsRaw === 'string' ? JSON.parse(habsRaw) : (habsRaw || []),
      requisitos_manuales: typeof reqsRaw === 'string' ? JSON.parse(reqsRaw) : (reqsRaw || []),

      archivo_fisico: null,
      nombreArchivo: oferta.nombreArchivo || 'Oficio adjunto previamente'
    };

    this.tempIdProvincia = this.nuevaOferta.idProvincia;
    if (this.tempIdProvincia > 0) {
      this.ofertaService.obtenerProvinciasPorCiudad(this.tempIdProvincia).subscribe(res => {
        this.listaCiudades = res;
        setTimeout(() => {
          this.nuevaOferta.idCiudad = Number(oferta.id_ciudad || oferta.idCiudad || 0);
          this.cdr.detectChanges();
        }, 50);
      });
    } else {
      this.listaCiudades = [];
    }

    this.mostrarFormulario = true;
  }

  cargarEmpresasRegistradas(): void {
    // Lógica futura si decides cargar todas de golpe
  }

  onProvinciaEmpresaChange() {
    this.nuevaEmpresaObj.id_ciudad = null;
    this.listaCiudadesEmpresa = [];
    if (this.nuevaEmpresaObj.id_provincia > 0) {
      this.ofertaService.obtenerProvinciasPorCiudad(this.nuevaEmpresaObj.id_provincia).subscribe(res => {
        this.listaCiudadesEmpresa = res;
      });
    }
  }

  guardarYSeleccionarEmpresa(): void {
    const ne = this.nuevaEmpresaObj;

    // VALIDACIONES EXTRAS DE LA NUEVA EMPRESA
    if (!ne.nombre_empresa || ne.nombre_empresa.length < 3) {
      this.ui.advertencia('Nombre de empresa inválido.');
      return;
    }
    if (!/^\d{13}$/.test(ne.ruc)) {
      this.ui.advertencia('El RUC debe tener exactamente 13 dígitos numéricos.');
      return;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(ne.correo)) {
      this.ui.advertencia('El formato del correo electrónico no es válido.');
      return;
    }
    if (ne.contrasenia.length < 8) {
      this.ui.advertencia('La contraseña debe tener al menos 8 caracteres por seguridad.');
      return;
    }
    if (!ne.id_provincia || !ne.id_ciudad || !ne.id_categoria) {
      this.ui.advertencia('Complete la ubicación y categoría de la empresa.');
      return;
    }

    this.ofertaService.crearCuentaEmpresaAdmin(this.nuevaEmpresaObj).subscribe({
      next: (res: any) => {
        this.ui.exito('Cuenta corporativa creada y vinculada exitosamente.');
        this.nuevaOferta.idEmpresa = res.idEmpresa;
        this.empresaSeleccionada = {
          id: res.idEmpresa,
          nombre: ne.nombre_empresa,
          ruc: ne.ruc
        };
        this.busquedaEmpresaTexto = ne.nombre_empresa;

        this.cancelarNuevaEmpresa();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.ui.error('Error al crear la empresa. Verifica que el correo o RUC no existan ya.');
        console.error(err);
      }
    });
  }

  cancelarNuevaEmpresa(): void {
    this.mostrarFormularioEmpresa = false;
    this.listaCiudadesEmpresa = [];
    this.nuevaEmpresaObj = { nombre_empresa: '', ruc: '', sitio_web: '', id_provincia: 0, id_ciudad: null, id_categoria: null, correo: '', contrasenia: '' };
  }

  inicializarOferta() {
    return {
      idOferta: null,
      idEmpresa: null,
      idModalidad: 1,
      idCategoria: 1,
      idJornada: 1,
      idProvincia: 0,
      idCiudad: null,
      titulo: '',
      descripcion: '',
      salarioMin: null,
      salarioMax: null,
      cantidadVacantes: 1,
      experienciaMinima: 0,
      fechaCierre: '',
      habilidades: [],
      requisitos_manuales: [],
      archivo_fisico: null,
      nombreArchivo: ''
    };
  }

  cargarCatalogosDinamicos() {
    this.ofertaService.obtenerCategorias().subscribe(res => this.listaCategorias = res);
    this.ofertaService.obtenerModalidades().subscribe(res => this.listaModalidades = res);
    this.ofertaService.obtenerJornadas().subscribe(res => this.listaJornadas = res);
    this.ofertaService.obtenerProvincias().subscribe(res => this.listaProvincias = res);
    this.ofertaService.obtenerTiposHabilidad().subscribe(res => this.listaTiposHabilidad = res);
  }

  onProvinciaChange() {
    this.nuevaOferta.idCiudad = null;
    this.listaCiudades = [];
    if (this.tempIdProvincia > 0) {
      this.ofertaService.obtenerProvinciasPorCiudad(this.tempIdProvincia).subscribe(res => this.listaCiudades = res);
    }
  }

  onTipoHabilidadChange() {
    this.tempIdHabilidad = 0;
    this.listaHabilidadesFiltradas = [];
    if (this.tempIdTipoHabilidad > 0) {
      this.ofertaService.obtenerHabilidadesPorTipo(this.tempIdTipoHabilidad).subscribe(res => this.listaHabilidadesFiltradas = res);
    }
  }

  buscarEmpresaDinamica(event: any): void {
    const termino = event.target?.value || '';

    if (termino.trim().length >= 3) {
      this.ofertaService.buscarEmpresasRegistradas(termino.trim()).subscribe({
        next: (res: any[]) => {
          this.resultadosEmpresas = res;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.warn('Error al buscar empresas registradas', err);
        }
      });
    } else {
      this.resultadosEmpresas = [];
      this.cdr.detectChanges();
    }
  }

  seleccionarEmpresaPred(empresa: any): void {
    this.empresaSeleccionada = {
      id: empresa.idUsuario || empresa.idEmpresa,
      nombre: empresa.nombreEmpresa || empresa.razonSocial,
      ruc: empresa.ruc
    };

    this.nuevaOferta.idEmpresa = this.empresaSeleccionada.id;
    this.busquedaEmpresaTexto = this.empresaSeleccionada.nombre;
    this.resultadosEmpresas = [];
  }

  quitarEmpresa(): void {
    this.empresaSeleccionada = null;
    this.nuevaOferta.idEmpresa = null;
    this.busquedaEmpresaTexto = '';
    this.resultadosEmpresas = [];
  }

  agregarSkill() {
    if (Number(this.tempIdHabilidad) > 0) {
      const habilidadSeleccionada = this.listaHabilidadesFiltradas.find(h => h.idHabilidad == this.tempIdHabilidad);
      this.nuevaOferta.habilidades.push({
        idHabilidad: Number(this.tempIdHabilidad),
        nivelRequerido: this.tempNivel,
        esObligatorio: this.tempObligatorio,
        nombreHabilidad: habilidadSeleccionada ? habilidadSeleccionada.nombreHabilidad : 'Desconocida'
      });
      this.tempIdTipoHabilidad = 0;
      this.listaHabilidadesFiltradas = [];
      this.tempIdHabilidad = 0;
      this.tempNivel = 'Básico';
      this.tempObligatorio = false;
    }
  }

  removerSkill(index: number) { this.nuevaOferta.habilidades.splice(index, 1); }

  agregarRequisitoManual() {
    if (this.tempRequisitoManual.trim().length > 0) {
      this.nuevaOferta.requisitos_manuales.push({ descripcion: this.tempRequisitoManual.trim() });
      this.tempRequisitoManual = '';
    }
  }

  removerRequisitoManual(index: number) { this.nuevaOferta.requisitos_manuales.splice(index, 1); }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.ui.advertencia('El archivo es muy pesado (Máx 5MB)');
        return;
      }
      console.log('Tamaño del archivo:', file.size / (1024 * 1024), 'MB');
      this.nuevaOferta.archivo_fisico = file;
      this.nuevaOferta.nombreArchivo = file.name;
    }
  }

  validarFormulario(): boolean {
    const o = this.nuevaOferta;


    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (!o.idEmpresa && !this.mostrarFormularioEmpresa) {
      this.ui.advertencia('⚠️ Selecciona o crea la empresa solicitante.');
      return false;
    }
    if (!o.titulo || o.titulo.trim().length < 5) {
      this.ui.advertencia('⚠️ El título es demasiado corto (mínimo 5 caracteres).');
      return false;
    }


    if (o.experienciaMinima === null || o.experienciaMinima < 0) {
      this.ui.advertencia('⚠️ La experiencia mínima no puede ser negativa.');
      return false;
    }

    if (!o.cantidadVacantes || o.cantidadVacantes < 1) {
      this.ui.advertencia('⚠️ Debe haber al menos 1 vacante.');
      return false;
    }

    if (!this.tempIdProvincia || !o.idCiudad) {
      this.ui.advertencia('⚠️ Debe seleccionar la ubicación (Provincia y Ciudad).');
      return false;
    }

    if (o.salarioMin && o.salarioMax && Number(o.salarioMin) > Number(o.salarioMax)) {
      this.ui.advertencia('⚠️ El salario mínimo no puede ser mayor al máximo.');
      return false;
    }


    if (!o.fechaCierre) {
      this.ui.advertencia('⚠️ La fecha de cierre es obligatoria.');
      return false;
    }


    const partesFecha = o.fechaCierre.split('-');
    const fechaC = new Date(Number(partesFecha[0]), Number(partesFecha[1]) - 1, Number(partesFecha[2]));
    fechaC.setHours(0, 0, 0, 0); // Forzar a las 00:00:00 local

    if (fechaC.getTime() < hoy.getTime()) {
      this.ui.advertencia('⚠️ La fecha de cierre no puede ser anterior a hoy.');
      return false;
    }

    const limiteFuturo = new Date();
    limiteFuturo.setFullYear(hoy.getFullYear() + 1);
    if (fechaC.getTime() > limiteFuturo.getTime()) {
      this.ui.advertencia('⚠️ La fecha de cierre no puede exceder 1 año desde hoy.');
      return false;
    }

    if (o.habilidades.length === 0) {
      this.ui.advertencia('⚠️ Debe agregar al menos una habilidad técnica requerida.');
      return false;
    }

    return true;
  }

  guardar() {
    if (!this.validarFormulario()) return;

    const formData = new FormData();
    const idAdminLogueado = localStorage.getItem('idUsuario') || '0';

    formData.append('idUsuarioAdmin', idAdminLogueado);
    if (this.nuevaOferta.idOferta) formData.append('idOferta', this.nuevaOferta.idOferta.toString());
    formData.append('idEmpresa', this.nuevaOferta.idEmpresa ? this.nuevaOferta.idEmpresa.toString() : '');
    formData.append('titulo', this.nuevaOferta.titulo);
    formData.append('descripcion', this.nuevaOferta.descripcion);
    formData.append('idModalidad', this.nuevaOferta.idModalidad.toString());
    formData.append('idCategoria', this.nuevaOferta.idCategoria.toString());
    formData.append('idJornada', this.nuevaOferta.idJornada.toString());
    formData.append('idCiudad', this.nuevaOferta.idCiudad ? this.nuevaOferta.idCiudad.toString() : '');
    formData.append('salarioMin', this.nuevaOferta.salarioMin ? this.nuevaOferta.salarioMin.toString() : '');
    formData.append('salarioMax', this.nuevaOferta.salarioMax ? this.nuevaOferta.salarioMax.toString() : '');
    formData.append('cantidadVacantes', this.nuevaOferta.cantidadVacantes.toString());
    formData.append('experienciaMinima', this.nuevaOferta.experienciaMinima.toString());
    formData.append('fechaCierre', this.nuevaOferta.fechaCierre);
    formData.append('habilidadesStr', JSON.stringify(this.nuevaOferta.habilidades));
    formData.append('requisitosStr', JSON.stringify(this.nuevaOferta.requisitos_manuales));

    if (this.nuevaOferta.archivo_fisico) {
      formData.append('archivoOficio', this.nuevaOferta.archivo_fisico);
    }

    this.ofertaService.registrarOfertaFisica(formData).subscribe({
      next: (res: any) => {
        this.ui.exito(this.nuevaOferta.idOferta ? '¡Oferta actualizada!' : '¡Oferta física registrada correctamente!');
        this.cerrarFormulario();
        this.cargarOfertasFisicas();
      },
      error: (err: any) => {
        const mensajeReal = err.error?.error || err.error?.message || 'Error al procesar la solicitud en el servidor.';
        this.ui.error(`⚠️ ${mensajeReal}`);
        console.error('Detalle del servidor:', err);
      }
    });
  }

  limpiarFormulario() {
    this.nuevaOferta = this.inicializarOferta();
    this.tempIdProvincia = 0;
    this.listaCiudades = [];
    this.cancelarNuevaEmpresa();
    this.quitarEmpresa();
  }
}
