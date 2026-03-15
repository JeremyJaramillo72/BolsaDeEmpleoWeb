package com.example.demo.service.Impl;

import com.example.demo.service.IRolesBdService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class RolesBdServiceImpl implements IRolesBdService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // ✅ NUEVO: inyectar el JdbcTemplate del superusuario
    @Autowired
    @Qualifier("adminJdbcTemplate")
    private JdbcTemplate adminJdbcTemplate;
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

    // Asegúrate de tener importado: import org.springframework.transaction.annotation.Transactional;

    @Override
    @Transactional // ¡VITAL! Si falla la creación, se cancela la eliminación automática
    public void actualizarYAsignarPermisos(String idRolViejo, Map<String, Object> datos) {
        System.out.println("🔄 Iniciando actualización del rol: " + idRolViejo);

        // 1. Eliminamos el rol viejo y todas sus dependencias (limpiamos el terreno)
        // Esto quita todos los usuarios asignados y revoca todos los permisos actuales
        eliminarRol(idRolViejo);

        // 2. Lo creamos nuevamente con los datos, usuarios y permisos fresquitos
        crearYAsignarPermisos(datos);

        System.out.println("✅ Rol " + idRolViejo + " actualizado con éxito.");
    }

    @Override
    public void crearYAsignarPermisos(Map<String, Object> datos) {
        String currentUser = adminJdbcTemplate.queryForObject("SELECT CURRENT_USER", String.class);
        System.out.println("🔑 adminJdbcTemplate CURRENT_USER: " + currentUser);
         String roleName = (String) datos.get("nombreRol");

        Object rolBaseObj = datos.get("rolBaseId");
        String baseRole = rolBaseObj != null ? rolBaseObj.toString() : null;

        Map<String, Object> permisosRoot = (Map<String, Object>) datos.get("permisos");
        List<Map<String, Object>> esquemas = (List<Map<String, Object>>) permisosRoot.get("esquemas");

        // 1. Crear Rol
        try {
            adminJdbcTemplate.execute("CREATE ROLE \"" + roleName + "\"");
            System.out.println("✅ CREATE ROLE OK: " + roleName);
        } catch (Exception e) {
            System.out.println("❌ CREATE ROLE FALLÓ: " + e.getMessage());
            throw e;
        }

        // 2. Heredar del rol base
        if (baseRole != null && !baseRole.isEmpty() && !baseRole.equals("null")) {
            try {
                adminJdbcTemplate.execute("GRANT \"" + baseRole + "\" TO \"" + roleName + "\"");
                System.out.println("✅ GRANT rol base OK: " + baseRole + " → " + roleName);
            } catch (Exception e) {
                System.out.println("❌ GRANT rol base FALLÓ: " + e.getMessage());
            }
        }

        // 3. Procesar Esquemas y Tablas
        System.out.println("📋 Esquemas recibidos: " + (esquemas != null ? esquemas.size() : "NULL"));
        if (esquemas != null) {
            for (Map<String, Object> esquema : esquemas) {
                String schemaName = (String) esquema.get("nombre");
                boolean esGlobal = (boolean) esquema.get("global");
                System.out.println("🔍 Procesando schema: " + schemaName + " | global: " + esGlobal);

                try {
                    adminJdbcTemplate.execute("GRANT USAGE ON SCHEMA " + schemaName + " TO \"" + roleName + "\"");
                    System.out.println("✅ GRANT USAGE OK: " + schemaName);
                } catch (Exception e) {
                    System.out.println("❌ GRANT USAGE FALLÓ en " + schemaName + ": " + e.getMessage());
                }

                try {
                    adminJdbcTemplate.execute("GRANT EXECUTE ON ALL ROUTINES IN SCHEMA " + schemaName + " TO \"" + roleName + "\"");
                    System.out.println("✅ GRANT EXECUTE OK: " + schemaName);
                } catch (Exception e) {
                    System.out.println("❌ GRANT EXECUTE FALLÓ en " + schemaName + ": " + e.getMessage());
                }

                if (esGlobal) {
                    try {
                        adminJdbcTemplate.execute("GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA " + schemaName + " TO \"" + roleName + "\"");
                        System.out.println("✅ GRANT GLOBAL OK: " + schemaName);
                    } catch (Exception e) {
                        System.out.println("❌ GRANT GLOBAL FALLÓ en " + schemaName + ": " + e.getMessage());
                    }
                } else {
                    List<Map<String, Object>> tablas = (List<Map<String, Object>>) esquema.get("tablas");
                    if (tablas != null) {
                        for (Map<String, Object> tabla : tablas) {
                            String tableName = (String) tabla.get("nombre");
                            List<String> privileges = (List<String>) tabla.get("permisos");
                            if (privileges != null && !privileges.isEmpty()) {
                                String privs = String.join(", ", privileges);
                                try {
                                    adminJdbcTemplate.execute("GRANT " + privs + " ON TABLE " + schemaName + "." + tableName + " TO \"" + roleName + "\"");
                                    System.out.println("✅ GRANT TABLA OK: " + schemaName + "." + tableName + " → " + privs);
                                } catch (Exception e) {
                                    System.out.println("❌ GRANT TABLA FALLÓ: " + schemaName + "." + tableName + ": " + e.getMessage());
                                }
                            }
                        }
                    }
                }
            }
        }

        // 4. Asignar usuarios
        List<Integer> usuariosIds = (List<Integer>) datos.get("usuariosIds");
        System.out.println("👥 Usuarios a asignar: " + (usuariosIds != null ? usuariosIds.size() : "NULL"));
        if (usuariosIds != null && !usuariosIds.isEmpty()) {
            for (Integer usuarioId : usuariosIds) {
                try {
                    String loginName = jdbcTemplate.queryForObject(
                            "SELECT login_name FROM seguridad.seguridad WHERE id_usuario = ?",
                            String.class,
                            usuarioId
                    );
                    if (loginName != null) {
                        adminJdbcTemplate.execute("GRANT \"" + roleName + "\" TO \"" + loginName + "\"");
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
        System.out.println("🗑️ Intentando eliminar rol: " + roleName);
        try {
            // 1. Revocar permisos sobre tablas
            adminJdbcTemplate.execute("REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA " +
                    "catalogos, empresas, ofertas, postulaciones, seguridad, usuarios " +
                    "FROM \"" + roleName + "\"");

            // 2. Revocar permisos sobre funciones/procedimientos
            adminJdbcTemplate.execute("REVOKE ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA " +
                    "catalogos, empresas, ofertas, postulaciones, seguridad, usuarios " +
                    "FROM \"" + roleName + "\"");

            // 3. Revocar USAGE en schemas
            adminJdbcTemplate.execute("REVOKE USAGE ON SCHEMA " +
                    "catalogos, empresas, ofertas, postulaciones, seguridad, usuarios " +
                    "FROM \"" + roleName + "\"");

            // 4. Eliminar el rol
            adminJdbcTemplate.execute("DROP ROLE IF EXISTS \"" + roleName + "\"");

            System.out.println("✅ Rol " + roleName + " eliminado limpiamente de la BD.");
        } catch (Exception e) {
            throw new RuntimeException("Error crítico al limpiar el rol en PostgreSQL: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> consultarPermisosDeRol(String roleName) {
        System.out.println("🔍 Consultando permisos reales en BD para el rol: " + roleName);

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("nombreRol", roleName);

        // 1. Consultamos los privilegios reales en PostgreSQL para este rol
        String sqlTablas = "SELECT table_schema, table_name, privilege_type " +
                "FROM information_schema.role_table_grants " +
                "WHERE grantee = ?";

        List<Map<String, Object>> grants = jdbcTemplate.queryForList(sqlTablas, roleName);

        // 2. Agrupamos la data: Esquema -> Tabla -> Lista de Permisos (SELECT, INSERT, etc.)
        Map<String, Map<String, List<String>>> schemasMap = new HashMap<>();

        for (Map<String, Object> grant : grants) {
            String schema = (String) grant.get("table_schema");
            String table = (String) grant.get("table_name");
            String privilege = (String) grant.get("privilege_type");

            schemasMap.putIfAbsent(schema, new HashMap<>());
            schemasMap.get(schema).putIfAbsent(table, new ArrayList<>());
            schemasMap.get(schema).get(table).add(privilege);
        }

        // 3. Formateamos todo exactamente como lo espera tu frontend en Angular
        List<Map<String, Object>> esquemasList = new ArrayList<>();

        for (Map.Entry<String, Map<String, List<String>>> schemaEntry : schemasMap.entrySet()) {
            Map<String, Object> esquemaMap = new HashMap<>();
            esquemaMap.put("nombre", schemaEntry.getKey());
            esquemaMap.put("usage", true); // Si tiene permisos en tablas, lógicamente tiene usage
            esquemaMap.put("global", false);

            List<Map<String, Object>> tablasList = new ArrayList<>();
            for (Map.Entry<String, List<String>> tableEntry : schemaEntry.getValue().entrySet()) {
                Map<String, Object> tablaMap = new HashMap<>();
                tablaMap.put("nombre", tableEntry.getKey());
                tablaMap.put("permisos", tableEntry.getValue()); // Ej: ["SELECT", "INSERT"]
                tablasList.add(tablaMap);
            }

            esquemaMap.put("tablas", tablasList);
            esquemasList.add(esquemaMap);
        }

        Map<String, Object> permisosRoot = new HashMap<>();
        permisosRoot.put("esquemas", esquemasList);

        // Empaquetamos todo bajo la llave "permisos"
        resultado.put("permisos", permisosRoot);

        return resultado;
    }

    @Override
    public List<Map<String, Object>> consultarUsuariosDeRol(String roleName) {
        System.out.println("🔍 Consultando usuarios asignados al rol: " + roleName);

        // Consulta nativa a los catálogos de PostgreSQL cruzada con tu tabla de seguridad
        String sql = "SELECT s.id_usuario as \"idUsuario\", s.login_name as \"loginName\" " +
                "FROM pg_catalog.pg_auth_members am " +
                "JOIN pg_catalog.pg_roles r_group ON r_group.oid = am.roleid " +
                "JOIN pg_catalog.pg_roles r_member ON r_member.oid = am.member " +
                "JOIN seguridad.seguridad s ON s.login_name = r_member.rolname " +
                "WHERE r_group.rolname = ?";

        try {
            // Pasamos roleName como parámetro seguro (?) para evitar inyección SQL
            return jdbcTemplate.queryForList(sql, roleName);
        } catch (Exception e) {
            System.err.println("❌ Error consultando usuarios del rol " + roleName + ": " + e.getMessage());
            // Si falla, retornamos una lista vacía para no romper el Front
            return new ArrayList<>();
        }
    }
}