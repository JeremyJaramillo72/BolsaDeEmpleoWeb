package com.example.demo.service.Impl;

import com.example.demo.service.IRolesBdService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class RolesBdServiceImpl implements IRolesBdService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public List<Map<String, Object>> listarRolesPersonalizados() {
        // Obtenemos los roles que pueden loguearse y que no son los predefinidos
        String sql = "SELECT rolname as \"nombreRol\", " +
                "rolname as \"idRol\", " +
                "CURRENT_DATE as \"fechaCreacion\" " +
                "FROM pg_roles " +
                "WHERE rolcanlogin = true " +
                "AND rolname NOT IN ('postgres', 'grupo_administrador', 'grupo_empresa', 'grupo_postulante', 'grupo_gerente', 'grupo_supervisor')";

        return jdbcTemplate.queryForList(sql);
    }

    @Override
    public List<Map<String, Object>> listarRolesBase() {
        // Convertimos la lista de strings en objetos que Angular reconozca
        List<String> bases = List.of("grupo_administrador", "grupo_gerente", "grupo_supervisor", "grupo_empresa", "grupo_postulante");
        List<Map<String, Object>> resultado = new ArrayList<>();

        for (String rol : bases) {
            Map<String, Object> map = new HashMap<>();
            map.put("idRol", rol);
            map.put("nombreRol", rol);
            map.put("descripcion", "Permisos base de " + rol.replace("grupo_", ""));
            resultado.add(map);
        }
        return resultado;
    }

    @Override
    public List<Map<String, Object>> obtenerEstructuraEsquemas() {
        String sql = "SELECT table_schema as esquema, table_name as tabla " +
                "FROM information_schema.tables " +
                "WHERE table_schema IN ('seguridad', 'usuarios', 'empresas', 'ofertas', 'postulaciones', 'catalogos') " +
                "AND table_type = 'BASE TABLE' " +
                "ORDER BY table_schema, table_name";

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);

        // Agrupamos dinámicamente: esquema -> lista de tablas
        Map<String, List<String>> agrupado = new LinkedHashMap<>();
        for (Map<String, Object> row : rows) {
            String esquema = (String) row.get("esquema");
            String tabla = (String) row.get("tabla");
            agrupado.computeIfAbsent(esquema, k -> new ArrayList<>()).add(tabla);
        }

        // Construimos el JSON jerárquico para el Front
        List<Map<String, Object>> resultadoFinal = new ArrayList<>();
        for (Map.Entry<String, List<String>> entry : agrupado.entrySet()) {
            Map<String, Object> esquemaMap = new HashMap<>();
            esquemaMap.put("nombreEsquema", entry.getKey());
            esquemaMap.put("tablas", entry.getValue());
            resultadoFinal.add(esquemaMap);
        }

        return resultadoFinal;
    }

    @Override
    @Transactional
    public void crearYAsignarPermisos(Map<String, Object> datos) {
        // Extraemos los datos del JSON enviado por Angular
        String roleName = (String) datos.get("nombreRol"); // Coincide con nuevoRol.nombre
        String password = "clave_temporal_123";

        // El rol base viene como ID (String nombre del rol)
        Object rolBaseObj = datos.get("rolBaseId");
        String baseRole = rolBaseObj != null ? rolBaseObj.toString() : null;

        // Extraemos la estructura de permisos
        Map<String, Object> permisosRoot = (Map<String, Object>) datos.get("permisos");
        List<Map<String, Object>> esquemas = (List<Map<String, Object>>) permisosRoot.get("esquemas");

        // 1. Crear el Rol en Postgres
        jdbcTemplate.execute("CREATE ROLE \"" + roleName + "\" WITH LOGIN PASSWORD '" + password + "'");

        // 2. Heredar del rol base si se seleccionó uno
        if (baseRole != null && !baseRole.isEmpty() && !baseRole.equals("null")) {
            jdbcTemplate.execute("GRANT \"" + baseRole + "\" TO \"" + roleName + "\"");
        }

        // 3. Procesar Esquemas y Tablas
        if (esquemas != null) {
            for (Map<String, Object> esquema : esquemas) {
                String schemaName = (String) esquema.get("nombre");

                // GRANT USAGE para poder entrar al esquema
                jdbcTemplate.execute("GRANT USAGE ON SCHEMA " + schemaName + " TO \"" + roleName + "\"");

                boolean esGlobal = (boolean) esquema.get("global");

                if (esGlobal) {
                    // Si es global, damos permisos de lectura/escritura a todo el esquema
                    jdbcTemplate.execute("GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA " + schemaName + " TO \"" + roleName + "\"");
                } else {
                    // Si no, iteramos tablas específicas
                    List<Map<String, Object>> tablas = (List<Map<String, Object>>) esquema.get("tablas");
                    if (tablas != null) {
                        for (Map<String, Object> tabla : tablas) {
                            String tableName = (String) tabla.get("nombre");
                            List<String> privileges = (List<String>) tabla.get("permisos");

                            if (privileges != null && !privileges.isEmpty()) {
                                String privs = String.join(", ", privileges);
                                jdbcTemplate.execute("GRANT " + privs + " ON TABLE " + schemaName + "." + tableName + " TO \"" + roleName + "\"");
                            }
                        }
                    }
                }
            }
        }
    }

    @Override
    public void eliminarRol(String roleName) {
        // REASSIGN es vital para evitar errores de dependencias al borrar roles
        jdbcTemplate.execute("REASSIGN OWNED BY \"" + roleName + "\" TO postgres");
        jdbcTemplate.execute("DROP OWNED BY \"" + roleName + "\"");
        jdbcTemplate.execute("DROP ROLE \"" + roleName + "\"");
    }

    @Override
    public Map<String, Object> consultarPermisosDeRol(String roleName) {
        // Retornamos un mapa informativo por ahora
        return Map.of(
                "role", roleName,
                "mensaje", "Permisos cargados correctamente",
                "fechaConsulta", new Date().toString()
        );
    }
}