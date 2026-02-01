import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // 👈 Importado para volver al inicio
import { PerfilProfesional } from './models/perfil.model';
import { SidebarComponent } from './components/sidebar/sidebar';
import { InfoPersonalComponent } from './components/info-personal/info-personal';
import { InfoAcademicaComponent } from './components/info-academica/info-academica';
import { PerfilService } from './perfil.service'; // 👈 Asegúrate de que la ruta sea correcta
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil-profesional',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    InfoPersonalComponent,
    InfoAcademicaComponent
  ],
  templateUrl: './perfil-profesional.html',
  styleUrls: ['./perfil-profesional.css']
})
export class PerfilProfesionalComponent implements OnInit {
  // Inicializamos el objeto vacío para llenarlo con la DB
  perfil: any = {
    titulos: [],
    nombre: '',
    apellido: '',
    nombreCompleto: '',
    rol: 'Postulante',
    cedula: '',
    fechaNacimiento: '',
    genero: '',
    correo: '',
    telefono: '',
    direccion: '',
    facultad: '',
    carrera: '',
    fechaGraduacion: '',
    registroSenescyt: ''
  };

  completitudPerfil = 0;

  constructor(
    private perfilService: PerfilService, // 👈 Inyectamos el servicio
    private router: Router               // 👈 Inyectamos el router
  ) { }

  ngOnInit(): void {
    // 1. Recuperamos el ID que guardaste en el login
    const idUsuario = localStorage.getItem('idUsuario');

    if (idUsuario) {
      this.cargarDatosDesdeBackend(Number(idUsuario));
    } else {
      // Si no hay ID, por seguridad lo mandamos al login
      this.router.navigate(['/login']);
    }
  }

  cargarDatosDesdeBackend(id: number): void {
    this.perfilService.obtenerDatosUsuario(id).subscribe({
      next: (data) => {
        // 2. Mapeamos la respuesta de Spring Boot al objeto perfil
        this.perfil = { ...this.perfil, ...data };
        // 3. ✨ Ajuste para el campo "Nombre Completo" de tu interfaz
        // Como en el registro entran por separado, aquí los unimos
        this.perfil.nombreCompleto = `${data.nombre} ${data.apellido}`;

        // 4. Recalculamos el progreso con los datos reales
        this.actualizarProgreso();
      },
      error: (err) => {
        console.error('Error al recuperar datos del servidor:', err);
      }
    });
  }

  guardarPerfil(): void {
    const idUsuario = localStorage.getItem('idUsuario');

    if (!idUsuario) {
      alert('Sesión expirada. Por favor vuelve a loguearte.');
      return;
    }

    // 1. Validar que existan títulos para guardar
    if (!this.perfil.titulos || this.perfil.titulos.length === 0) {
      alert('Por favor, agrega al menos una formación académica.');
      return;
    }

    console.log('Iniciando guardado de información académica...');

    // 2. Recorremos cada título y lo enviamos al Procedure
    this.perfil.titulos.forEach((titulo: any) => {
      this.perfilService.registrarTitulo(Number(idUsuario), titulo).subscribe({
        next: (res) => {
          console.log('Título guardado:', res.mensaje);
          alert(`¡El título de ${titulo.nombreArchivo} se guardó con éxito!`);
        },
        error: (err) => {
          console.error('Error al guardar título:', err);
          alert('Hubo un error al procesar uno de los títulos. Revisa los datos.');
        }
      });
    });

    // Aquí también podrías llamar a un servicio para guardar la Info Personal si cambió
  }

  cancelarCambios(): void {
    // Volvemos a cargar los datos originales de la DB para descartar cambios locales
    const id = localStorage.getItem('idUsuario');
    if (id) this.cargarDatosDesdeBackend(Number(id));
    alert('Cambios descartados');
  }

  volverAlInicio(): void {
    // Navegamos de regreso al dashboard principal
    this.router.navigate(['/menu-principal']);
  }

  actualizarProgreso(): void {
    let camposCompletados = 0;
    const camposObligatorios = [
      this.perfil.cedula,
      this.perfil.nombre,
      this.perfil.apellido,
      this.perfil.fechaNacimiento,
      this.perfil.genero,
      this.perfil.correo,
      this.perfil.telefono
    ];

    camposObligatorios.forEach(campo => {
      if (campo && campo !== '') camposCompletados++;
    });

    const total = camposObligatorios.length;
    this.completitudPerfil = Math.round((camposCompletados / total) * 100);
  }
}
