
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs'; // Agregamos 'of' para el mock de estadísticas
import { EmpresaResumen } from '../components/validar-empresa/validar-empresa';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  // ==========================================
  // 🌐 URLs BASE (Organizadas para no fallar)
  // ==========================================
  private apiUsuariosUrl = 'http://localhost:8080/api/usuarios-bd';
  private apiAcademicoUrl = 'http://localhost:8080/api/academico';
  private apiAdminUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) { }

  // ==========================================
  // 👤 GESTIÓN DE USUARIOS Y ROLES
  // ==========================================

  obtenerRolesDeBD(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUsuariosUrl}/roles`);
  }

  crearAdministrador(usuario: any): Observable<any> {
    // Aquí sí usamos la ruta específica de registro
    return this.http.post(`${this.apiUsuariosUrl}/registrar-completo`, usuario, { responseType: 'text' });
  }

  obtenerAdminsRegistrados(): Observable<any[]> {
    // Llama al endpoint nuevo que acabamos de crear
    return this.http.get<any[]>(`${this.apiUsuariosUrl}/listar-admins`);
  }

  cambiarEstadoAdmin(id: number, estado: string): Observable<any> {
    // Envía una petición PUT. Ejemplo: .../cambiar-estado/5?estado=Inactivo
    return this.http.put(
      `${this.apiUsuariosUrl}/cambiar-estado/${id}?estado=${estado}`,
      {}, // Body vacío
      { responseType: 'text' } // Esperamos un mensaje de texto
    );
  }


  // ==========================================
  // ✅ VALIDACIÓN DE EMPRESAS (NUEVOS MÉTODOS)
  // ==========================================

  // 1. Obtener lista (Usando el nuevo Controller)
  getEmpresas(estado: string): Observable<EmpresaResumen[]> {
    return this.http.get<EmpresaResumen[]>(`${this.apiAdminUrl}/empresas?estado=${estado}`);
  }

  // 2. Cambiar estado (Aprobar/Rechazar)
  cambiarEstadoEmpresa(idUsuario: number, nuevoEstado: string): Observable<any> {
    return this.http.put(`${this.apiAdminUrl}/validar-empresa/${idUsuario}`, { nuevoEstado });
  }

  // 3. Estadísticas (Mock para que el frontend no falle, ya que lo calculamos visualmente)
  getEstadisticasEmpresas(): Observable<any> {
    return of({});
  }

  // 4. Descargar documento (Corregido para usar apiAdminUrl)
  descargarDocumentoEmpresa(idEmpresa: number): Observable<Blob> {
    return this.http.get(`${this.apiAdminUrl}/empresas/${idEmpresa}/documento`, { responseType: 'blob' });
  }

  // ==========================================
  // 📚 GESTIÓN ACADÉMICA (Corregido para usar apiAcademicoUrl)
  // ==========================================

  // --- CATEGORÍAS ---
  getCategoriasCatalogo(): Observable<any> {
    return this.http.get<any[]>(`${this.apiAcademicoUrl}/categorias`);
  }
  agregarCategoria(categoria: any): Observable<any> {
    return this.http.post(`${this.apiAcademicoUrl}/categorias`, categoria);
  }
  eliminarCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiAcademicoUrl}/categorias/${id}`); // CORREGIDO
  }

  // --- CARRERAS ---
  getCarrerasCatalogo(): Observable<any> {
    return this.http.get(`${this.apiAcademicoUrl}/carreras`);
  }

  agregarCarrera(carrera: { nombreCarrera: string; idFacultad: number }): Observable<any> {
    return this.http.post(
      `${this.apiAcademicoUrl}/aggCarreras`,
      carrera
    );
  }

  eliminarCarrera(id: number): Observable<any> {
    return this.http.delete(`${this.apiAcademicoUrl}/carreras/${id}`); // CORREGIDO
  }

  // --- FACULTADES ---
  getFacultadesCatalogo(): Observable<any> {
    return this.http.get<any[]>(`${this.apiAcademicoUrl}/facultades`);
  }

  agregarFacultad(facultad: any): Observable<any> {
    return this.http.post(`${this.apiAcademicoUrl}/facultades`, facultad);
  }

  eliminarFacultad(id: number): Observable<any> {
    return this.http.delete(`${this.apiAcademicoUrl}/facultades/${id}`); // CORREGIDO
  }

  // --- IDIOMAS ---
  getIdiomasCatalogo(): Observable<any> {
    return this.http.get<any[]>(`${this.apiAcademicoUrl}/idiomas`);

  }


  agregarIdioma(idioma: any): Observable<any> {
    return this.http.post(`${this.apiAcademicoUrl}/idiomas`, idioma);

  }

  eliminarIdioma(id: number): Observable<any> {
    return this.http.delete(`${this.apiAcademicoUrl}/idiomas/${id}`); // CORREGIDO
  }

  // --- JORNADAS ---
  getJornadasCatalogo(): Observable<any> {
    return this.http.get<any[]>(`${this.apiAcademicoUrl}/jornadas`);
  }

  agregarJornada(jornada: any): Observable<any> {
    return this.http.post(`${this.apiAcademicoUrl}/jornadas`, jornada);
  }

  eliminarJornada(id: number): Observable<any> {
    return this.http.delete(`${this.apiAcademicoUrl}/jornadas/${id}`); // CORREGIDO
  }

  // --- MODALIDADES ---
  getModalidadesCatalogo(): Observable<any> {
    return this.http.get<any[]>(`${this.apiAcademicoUrl}/modalidades`);
  }

  agregarModalidad(modalidad: any): Observable<any> {
    return this.http.post(`${this.apiAcademicoUrl}/modalidades`, modalidad);
  }

  eliminarModalidad(id: number): Observable<any> {
    return this.http.delete(`${this.apiAcademicoUrl}/modalidades/${id}`); // CORREGIDO
  }

  // ==========================================
  // 📊 REPORTES (Corregido para usar apiAdminUrl)
  // ==========================================
  // Asumiendo que los reportes los maneja el AdminController o similar


  getReporteOfertas(filtros: any): Observable<any> {
    return this.http.post(`${this.apiAdminUrl}/reportes/ofertas`, filtros);
  }

  getReportePostulaciones(filtros: any): Observable<any> {
    return this.http.post(`${this.apiAdminUrl}/reportes/postulaciones`, filtros);
  }

  getReporteUsuarios(filtros: any): Observable<any> {
    return this.http.post(`${this.apiAdminUrl}/reportes/usuarios`, filtros);
  }

  getReporteEmpresas(filtros: any): Observable<any> {
    return this.http.post(`${this.apiAdminUrl}/reportes/empresas`, filtros);
  }

  getReporteEstadisticas(filtros: any): Observable<any> {
    return this.http.post(`${this.apiAdminUrl}/reportes/estadisticas`, filtros);
  }

  // --- EXPORTAR ---
  exportarExcel(datos: any[], nombreArchivo: string): Observable<Blob> {
    return this.http.post(`${this.apiAdminUrl}/reportes/exportar/excel`,
      { datos, nombreArchivo },
      { responseType: 'blob' }
    );
  }

  exportarPDF(tipoReporte: string, filtros: any): Observable<Blob> {
    return this.http.post(`${this.apiAdminUrl}/reportes/exportar/pdf`,
      { tipoReporte, filtros },
      { responseType: 'blob' }
    );
  }

  //Auditorias
  // ========== ADMINISTRACIÓN DE USUARIOS ==========
  obtenerTodosUsuarios(): Observable<any> {
    return this.http.get(`${this.apiAcademicoUrl}/usuarios`);
  }

  // http://localhost:8080/api/academico/usuarios
  getEstadisticasUsuarios(): Observable<any> {
    return this.http.get(`${this.apiAcademicoUrl}/usuarios/estadisticas`);
  }

  getAuditoriasUsuario(idUsuario: number): Observable<any> {
    return this.http.get(`${this.apiAcademicoUrl}/admin/usuarios/${idUsuario}/auditorias`);
  }

  exportarUsuariosExcel(usuarios: any[]): Observable<Blob> {
    return this.http.post(`${this.apiAcademicoUrl}/admin/usuarios/exportar`,
      { usuarios },
      { responseType: 'blob' }
    );
  }

  exportarAuditoriasExcel(idUsuario: number): Observable<Blob> {
    return this.http.get(`${this.apiAcademicoUrl}/admin/usuarios/${idUsuario}/auditorias/exportar`,
      { responseType: 'blob' }
    );
  }




}
