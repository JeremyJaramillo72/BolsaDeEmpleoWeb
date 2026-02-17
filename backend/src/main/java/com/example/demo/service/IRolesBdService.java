package com.example.demo.service;

import java.util.List;
import java.util.Map;

public interface IRolesBdService {
    // CAMBIO: De List<String> a List<Map<String, Object>> para enviar idRol y nombreRol
    List<Map<String, Object>> listarRolesPersonalizados();
    // CAMBIO: De List<String> a List<Map<String, Object>> para que Angular mapee idRol y nombreRol
    List<Map<String, Object>> listarRolesBase();
    List<Map<String, Object>> obtenerEstructuraEsquemas();
    void crearYAsignarPermisos(Map<String, Object> datos);
    Map<String, Object> consultarPermisosDeRol(String roleName);
    void eliminarRol(String roleName);
}