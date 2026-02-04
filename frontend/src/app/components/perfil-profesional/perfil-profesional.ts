import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // 👈 Importado para volver al inicio
import { PerfilProfesional } from './models/perfil.model';
import { SidebarComponent } from './components/sidebar/sidebar';
import { InfoPersonalComponent } from './components/info-personal/info-personal';
import { InfoAcademicaComponent } from './components/info-academica/info-academica';
import { PerfilService } from './perfil.service'; // 👈 Asegúrate de que la ruta sea correcta
import { CommonModule } from '@angular/common';
import {IdiomasComponent} from './components/idiomas/idiomas';
import {ExperienciaLaboralComponent} from './components/exp-laboral/exp-laboral';
import { forkJoin } from 'rxjs';
import {FormsModule} from '@angular/forms';


@Component({
  selector: 'app-perfil-profesional',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    InfoPersonalComponent,
    InfoAcademicaComponent,
    IdiomasComponent,
    ExperienciaLaboralComponent
  ],
  templateUrl: './perfil-profesional.html',
  styleUrls: ['./perfil-profesional.css']
})
export class PerfilProfesionalComponent implements OnInit {
  // Inicializamos el objeto vacío para llenarlo con la DB
  perfil: any = {
    titulos: [],
    idiomas: [],
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

    // 1. Recolectamos todas las peticiones en un solo arreglo
    const peticiones: any[] = [];

    // Peticiones de Títulos
    if (this.perfil.titulos && this.perfil.titulos.length > 0) {
      this.perfil.titulos.forEach((t: any) => {
        peticiones.push(this.perfilService.registrarTitulo(Number(idUsuario), t));
      });
    }

    // Peticiones de Idiomas
    if (this.perfil.idiomas && this.perfil.idiomas.length > 0) {
      this.perfil.idiomas.forEach((i: any) => {
        peticiones.push(this.perfilService.registrarIdioma(Number(idUsuario), i));
      });
    }

    // 2. ¿Hay algo que guardar?
    if (peticiones.length === 0) {
      alert('No has agregado ningún cambio para guardar.');
      return;
    }

    console.log(`Iniciando el guardado de ${peticiones.length} registros...`);

    // 3. Lanzamos TODO al mismo tiempo y esperamos el final
    forkJoin(peticiones).subscribe({
      next: (resultados) => {
        console.log('¡Todo guardado correctamente!', resultados);
        alert('¡Perfil actualizado con éxito! Todos tus títulos e idiomas han sido registrados.');

        // Opcional: Limpiar los arreglos temporales o recargar datos
        this.actualizarProgreso();
      },
      error: (err) => {
        console.error('Error global en el guardado:', err);
        alert('Hubo un problema al guardar algunos datos. Por favor, revisa la consola.');
      }
    });
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
      this.perfil.cedula, this.perfil.nombre, this.perfil.apellido,
      this.perfil.fechaNacimiento, this.perfil.genero, this.perfil.correo, this.perfil.telefono
    ];

    camposObligatorios.forEach(campo => {
      if (campo && campo !== '') camposCompletados++;
    });

    // ✨ Sumamos un punto si tiene al menos un título y otro si tiene un idioma
    if (this.perfil.titulos?.length > 0) camposCompletados++;
    if (this.perfil.idiomas?.length > 0) camposCompletados++;

    const total = camposObligatorios.length + 2; // +2 por las nuevas secciones
    this.completitudPerfil = Math.round((camposCompletados / total) * 100);
  }
}
