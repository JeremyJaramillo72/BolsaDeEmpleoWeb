import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';// <-- Verifica esta ruta
import { RolCreado } from '../roles-bd'; // <-- Verifica esta ruta

interface RolAplicativo {
  id: number;
  nombre: string;
}

interface ModuloUI {
  id: string;
  nombre: string;
  seleccionado: boolean;
}

@Component({
  selector: 'app-roles-enlazar-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles-enlazar-form.html',
  styleUrls: ['./roles-enlazar-form.css']
})
export class RolesEnlazarFormComponent implements OnInit {
  @Input() rolAEnlazar: RolCreado | null = null;

  @Output() cancelado = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<string>();
  @Output() error = new EventEmitter<string>();

  guardando = false;
  rolAplicativoSeleccionado: number | null = null;
  rolesAplicativo: RolAplicativo[] = []; // Ahora se carga de BD

  // Estas son exactamente las llaves que tenías en admin-mini-admi
  // NUEVA ESTRUCTURA AGRUPADA
  // NUEVA ESTRUCTURA AGRUPADA Y ORDENADA (Mayor a Menor)
  gruposModulosUI = [
    {
      categoria: 'Módulos de Administrador',
      modulos: [
        { id: 'USERS', nombre: 'Auditorias', seleccionado: false },
        { id: 'CATALOGOS', nombre: 'Gestión de Catálogos', seleccionado: false },
        { id: 'REGISTRO_OFERTAS', nombre: 'Registro de Ofertas', seleccionado: false },
        { id: 'VALIDACION_O', nombre: 'Validación de Ofertas', seleccionado: false },
        { id: 'GESTION_ADMINS', nombre: 'Gestión Administradores', seleccionado: false },
        { id: 'REPORTES', nombre: 'Reportes y Estadísticas', seleccionado: false },
        { id: 'VALIDACION_E', nombre: 'Validación Empresas', seleccionado: false },
        { id: 'ROLES_BD', nombre: 'Gestión Roles BD', seleccionado: false },
        { id: 'CONFIG_SISTEMA', nombre: 'Configuración del Sistema', seleccionado: false }
      ]
    },
    {
      categoria: 'Módulos de Empresa',
      modulos: [
        { id: 'PERFIL_EMP', nombre: 'Gestión de Perfil Empresarial', seleccionado: false },
        { id: 'OFERTAS_EMP', nombre: 'Gestión de Ofertas Laborales', seleccionado: false },
        { id: 'POSTULANTES_EMP', nombre: 'Revisión de Postulaciones', seleccionado: false },
        { id: 'REPORTES_EMP', nombre: 'Reportes de Empresa', seleccionado: false }
      ]
    },
    {
      categoria: 'Módulos de Postulante',
      modulos: [
        { id: 'PERFIL_POS', nombre: 'Mi Perfil Profesional', seleccionado: false },
        { id: 'BUSQUEDA_POS', nombre: 'Búsqueda de Empleos', seleccionado: false },
        { id: 'POSTULACIONES_POS', nombre: 'Mis Postulaciones', seleccionado: false }
      ]
    },
    {
      categoria: 'Módulos Compartidos',
      modulos: [
        { id: 'NOTIFICACIONES', nombre: 'Notificaciones', seleccionado: false }
      ]
    }
  ];

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (!this.rolAEnlazar) {
      this.error.emit('No se ha seleccionado ningún rol para enlazar.');
      this.cancelar();
    } else {
      this.cargarRolesInternos(); // Cargamos los roles de la base de datos
    }
  }

  cargarRolesInternos() {
    this.adminService.obtenerRolesDeBD().subscribe({
      next: (data) => {
        this.rolesAplicativo = data
          // Filtramos IDs 2 (Empresa), 3 (Postulante) y 1 (Admin Maestro) si es necesario
          .filter((rol: any) => rol.idRol !== 2 && rol.idRol !== 3 && rol.idRol !== 1)
          .map((rol: any) => ({
            id: rol.idRol,
            nombre: rol.nombreRol
          }));
        this.aplicarPermisosExistentes();
      },
      error: (e) => console.error('Error cargando roles', e)
    });
  }

  aplicarPermisosExistentes() {
    if (!this.rolAEnlazar) return;

    this.adminService.obtenerPermisosRolAplicativo(this.rolAEnlazar.id).subscribe({
      next: (data: any) => {
        // Seteamos el rol aplicativo seleccionado
        if (data.idRolAplicativo) {
          this.rolAplicativoSeleccionado = data.idRolAplicativo;
        }

        // Convertimos el string "USERS,REPORTES,PERFIL_EMP" en array
        const permisosActuales: string[] = data.permisosUi
          ? data.permisosUi.split(',')
          : [];

        // Marcamos los checkboxes que ya están activos
        this.gruposModulosUI.forEach(grupo => {
          grupo.modulos.forEach(modulo => {
            modulo.seleccionado = permisosActuales.includes(modulo.id);
          });
        });
        this.cdr.detectChanges();
      },
      error: () => {
        // Si no tiene permisos enlazados aún, no pasa nada — todo queda en false
        console.log('Este rol aún no tiene permisos UI enlazados.');
      }
    });
  }

  toggleModulo(modulo: ModuloUI) {
    modulo.seleccionado = !modulo.seleccionado;
  }

  cancelar() {
    this.cancelado.emit();
  }

  guardar() {
    if (!this.rolAplicativoSeleccionado) {
      this.error.emit('Debes seleccionar un Rol de Aplicativo.');
      return;
    }

    // EXTRAER TODOS LOS MÓDULOS SELECCIONADOS RECORRIENDO LOS GRUPOS
    let modulosSeleccionados: ModuloUI[] = [];
    this.gruposModulosUI.forEach(grupo => {
      const marcadosEnGrupo = grupo.modulos.filter(m => m.seleccionado);
      modulosSeleccionados = [...modulosSeleccionados, ...marcadosEnGrupo];
    });

    if (modulosSeleccionados.length === 0) {
      this.error.emit('Debes seleccionar al menos un permiso de interfaz.');
      return;
    }

    // Convertir array de seleccionados a string "USERS,REPORTES,PERFIL_EMP"
    const permisosString = modulosSeleccionados.map(m => m.id).join(',');

    this.guardando = true;

    console.log('Enviando a Spring Boot:', {
      idRolBd: this.rolAEnlazar?.id,
      idRolAplicativo: this.rolAplicativoSeleccionado,
      permisosUi: permisosString
    });

    // Llamada REAL al servicio hacia tu Spring Boot
    this.adminService.enlazarPermisosRol(
      this.rolAEnlazar!.id,
      this.rolAplicativoSeleccionado,
      permisosString
    ).subscribe({
      next: (respuesta) => {
        this.guardando = false;
        // Emitimos para que el componente padre cierre el form y muestre el mensaje verde
        this.guardado.emit(`¡Permisos UI enlazados correctamente!`);
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error al enlazar permisos:', err);
        // Emitimos para que el padre muestre la alerta roja
        this.error.emit('Error al guardar los permisos en el servidor. Revisa la consola.');
      }
    });
  }
}
