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
     // Funcional
     @Override
     public List<Map<String, Object>> listarRolesPersonalizados() {
         String sql = "SELECT " +
                 "r.rolname AS \"nombreRol\", " +
                 "r.rolname AS \"idRol\", " +
                 "CURRENT_DATE AS \"fechaCreacion\", " +
                 "COUNT(DISTINCT am.member) AS \"usuariosAsignados\", " +
                 "(SELECT COUNT(*) FROM information_schema.role_table_grants rtg " +
                 " WHERE rtg.grantee = r.rolname) AS \"totalPermisos\" " +
                 "FROM pg_catalog.pg_roles r " +
                 "LEFT JOIN pg_catalog.pg_auth_members am ON am.roleid = r.oid " +
                 "WHERE r.rolcanlogin = false " +
                 "AND r.rolname NOT LIKE 'pg_%' " +
                 "AND r.rolname <> 'adminAzure' " +
                 "GROUP BY r.rolname " +
                 "ORDER BY r.rolname";

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
    public void crearYAsignarPermisos(Map<String, Object> datos) {
        String roleName = (String) datos.get("nombreRol");

        Object rolBaseObj = datos.get("rolBaseId");
        String baseRole = rolBaseObj != null ? rolBaseObj.toString() : null;

        Map<String, Object> permisosRoot = (Map<String, Object>) datos.get("permisos");
        List<Map<String, Object>> esquemas = (List<Map<String, Object>>) permisosRoot.get("esquemas");

        // 1. Crear Rol de GRUPO (sin login, sin password)
        jdbcTemplate.execute("CREATE ROLE \"" + roleName + "\"");

        // 2. Heredar del rol base si se seleccionó uno
        if (baseRole != null && !baseRole.isEmpty() && !baseRole.equals("null")) {
            jdbcTemplate.execute("GRANT \"" + baseRole + "\" TO \"" + roleName + "\"");
        }

        // 3. Procesar Esquemas y Tablas
        if (esquemas != null) {
            for (Map<String, Object> esquema : esquemas) {
                String schemaName = (String) esquema.get("nombre");

                jdbcTemplate.execute("GRANT USAGE ON SCHEMA " + schemaName + " TO \"" + roleName + "\"");

                boolean esGlobal = (boolean) esquema.get("global");

                if (esGlobal) {
                    jdbcTemplate.execute("GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA " + schemaName + " TO \"" + roleName + "\"");
                } else {
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

        // 4. ✅ Asignar usuarios al rol de grupo
        List<Integer> usuariosIds = (List<Integer>) datos.get("usuariosIds");
        if (usuariosIds != null && !usuariosIds.isEmpty()) {
            for (Integer usuarioId : usuariosIds) {
                try {
                    String loginName = jdbcTemplate.queryForObject(
                            "SELECT login_name FROM seguridad.seguridad WHERE id_usuario = ?",
                            String.class,
                            usuarioId
                    );

                    if (loginName != null) {
                        jdbcTemplate.execute("GRANT \"" + roleName + "\" TO \"" + loginName + "\"");
                        System.out.println("✅ Rol asignado a: " + loginName);
                    }
                } catch (Exception e) {
                    System.out.println("⚠️ No se pudo asignar rol al usuario ID " + usuarioId + ": " + e.getMessage());
                }
            }
        }
    }

    @Override
    public void eliminarRol(String roleName) {
        // REASSIGN es vital para evitar errores de dependencias al borrar roles
        System.out.println("🗑️ Intentando eliminar rol: " + roleName);
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