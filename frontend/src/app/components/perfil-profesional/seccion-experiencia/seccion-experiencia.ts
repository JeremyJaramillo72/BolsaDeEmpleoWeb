import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-seccion-experiencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seccion-experiencia.html',
  styleUrls: ['./seccion-experiencia.css']
})
export class SeccionExperienciaComponent {

  @Input() experiencias: any[] = [];


  @Input() provincias: any[] = [];
  @Input() ciudadesExp: any[] = [];
  @Input() categorias: any[] = [];

  @Input() cargosDisponibles: any[] = [];
  @Input() empresasDisponibles: any[] = [];


  @Output() onGuardarExperiencia = new EventEmitter<{formData: FormData, idEdicion: number | null}>();
  @Output() onEliminar = new EventEmitter<{index: number, id: number}>();
  @Output() onVerPdf = new EventEmitter<string>();


  @Output() onBuscarCargo = new EventEmitter<string>();
  @Output() onBuscarEmpresa = new EventEmitter<string>();
  @Output() onCambioProvincia = new EventEmitter<number>();
  @Output() onCrearCargo = new EventEmitter<{nombre: string, callback: (res: any) => void}>();
  @Output() onCrearEmpresa = new EventEmitter<{empresa: any, callback: (res: any) => void}>();

  @ViewChild('fileInputExp') fileInputExp!: ElementRef;


  modalExperiencia: boolean = false;
  idEdicionExperiencia: number | null = null;
  mostrarNuevoCargo: boolean = false;
  mostrarNuevaEmpresa: boolean = false;
  busquedaCargoTexto: string = '';
  busquedaEmpresaTexto: string = '';
  nuevoNombreCargo: string = '';
  cargoActual: number | null = null;
  cargosTemporales: any[] = [];

  nuevaEmpresaObj: any = {nombre_empresa: '', ruc: '', id_categoria: null};
  nuevaExperiencia: any = {
    id_empresa_catalogo: null, id_provincia: null, id_ciudad: null,
    fecha_inicio: '', fecha_fin: '', descripcion: '', archivo_comprobante: null, nombreArchivo: ''
  };
  constructor(private cdr: ChangeDetectorRef) {}
  abrirModal() { this.modalExperiencia = true; }

  cerrarModal() {
    this.modalExperiencia = false;
    this.idEdicionExperiencia = null;
    this.mostrarNuevoCargo = false;
    this.mostrarNuevaEmpresa = false;
    this.busquedaCargoTexto = '';
    this.busquedaEmpresaTexto = '';
    this.cargosTemporales = [];
    this.nuevaEmpresaObj = {nombre_empresa: '', ruc: '', id_categoria: null};
    this.nuevaExperiencia = {
      id_empresa_catalogo: null, id_provincia: null, id_ciudad: null,
      fecha_inicio: '', fecha_fin: '', descripcion: '', archivo_comprobante: null, nombreArchivo: ''
    };
  }

  editar(exp: any) {
    this.idEdicionExperiencia = exp.id_exp_laboral;
    this.nuevaExperiencia = {
      id_empresa_catalogo: exp.id_empresa_catalogo, id_provincia: exp.id_provincia, id_ciudad: exp.id_ciudad,
      fecha_inicio: exp.fecha_inicio, fecha_fin: exp.fecha_fin, descripcion: exp.descripcion,
      archivo_comprobante: null, nombreArchivo: exp.nombreArchivo
    };
    this.busquedaEmpresaTexto = exp.nombre_empresa;
    this.cargosTemporales = exp.cargos ? [...exp.cargos] : [];

    if (exp.id_provincia) {
      this.onCambioProvincia.emit(exp.id_provincia);
    }
    this.abrirModal();
  }

  // --- LÓGICA DE CARGOS ---
  buscarCargoLocal(event: any) {
    const termino = event.target?.value || '';
    this.onBuscarCargo.emit(termino);
  }

  seleccionarCargoPred(cargo: any) {
    this.cargoActual = cargo.idCargo;
    this.busquedaCargoTexto = cargo.nombreCargo;
    this.cargosDisponibles = []; // Limpiamos la lista localmente
  }

  agregarCargoTemporal() {
    if (this.cargoActual) {
      this.cargosTemporales.push({id_cargo: this.cargoActual, nombre_cargo: this.busquedaCargoTexto});
      this.cargoActual = null;
      this.busquedaCargoTexto = '';

    }
  }

  eliminarCargoTemporal(index: number) {
    this.cargosTemporales.splice(index, 1);
  }

  guardarNuevoCargoLocal() {
    if (!this.nuevoNombreCargo) return;

    // Le pasamos el nombre al Padre y una función para que nos avise cuando termine
    this.onCrearCargo.emit({
      nombre: this.nuevoNombreCargo,
      callback: (res: any) => {
        this.cargoActual = res.idCargo;
        this.busquedaCargoTexto = res.nombreCargo;
        this.agregarCargoTemporal();
        this.mostrarNuevoCargo = false;
        this.nuevoNombreCargo = '';
        this.cdr.detectChanges();
      }
    });
  }

  // --- LÓGICA DE EMPRESAS ---
  buscarEmpresaLocal(event: any) {
    const termino = event.target?.value || '';
    this.onBuscarEmpresa.emit(termino);
  }

  seleccionarEmpresaPred(empresa: any) {
    this.nuevaExperiencia.id_empresa_catalogo = empresa.idEmpresaCatalogo;
    this.busquedaEmpresaTexto = empresa.nombreEmpresa;
    this.empresasDisponibles = [];
  }

  guardarNuevaEmpresaLocal() {
    if (!this.nuevaEmpresaObj.nombre_empresa) {
      alert('El nombre de la empresa es obligatorio'); return;
    }

    this.onCrearEmpresa.emit({
      empresa: this.nuevaEmpresaObj,
      callback: (res: any) => {
        this.nuevaExperiencia.id_empresa_catalogo = res.idEmpresaCatalogo;
        this.busquedaEmpresaTexto = res.nombreEmpresa;
        this.mostrarNuevaEmpresa = false;
        this.nuevaEmpresaObj = {nombre_empresa: '', ruc: '', id_categoria: null};
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.nuevaExperiencia.archivo_comprobante = file;
    this.nuevaExperiencia.nombreArchivo = file.name;
  }

  provinciaCambio() {
    this.nuevaExperiencia.id_ciudad = null;
    if (this.nuevaExperiencia.id_provincia) {
      this.onCambioProvincia.emit(this.nuevaExperiencia.id_provincia);
    }
  }

  prepararGuardado() {
    if (this.cargosTemporales.length === 0 || !this.nuevaExperiencia.id_empresa_catalogo || !this.nuevaExperiencia.id_ciudad) {
      alert('Agrega al menos un cargo, una empresa y una ciudad primero.');
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

    this.onGuardarExperiencia.emit({ formData: formData, idEdicion: this.idEdicionExperiencia });
    this.cerrarModal();
  }
}
