import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

interface Catalogo {
  id?: number;
  nombre: string;
  // Idioamas
  idIdioma?: number;
  nombreIdioma?: string;

  // Categorias
  idCategoria?: number;
  nombreCategoria?: string;

  //facultades
  idFacultad?: number;
  nombreFacultad?: string;

  //jornadas
  idJornada?: number;
  nombreJornada?: string;

  //Modalidades
  idModalidad?: number;
  nombreModalidad?: string;

  id_Rol?: number;
  nombreRol?: string;

}

interface Carrera {
  idCarrera?: number;
  nombreCarrera: string;
  idFacultad: number;
}

@Component({
  selector: 'app-gestion-catalogos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-catalogos.html',
  styleUrls: ['./gestion-catalogos.css']
})
export class GestionCatalogosComponent implements OnInit {

  // Control de tabs
  tabActiva: string = 'categorias';

  // Catálogos
  categorias: Catalogo[] = [];
  carreras: any[] = [];
  facultades: Catalogo[] = [];
  idiomas: Catalogo[] = [];
  jornadas: Catalogo[] = [];
  modalidades: Catalogo[] = [];

  // Lista de facultades para el select de carreras
  facultadesDisponibles: any[] = [];

  // Formularios temporales
  nuevaCategoria: Catalogo = { nombre: '' };
  nuevaCarrera: any = { nombre: '', id_facultad: null };
  nuevaFacultad: Catalogo = { nombre: '' };
  nuevoIdioma: Catalogo = { nombre: '' };
  nuevaJornada: Catalogo = { nombre: '' };
  nuevaModalidad: Catalogo = { nombre: '' };



  // Estados de carga
  cargando = false;
  mensajeExito = '';
  mensajeError = '';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.cargarTodosCatalogos();
  }

  // ========== MÉTODOS DE CARGA ==========
  cargarTodosCatalogos(): void {
    this.cargarCategorias();
    this.cargarCarreras();
    this.cargarFacultades();
    this.cargarIdiomas();
    this.cargarJornadas();
    this.cargarModalidades();
  }

  cargarCategorias(): void {
    this.adminService.getCategoriasCatalogo().subscribe({
      next: (data) => this.categorias = data,
      error: (err) => this.mostrarError('Error al cargar categorías')
    });
  }

  cargarCarreras(): void {
    this.adminService.getCarrerasCatalogo().subscribe({
      next: (data) => this.carreras = data,
      error: (err) => this.mostrarError('Error al cargar carreras')
    });
  }

  cargarFacultades(): void {
    this.adminService.getFacultadesCatalogo().subscribe({
      next: (data) => {
        // Creamos nueva referencia para forzar la actualización en la vista
        this.facultades = [...data];
        this.facultadesDisponibles = [...data];
      },
      error: (err) => this.mostrarError('Error al cargar facultades')
    });
  }

  cargarIdiomas(): void {
    this.adminService.getIdiomasCatalogo().subscribe({
      next: (data) => {
        // Creamos una nueva referencia del arreglo para forzar la detección de cambios
        this.idiomas = [...data];
      },
      error: (err) => this.mostrarError('Error al cargar idiomas')
    });
  }

  cargarJornadas(): void {
    this.adminService.getJornadasCatalogo().subscribe({
      next: (data) => {
        // Usamos el operador spread para asegurar la actualización de la vista
        this.jornadas = [...data];
      },
      error: (err) => this.mostrarError('Error al cargar jornadas')
    });
  }

  cargarModalidades(): void {
    this.adminService.getModalidadesCatalogo().subscribe({
      next: (data) => {
        // Creamos nueva referencia para asegurar que Angular detecte el cambio
        this.modalidades = [...data];
      },
      error: (err) => this.mostrarError('Error al cargar modalidades')
    });
  }

  // ========== MÉTODOS DE AGREGAR ==========
  agregarCategoria(): void {
    if (!this.nuevaCategoria.nombre.trim()) {
      this.mostrarError('El nombre de la categoría es obligatorio');
      return;
    }

    // Mapeo al nombre de la entidad en Java
    const categoriaParaEnviar = {
      nombreCategoria: this.nuevaCategoria.nombre.trim()
    };

    this.adminService.agregarCategoria(categoriaParaEnviar).subscribe({
      next: (response) => {
        this.mostrarExito('Categoría agregada exitosamente');

        // Retraso para sincronización con la BD
        setTimeout(() => {
          this.cargarCategorias();
        }, 300);

        this.nuevaCategoria.nombre = ''; // Limpiar input
      },
      error: (err) => this.mostrarError('Error al agregar categoría')
    });
  }

  agregarCarrera(): void {
    if (!this.nuevaCarrera.nombreCarrera?.trim() || !this.nuevaCarrera.idFacultad) {
      this.mostrarError('Complete todos los campos de la carrera');
      return;
    }

    const carreraParaEnviar = {
      nombreCarrera: this.nuevaCarrera.nombreCarrera.trim(),
      idFacultad: this.nuevaCarrera.idFacultad
    };

    this.adminService.agregarCarrera(carreraParaEnviar).subscribe({
      next: () => {
        this.mostrarExito('Carrera agregada exitosamente');
        this.cargarCarreras();
        this.nuevaCarrera = { nombreCarrera: '', idFacultad: null };
      },
      error: () => this.mostrarError('Error al agregar carrera')
    });
  }


  agregarFacultad(): void {
    if (!this.nuevaFacultad.nombre.trim()) {
      this.mostrarError('El nombre de la facultad es obligatorio');
      return;
    }

    // Mapeo al nombre que espera tu Backend en Java
    const facultadParaEnviar = {
      nombreFacultad: this.nuevaFacultad.nombre.trim()
    };

    this.adminService.agregarFacultad(facultadParaEnviar).subscribe({
      next: (response) => {
        this.mostrarExito('Facultad agregada exitosamente');

        // ✨ Sincronización con la base de datos
        setTimeout(() => {
          this.cargarFacultades();
        }, 300);

        this.nuevaFacultad.nombre = ''; // Limpiar input
      },
      error: (err) => this.mostrarError('Error al agregar facultad')
    });
  }

  // ========== AGREGAR IDIOMA ==========
  // ========== AGREGAR IDIOMA ==========
  agregarIdioma(): void {
    // 1. Validación de entrada
    if (!this.nuevoIdioma.nombre?.trim()) {
      this.mostrarError('El nombre del idioma es obligatorio');
      return;
    }

    // 2. Mapeo del objeto según tu Entidad de Java (nombreIdioma)
    const idiomaParaEnviar = {
      nombreIdioma: this.nuevoIdioma.nombre.trim()
    };

    // 3. Llamada al servicio
    this.adminService.agregarIdioma(idiomaParaEnviar).subscribe({
      next: (response) => {
        // Notificación de éxito al usuario
        this.mostrarExito('Idioma agregado exitosamente');

        // ✨ IMPLEMENTACIÓN DEL RETRASO:
        // Esperamos 300ms para que PostgreSQL confirme el commit
        // antes de refrescar la lista en pantalla.
        setTimeout(() => {
          this.cargarIdiomas();
        }, 300);

        // 4. Limpieza del formulario
        this.nuevoIdioma.nombre = '';
      },
      error: (err) => {
        console.error('Error en la inserción:', err);
        this.mostrarError('Error al agregar el idioma en el servidor');
      }
    });
  }

  agregarJornada(): void {
    if (!this.nuevaJornada.nombre?.trim()) {
      this.mostrarError('El nombre de la jornada es obligatorio');
      return;
    }

    // Mapeo al nombre de la propiedad en tu entidad Java
    const jornadaParaEnviar = {
      nombreJornada: this.nuevaJornada.nombre.trim()
    };

    this.adminService.agregarJornada(jornadaParaEnviar).subscribe({
      next: (response) => {
        this.mostrarExito('Jornada agregada exitosamente');

        // ✨ Sincronización en tiempo real con la base de datos
        setTimeout(() => {
          this.cargarJornadas();
        }, 300);

        this.nuevaJornada.nombre = ''; // Limpiar el input
      },
      error: (err) => {
        console.error(err);
        this.mostrarError('Error al agregar jornada');
      }
    });
  }

  agregarModalidad(): void {
    if (!this.nuevaModalidad.nombre?.trim()) {
      this.mostrarError('El nombre de la modalidad es obligatorio');
      return;
    }

    // Mapeo al atributo 'nombreModalidad' de tu entidad Java
    const modalidadParaEnviar = {
      nombreModalidad: this.nuevaModalidad.nombre.trim()
    };

    this.adminService.agregarModalidad(modalidadParaEnviar).subscribe({
      next: (response) => {
        this.mostrarExito('Modalidad agregada exitosamente');

        // Espera de 300ms para asegurar la persistencia en PostgreSQL
        setTimeout(() => {
          this.cargarModalidades();
        }, 300);

        this.nuevaModalidad.nombre = ''; // Limpiar input
      },
      error: (err) => this.mostrarError('Error al guardar la modalidad')
    });
  }

  // ========== MÉTODOS DE ELIMINAR ==========
  eliminarCategoria(id: number): void {
    if (confirm('¿Está seguro de eliminar esta categoría?')) {
      this.adminService.eliminarCategoria(id).subscribe({
        next: () => {
          this.mostrarExito('Categoría eliminada exitosamente');
          // Optimización: quitar de la lista inmediatamente
          this.categorias = this.categorias.filter(c => c.idCategoria !== id);

          // El refresco del servidor se queda como respaldo
          setTimeout(() => this.cargarCategorias(), 300);
        },
        error: (err) => this.mostrarError('Error al eliminar categoría')
      });
    }
  }

  eliminarCarrera(id: number): void {
    if (confirm('¿Está seguro de eliminar esta carrera?')) {
      this.adminService.eliminarCarrera(id).subscribe({
        next: () => {
          this.mostrarExito('Carrera eliminada exitosamente');
          this.cargarCarreras();
        },
        error: (err) => this.mostrarError('Error al eliminar carrera')
      });
    }
  }

  eliminarFacultad(id: number): void {
    if (confirm('¿Está seguro de eliminar esta facultad?')) {
      this.adminService.eliminarFacultad(id).subscribe({
        next: () => {
          this.mostrarExito('Facultad eliminada exitosamente');

          // Refresco con delay para asegurar que el borrado se procesó
          setTimeout(() => {
            this.cargarFacultades();
          }, 300);
        },
        error: (err) => this.mostrarError('Error al eliminar facultad')
      });
    }
  }

  eliminarIdioma(id: number): void {
    if (confirm('¿Está seguro de eliminar este idioma?')) {
      // Usamos el ID correcto que viene de la base de datos
      this.adminService.eliminarIdioma(id).subscribe({
        next: () => {
          this.mostrarExito('Idioma eliminado exitosamente');
          this.cargarIdiomas();
        },
        error: (err) => this.mostrarError('Error al eliminar idioma')
      });
    }
  }

  eliminarJornada(id: number): void {
    if (confirm('¿Está seguro de eliminar esta jornada?')) {
      this.adminService.eliminarJornada(id).subscribe({
        next: () => {
          this.mostrarExito('Jornada eliminada exitosamente');

          // Refresco con delay para confirmar el borrado en el servidor
          setTimeout(() => {
            this.cargarJornadas();
          }, 300);
        },
        error: (err) => this.mostrarError('Error al eliminar jornada')
      });
    }
  }

  eliminarModalidad(id: number): void {
    if (confirm('¿Está seguro de eliminar esta modalidad?')) {
      this.adminService.eliminarModalidad(id).subscribe({
        next: () => {
          this.mostrarExito('Modalidad eliminada exitosamente');
          this.cargarModalidades();
        },
        error: (err) => this.mostrarError('Error al eliminar modalidad')
      });
    }
  }

  // ========== UTILIDADES ==========
  cambiarTab(tab: string): void {
    this.tabActiva = tab;
    this.limpiarMensajes();
  }

  obtenerNombreFacultad(idFacultad: number): string {
    const facultad = this.facultadesDisponibles.find(f => f.idFacultad === idFacultad);
    return facultad ? facultad.nombreFacultad : 'Sin facultad';
  }

  mostrarExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.mensajeError = '';
    setTimeout(() => this.mensajeExito = '', 3000);
  }

  mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
    this.mensajeExito = '';
    setTimeout(() => this.mensajeError = '', 3000);
  }

  limpiarMensajes(): void {
    this.mensajeExito = '';
    this.mensajeError = '';
  }
}
