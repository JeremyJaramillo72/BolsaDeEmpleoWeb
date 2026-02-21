import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

interface Rol {
  idRol?: number;
  nombreRol: string;
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
  carrerasFiltradas: any[] = []; // 👈 NUEVA: Para mostrar carreras filtradas por facultad
  facultades: Catalogo[] = [];
  idiomas: Catalogo[] = [];
  jornadas: Catalogo[] = [];
  modalidades: Catalogo[] = [];
  roles: Rol[] = [];

  // Lista de facultades para el select de carreras
  facultadesDisponibles: any[] = [];

  // Formularios temporales
  nuevaCategoria: Catalogo = { nombre: '' };
  nuevaCarrera: any = { nombreCarrera: '', idFacultad: null };
  nuevaFacultad: Catalogo = { nombre: '' };
  nuevoIdioma: Catalogo = { nombre: '' };
  nuevaJornada: Catalogo = { nombre: '' };
  nuevaModalidad: Catalogo = { nombre: '' };

  nuevoRol: Rol = { nombreRol: '' }; //

  // Estados de carga
  cargando = false;
  mensajeExito = '';
  mensajeError = '';

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarTodosCatalogos();
    this.cdr.detectChanges();
  }

  // ========== MÉTODOS DE CARGA ==========
  cargarTodosCatalogos(): void {
    this.cargarCategorias();
    this.cargarCarreras();
    this.cargarFacultades();
    this.cargarIdiomas();
    this.cargarJornadas();
    this.cargarModalidades();
    this.cargarRoles();
  }

  cargarCategorias(): void {
    this.adminService.getCategoriasCatalogo().subscribe({
      next: (data) => {
        this.categorias = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => this.mostrarError('Error al cargar categorías')
    });
  }

  cargarCarreras(): void {
    this.adminService.getCarrerasCatalogo().subscribe({
      next: (data) => {
        this.carreras = [...data];
        this.carrerasFiltradas = [...data]; // Inicialmente mostrar todas
        this.cdr.detectChanges();
      },
      error: (err) => this.mostrarError('Error al cargar carreras')
    });
  }



  cargarFacultades(): void {
    this.adminService.getFacultadesCatalogo().subscribe({
      next: (data) => {
        this.facultades = [...data];
        this.facultadesDisponibles = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => this.mostrarError('Error al cargar facultades')
    });
  }

  cargarIdiomas(): void {
    this.adminService.getIdiomasCatalogo().subscribe({
      next: (data) => {
        this.idiomas = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => this.mostrarError('Error al cargar idiomas')
    });
  }

  cargarJornadas(): void {
    this.adminService.getJornadasCatalogo().subscribe({
      next: (data) => {
        this.jornadas = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => this.mostrarError('Error al cargar jornadas')
    });
  }

  cargarModalidades(): void {
    this.adminService.getModalidadesCatalogo().subscribe({
      next: (data) => {
        this.modalidades = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => this.mostrarError('Error al cargar modalidades')
    });
  }

  cargarRoles(): void {
    this.adminService.getRolesCatalogo().subscribe({
      next: (data) => {
        this.roles = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => this.mostrarError('Error al cargar roles')
    });
  }

  // ========== 🆕 MÉTODO PARA FILTRAR CARRERAS POR FACULTAD ==========
  onFacultadChange(idFacultad: number): void {
    if (idFacultad) {
      this.adminService.getCarrerasPorFacultad(idFacultad).subscribe({
        next: (data) => {
          this.carrerasFiltradas = [...data];
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.mostrarError('Error al cargar las carreras de esta facultad');
          this.carrerasFiltradas = [];
        }
      });
    } else {
      this.carrerasFiltradas = [...this.carreras]; // Mostrar todas si no hay filtro
    }
  }

  // ========== MÉTODOS DE AGREGAR ==========
  agregarCategoria(): void {
    if (!this.nuevaCategoria.nombre.trim()) {
      this.mostrarError('El nombre de la categoría es obligatorio');
      return;
    }

    const categoriaParaEnviar = {
      nombreCategoria: this.nuevaCategoria.nombre.trim()
    };

    this.adminService.agregarCategoria(categoriaParaEnviar).subscribe({
      next: (response) => {
        this.mostrarExito('Categoría agregada exitosamente');
        this.nuevaCategoria.nombre = '';

        // 🔄 Recarga automática
        setTimeout(() => {
          this.cargarCategorias();
        }, 300);
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
        this.nuevaCarrera = { nombreCarrera: '', idFacultad: null };

        // 🔄 Recarga automática
        setTimeout(() => {
          this.cargarCarreras();
        }, 300);
      },
      error: () => this.mostrarError('Error al agregar carrera')
    });
  }

  agregarFacultad(): void {
    if (!this.nuevaFacultad.nombre.trim()) {
      this.mostrarError('El nombre de la facultad es obligatorio');
      return;
    }

    const facultadParaEnviar = {
      nombreFacultad: this.nuevaFacultad.nombre.trim()
    };

    this.adminService.agregarFacultad(facultadParaEnviar).subscribe({
      next: (response) => {
        this.mostrarExito('Facultad agregada exitosamente');
        this.nuevaFacultad.nombre = '';

        // 🔄 Recarga automática
        setTimeout(() => {
          this.cargarFacultades();
        }, 300);
      },
      error: (err) => this.mostrarError('Error al agregar facultad')
    });
  }

  agregarIdioma(): void {
    if (!this.nuevoIdioma.nombre?.trim()) {
      this.mostrarError('El nombre del idioma es obligatorio');
      return;
    }

    const idiomaParaEnviar = {
      nombreIdioma: this.nuevoIdioma.nombre.trim()
    };

    this.adminService.agregarIdioma(idiomaParaEnviar).subscribe({
      next: (response) => {
        this.mostrarExito('Idioma agregado exitosamente');
        this.nuevoIdioma.nombre = '';

        // 🔄 Recarga automática
        setTimeout(() => {
          this.cargarIdiomas();
        }, 300);
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

    const jornadaParaEnviar = {
      nombreJornada: this.nuevaJornada.nombre.trim()
    };

    this.adminService.agregarJornada(jornadaParaEnviar).subscribe({
      next: (response) => {
        this.mostrarExito('Jornada agregada exitosamente');
        this.nuevaJornada.nombre = '';

        // 🔄 Recarga automática
        setTimeout(() => {
          this.cargarJornadas();
        }, 300);
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

    const modalidadParaEnviar = {
      nombreModalidad: this.nuevaModalidad.nombre.trim()
    };

    this.adminService.agregarModalidad(modalidadParaEnviar).subscribe({
      next: (response) => {
        this.mostrarExito('Modalidad agregada exitosamente');
        this.nuevaModalidad.nombre = '';

        // 🔄 Recarga automática
        setTimeout(() => {
          this.cargarModalidades();
        }, 300);
      },
      error: (err) => this.mostrarError('Error al guardar la modalidad')
    });
  }

  agregarRol(): void {
    if (!this.nuevoRol.nombreRol?.trim()) {
      this.mostrarError('El nombre del rol es obligatorio');
      return;
    }

    this.adminService.agregarRol({ nombreRol: this.nuevoRol.nombreRol.trim() }).subscribe({
      next: () => {
        this.mostrarExito('Rol agregado exitosamente');
        this.nuevoRol.nombreRol = '';
        setTimeout(() => this.cargarRoles(), 300);
      },
      error: () => this.mostrarError('Error al agregar rol')
    });
  }

  // ========== MÉTODOS DE ELIMINAR ==========
  eliminarCategoria(id: number): void {
    if (confirm('¿Está seguro de eliminar esta categoría?')) {
      this.adminService.eliminarCategoria(id).subscribe({
        next: () => {
          this.mostrarExito('Categoría eliminada exitosamente');
          this.categorias = this.categorias.filter(c => c.idCategoria !== id);

          // 🔄 Recarga automática
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

          // 🔄 Recarga automática
          setTimeout(() => {
            this.cargarCarreras();
          }, 300);
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

          // 🔄 Recarga automática
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
      this.adminService.eliminarIdioma(id).subscribe({
        next: () => {
          this.mostrarExito('Idioma eliminado exitosamente');

          // 🔄 Recarga automática
          setTimeout(() => {
            this.cargarIdiomas();
          }, 300);
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

          // 🔄 Recarga automática
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

          // 🔄 Recarga automática
          setTimeout(() => {
            this.cargarModalidades();
          }, 300);
        },
        error: (err) => this.mostrarError('Error al eliminar modalidad')
      });
    }
  }

  eliminarRol(id: number): void {
    if (confirm('¿Está seguro de eliminar este rol?')) {
      this.adminService.eliminarRol(id).subscribe({
        next: () => {
          this.mostrarExito('Rol eliminado exitosamente');
          setTimeout(() => this.cargarRoles(), 300);
        },
        error: () => this.mostrarError('Error al eliminar rol')
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
