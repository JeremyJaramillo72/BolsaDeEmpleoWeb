
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs'; // Agregamos BehaviorSubject
import { EmpresaResumen } from '../components/validar-empresa/validar-empresa';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  // Subject para notificar cambios en la lista de admins
  private adminsActualizados$ = new BehaviorSubject<boolean>(false);
  public adminsActualizados = this.adminsActualizados$.asObservable();

  private apiUsuariosUrl = 'http://localhost:8080/api/usuarios-bd';
  private apiAcademicoUrl = 'http://localhost:8080/api/academico';
  private apiAdminUrl = 'http://localhost:8080/api/admin';

  private apiRolesbd = 'http://localhost:8080/api/rolesbd';
  private apiRolesAplicativo ='http://localhost:8080/api/academico/roles';
  private apiOfertasUrl = 'http://localhost:8080/api/ofertas';

  private apiauditoriasUrl = 'http://localhost:8080/api/auditorias';

  private apiHistorialOferta = 'http://localhost:8080/api/auditoria/ofertas';

  private apiPostulanteAudi = 'http://localhost:8080/api/auditoria/postulantes';
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

  actualizarCategoria(categoria: { idCategoria: number, nombreCategoria: string }): Observable<any> {
    return this.http.put(`${this.apiAcademicoUrl}/categorias/${categoria.idCategoria}`, categoria);
  }

  actualizarCarrera(carrera: { idCarrera: number, nombreCarrera: string, idFacultad: number }): Observable<any> {
    return this.http.put(`${this.apiAcademicoUrl}/carreras/${carrera.idCarrera}`, carrera);
  }

  actualizarFacultad(facultad: { idFacultad: number, nombreFacultad: string }): Observable<any> {
    return this.http.put(`${this.apiAcademicoUrl}/facultades/${facultad.idFacultad}`, facultad);
  }

  actualizarIdioma(idioma: { idIdioma: number, nombreIdioma: string }): Observable<any> {
    return this.http.put(`${this.apiAcademicoUrl}/idiomas/${idioma.idIdioma}`, idioma);
  }

  actualizarJornada(jornada: { idJornada: number, nombreJornada: string }): Observable<any> {
    return this.http.put(`${this.apiAcademicoUrl}/jornadas/${jornada.idJornada}`, jornada);
  }

  actualizarModalidad(modalidad: { idModalidad: number, nombreModalidad: string }): Observable<any> {
    return this.http.put(`${this.apiAcademicoUrl}/modalidades/${modalidad.idModalidad}`, modalidad);
  }

  actualizarRol(rol: { idRol: number, nombreRol: string }): Observable<any> {
    return this.http.put(`${this.apiAcademicoUrl}/roles/${rol.idRol}`, rol);
  }

  // --- CARRERAS ---
// Agregar este método en tu admin.service.ts

  // Agregar este método en tu admin.service.ts

  getCarrerasCatalogo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiAcademicoUrl}/carreras/catalogo`);
  }

  //http://localhost:8080/api/academico/carreras/catalogo

  getCarrerasPorFacultad(idFacultad: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiAcademicoUrl}/carreras/facultad/${idFacultad}`);
  }

  //http://localhost:8080/api/academico/carreras/catalogo/carreras/facultad/${3}
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

  // Roles a Nivel de Aplicativo
  // Agregar estos 3 métodos en tu admin.service.ts

  getRolesCatalogo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiRolesAplicativo}/catalogo`);
  }

  agregarRol(rol: any): Observable<any> {
    return this.http.post<any>(`${this.apiRolesAplicativo}/agregar`, rol);
  }

  eliminarRol(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiRolesAplicativo}/eliminar/${id}`);
  }
  //http://localhost:8080/api/academico/roles/eliminar/5

  // ==========================================
  //      PROVINCIAS
  // ==========================================
  getProvinciasCatalogo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiAcademicoUrl}/provincias`);
  }

  agregarProvincia(provincia: { nombreProvincia: string }): Observable<any> {
    return this.http.post(`${this.apiAcademicoUrl}/aggProvincias`, provincia);
  }

  actualizarProvincia(provincia: { idProvincia: number, nombreProvincia: string }): Observable<any> {
    return this.http.put(`${this.apiAcademicoUrl}/provincias/${provincia.idProvincia}`, provincia);
  }

  eliminarProvincia(id: number): Observable<any> {
    return this.http.delete(`${this.apiAcademicoUrl}/provincias/${id}`);
  }

  // ==========================================
  //      CIUDADES
  // ==========================================
  getCiudadesCatalogo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiAcademicoUrl}/ciudades`);
  }

  getCiudadesPorProvincia(idProvincia: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiAcademicoUrl}/ciudades/provincia/${idProvincia}`);
  }

  agregarCiudad(ciudad: { nombreCiudad: string, idProvincia: number }): Observable<any> {
    return this.http.post(`${this.apiAcademicoUrl}/aggCiudades`, ciudad);
  }

  actualizarCiudad(ciudad: { idCiudad: number, nombreCiudad: string, idProvincia: number }): Observable<any> {
    return this.http.put(`${this.apiAcademicoUrl}/ciudades/${ciudad.idCiudad}`, ciudad);
  }

  eliminarCiudad(id: number): Observable<any> {
    return this.http.delete(`${this.apiAcademicoUrl}/ciudades/${id}`);
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
    return this.http.get(`${this.apiauditoriasUrl}/usuarios`);
  }

//http://localhost:8080/api/auditorias/usuarios
  getEstadisticasUsuarios(): Observable<any> {
    return this.http.get(`${this.apiauditoriasUrl}/estadisticas`);
  }

  //http://localhost:8080/api/auditorias/estadisticas


  getAuditoriasUsuario(idUsuario: number): Observable<any> {
    return this.http.get(`${this.apiauditoriasUrl}/usuario/${idUsuario}`);
  }
 // http://localhost:8080/api/auditorias/usuario/9


  exportarUsuariosExcel(usuarios: any[]): Observable<Blob> {
    return this.http.post(`${this.apiauditoriasUrl}/exportar-usuarios`,
      { usuarios },
      { responseType: 'blob' }
    );
  }


  exportarAuditoriasExcel(idUsuario: number): Observable<Blob> {
    return this.http.get(`${this.apiauditoriasUrl}/exportar-usuario/${idUsuario}`,
      { responseType: 'blob' }
    );
  }

  /*
  Nuevos metodos de audotpr
*/

  exportarAuditoriasPdf(idUsuario: number, tipo: string): Observable<Blob> {
    // Ajustamos la ruta para que coincida exactamente con el @GetMapping del backend
    return this.http.get(
      `${this.apiauditoriasUrl}/exportar-usuario/${idUsuario}/pdf/${tipo.toUpperCase()}`,
      { responseType: 'blob' }
    );
  }


// Exportar auditorías en Excel filtradas por tipo (INSERT | DELETE | UPDATE)
  exportarAuditoriasExcelPorTipo(idUsuario: number, tipo: string): Observable<Blob> {
    // Ajustamos la URL para que coincida con: /api/auditorias/exportar-usuario/{id}/excel/{tipo}
    return this.http.get(
      `${this.apiauditoriasUrl}/exportar-usuario/${idUsuario}/excel/${tipo.toUpperCase()}`,
      { responseType: 'blob' }
    );
  }

  // auditorias para sessiones
  // Obtener todas las sesiones
  getSesiones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiauditoriasUrl}/sesiones`);
  }

  //http://localhost:8080/api/auditorias/sesiones

// Exportar sesiones Excel
  exportarSesionesExcel(sesiones: any[]): Observable<Blob> {
    return this.http.get(`${this.apiauditoriasUrl}/auditorias/sesiones/exportar`,
      { responseType: 'blob' }
    );
  }

// ==============================================================
  // 🔥 NUEVO: BLOQUEAR/REACTIVAR CUENTA Y SESIÓN AL MISMO TIEMPO
  // ==============================================================
// CORRECCIÓN DE LA RUTA EN ANGULAR
  cambiarEstadoCuentaYSesion(idSesion: number, estadoCuenta: string) {
    return this.http.put(`${this.apiauditoriasUrl}/sesiones/${idSesion}/cerrar-forzado`, {});
  }

  // FUNCIONES PARA LOS ROLES DE BASE DE DATOS
  // ========== ROLES DE BASE DE DATOS ==========

  obtenerRolesBD(): Observable<any> {
    return this.http.get(`${this.apiRolesbd}/roles-bd`);
  }

  obtenerRolesBase(): Observable<any> {
    return this.http.get(`${this.apiRolesbd}/roles-base`);
  }

  obtenerEsquemasYTablas(): Observable<any> {
    return this.http.get(`${this.apiRolesbd}/esquemas`);
  }

  crearRolBD(datos: any): Observable<any> {
    return this.http.post(`${this.apiRolesbd}/roles-bd`, datos);
  }

  obtenerPermisosRol(idRol: string): Observable<any> {
    return this.http.get(`${this.apiRolesbd}/roles-bd/${idRol}/permisos`);
  }

  eliminarRolBD(idRol: string): Observable<any> {
    return this.http.delete(`${this.apiRolesbd}/roles-bd/${idRol}`);
  }

  // En tu admin.service.ts (o roles.service.ts)

  enlazarPermisosRol(idRolBd: string, idRolAplicativo: number, permisosUi: string) {
    const payload = {
      idRolBd: idRolBd,
      idRolAplicativo: idRolAplicativo,
      permisosUi: permisosUi
    };

    // Asegúrate de que la ruta coincida con tu apiUrl y el Controller de Spring Boot
    return this.http.put(`${this.apiAcademicoUrl}/roles/enlazar-permisos`, payload, { responseType: 'text' });
  }

  obtenerPermisosRolAplicativo(idRolBd: string): Observable<any> {
    return this.http.get(`${this.apiAcademicoUrl}/roles/permisos-enlazados/${idRolBd}`);
  }
 //http://localhost:8080/api/academico/roles/permisos-enlazados/Miniadmin

  //Nuevos metodos para roles de base datos
  actualizarRolBD(idRol: string, datos: any): Observable<any> {
    return this.http.put(`${this.apiRolesbd}/roles-bd/${idRol}`, datos);
  }

  obtenerUsuariosDelRol(idRol: string): Observable<any> {
    // Retorna lista de usuarios que tienen asignado este rol
    return this.http.get(`${this.apiRolesbd}/roles-bd/${idRol}/usuarios`);
  }

  // VALIDAR OFERTASSS
  obtenerOfertasPorEstado (estado: string  ): Observable<any []>
  {
    return this.http.get<any[]>(`${this.apiOfertasUrl}/estado/${estado}`);
  }

  validarOfertas (idOferta: number, estado: string): Observable<any>{
    return this.http.put(
      `${this.apiOfertasUrl}/${idOferta}/validar?estado=${estado}`,
      {},
      { responseType: 'text' }
    )
  }

  contarPostulantesPorOfertas(ids: number[]): Observable<{[key: number]: number}> {
    return this.http.post<{[key: number]: number}>(`${this.apiOfertasUrl}/conteo-postulantes`, ids);
  }
  registrarOfertaFisica(idUsuarioAdmin: number, oferta: any, archivo: File): Observable<any> {
    const formData = new FormData();

    formData.append('idUsuarioAdmin', idUsuarioAdmin.toString());
    formData.append('idEmpresa', oferta.idEmpresa.toString());
    formData.append('titulo', oferta.titulo);
    formData.append('descripcion', oferta.descripcion);
    formData.append('fechaCierre', oferta.fechaCierre);

    formData.append('archivoOficio', archivo);

    return this.http.post(`${this.apiOfertasUrl}/registrar-fisica`, formData);
  }

  // ==========================================
  // 🔄 NOTIFICAR CAMBIOS EN LA LISTA
  // ==========================================
  notificarCambio(): void {
    this.adminsActualizados$.next(true);
  }

  getOfertasParaAuditoria(): Observable<any[]> {
    // Como la variable ya tiene toda la ruta, solo la llamamos directo
    return this.http.get<any[]>(`${this.apiHistorialOferta}`);
  }

  getHistorialByOferta(idOferta: number): Observable<any[]> {
    // Aquí solo le concatenamos el ID y la palabra historial
    return this.http.get<any[]>(`${this.apiHistorialOferta}/${idOferta}/historial`);
  }


  getPostulantesAuditoria(): Observable<any[]> {
    return this.http.get<any[]>(this.apiPostulanteAudi);
  }

  getHistorialByPerfil(idPerfilAcademico: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiPostulanteAudi}/${idPerfilAcademico}/historial`);
  }

  descargarReportePdf(idParametro: number, tipo: string): Observable<Blob> {
    const url = `http://localhost:8080/api/auditorias/exportar/pdf/${idParametro}?tipo=${tipo}`;
    return this.http.get(url, { responseType: 'blob' });
  }

}
