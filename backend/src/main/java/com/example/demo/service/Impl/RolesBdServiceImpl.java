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

    // ✅ Inyectar el JdbcTemplate del superusuario
    @Autowired
    @Qualifier("adminJdbcTemplate")
    private JdbcTemplate adminJdbcTemplate;

    // ==============================================================================
    // LECTURA DE DATOS (LISTADOS Y ESTRUCTURAS)
    // ==============================================================================

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

    // ==============================================================================
    // CREACIÓN Y ACTUALIZACIÓN (CORE LOGIC)
    // ==============================================================================

    @Override
    @Transactional
    public void crearYAsignarPermisos(Map<String, Object> datos) {
        String currentUser = adminJdbcTemplate.queryForObject("SELECT CURRENT_USER", String.class);
        System.out.println("🔑 adminJdbcTemplate CURRENT_USER: " + currentUser);

        String roleName = (String) datos.get("nombreRol");
        System.out.println("🚀 Iniciando creación del rol: " + roleName);

        // 1. Crear Rol desde cero
        try {
            adminJdbcTemplate.execute("CREATE ROLE \"" + roleName + "\"");
            System.out.println("✅ CREATE ROLE OK: " + roleName);
        } catch (Exception e) {
            System.out.println("❌ CREATE ROLE FALLÓ: " + e.getMessage());
            throw new RuntimeException("Error al crear el rol en PostgreSQL", e);
        }

        // 2. Aplicar todos los permisos y usuarios
        aplicarNuevosPermisos(roleName, datos);
    }

    @Override
    @Transactional
    public void actualizarYAsignarPermisos(String idRolViejo, Map<String, Object> datos) {
        System.out.println("🔄 Iniciando actualización del rol: " + idRolViejo);
        String roleNameNuevo = (String) datos.get("nombreRol");

        // 1. Si el nombre cambió, lo renombramos en la BD
        if (!idRolViejo.equals(roleNameNuevo)) {
            try {
                adminJdbcTemplate.execute("ALTER ROLE \"" + idRolViejo + "\" RENAME TO \"" + roleNameNuevo + "\"");
                System.out.println("✅ Rol renombrado a: " + roleNameNuevo);
            } catch (Exception e) {
                System.out.println("❌ Error renombrando rol: " + e.getMessage());
                throw new RuntimeException("No se pudo renombrar el rol", e);
            }
        }

        // 2. Limpieza total (Revocamos TODO para dejarlo en blanco)
        limpiarPermisosEsquemas(roleNameNuevo);
        quitarUsuariosDelRol(roleNameNuevo);

        // 3. Aplicamos los nuevos permisos fresquitos
        aplicarNuevosPermisos(roleNameNuevo, datos);

        System.out.println("✅ Rol " + roleNameNuevo + " actualizado con éxito.");
    }

    // ==============================================================================
    // EL MOTOR DE ASIGNACIÓN
    // ==============================================================================

    @SuppressWarnings("unchecked")
    private void aplicarNuevosPermisos(String roleName, Map<String, Object> datos) {
        Object rolBaseObj = datos.get("rolBaseId");
        String baseRole = rolBaseObj != null ? rolBaseObj.toString() : null;

        Map<String, Object> permisosRoot = (Map<String, Object>) datos.get("permisos");
        List<Map<String, Object>> esquemas = (List<Map<String, Object>>) permisosRoot.get("esquemas");

        // A. Heredar del rol base (si existe)
        if (baseRole != null && !baseRole.trim().isEmpty() && !baseRole.equals("null")) {
            try {
                adminJdbcTemplate.execute("GRANT \"" + baseRole + "\" TO \"" + roleName + "\"");
                System.out.println("✅ GRANT rol base OK: " + baseRole + " → " + roleName);
            } catch (Exception e) {
                System.out.println("❌ GRANT rol base FALLÓ: " + e.getMessage());
            }
        }

        // B. Procesar Esquemas, Tablas y SECUENCIAS
        if (esquemas != null) {
            for (Map<String, Object> esquema : esquemas) {
                String schemaName = (String) esquema.get("nombre");
                boolean esGlobal = (boolean) esquema.get("global");
                System.out.println("🔍 Procesando schema: " + schemaName + " | global: " + esGlobal);

                try {
                    // Permiso básico para usar el esquema y ejecutar funciones
                    adminJdbcTemplate.execute("GRANT USAGE ON SCHEMA " + schemaName + " TO \"" + roleName + "\"");
                    adminJdbcTemplate.execute("GRANT EXECUTE ON ALL ROUTINES IN SCHEMA " + schemaName + " TO \"" + roleName + "\"");

                    // 👉 FIX SECUENCIAS: Damos permiso a todas las secuencias del esquema para evitar fallos de INSERT
                    adminJdbcTemplate.execute("GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA " + schemaName + " TO \"" + roleName + "\"");
                    System.out.println("✅ GRANT USAGE, ROUTINES y SEQUENCES OK en: " + schemaName);
                } catch (Exception e) {
                    System.out.println("❌ Error dando permisos base en " + schemaName + ": " + e.getMessage());
                }

                if (esGlobal) {
                    try {
                        adminJdbcTemplate.execute("GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA " + schemaName + " TO \"" + roleName + "\"");
                        System.out.println("✅ GRANT GLOBAL TABLAS OK: " + schemaName);
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

        // C. Asignar el rol a los usuarios seleccionados
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

    // ==============================================================================
    // FUNCIONES AUXILIARES DE LIMPIEZA Y ELIMINACIÓN
    // ==============================================================================

    private void limpiarPermisosEsquemas(String roleName) {
        System.out.println("🧹 Limpiando permisos actuales del rol: " + roleName);
        try {
            // Obtenemos todos los esquemas relevantes
            List<String> esquemas = adminJdbcTemplate.queryForList(
                    "SELECT nspname FROM pg_namespace WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema'",
                    String.class
            );

            for (String esquema : esquemas) {
                try {
                    adminJdbcTemplate.execute("REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA " + esquema + " FROM \"" + roleName + "\"");
                    adminJdbcTemplate.execute("REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA " + esquema + " FROM \"" + roleName + "\"");
                    adminJdbcTemplate.execute("REVOKE ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA " + esquema + " FROM \"" + roleName + "\"");
                    adminJdbcTemplate.execute("REVOKE USAGE ON SCHEMA " + esquema + " FROM \"" + roleName + "\"");
                } catch (Exception e) {
                    // Ignorado: Puede fallar si no tenía permisos previos
                }
            }
            System.out.println("✅ Limpieza de permisos de esquemas completada.");
        } catch (Exception e) {
            System.out.println("⚠️ Error listando esquemas para limpiar: " + e.getMessage());
        }
    }

    private void quitarUsuariosDelRol(String roleName) {
        System.out.println("🧹 Quitando usuarios actuales del rol: " + roleName);
        try {
            List<String> usuariosActuales = adminJdbcTemplate.queryForList(
                    "SELECT u.rolname FROM pg_auth_members m JOIN pg_roles u ON m.member = u.oid JOIN pg_roles r ON m.roleid = r.oid WHERE r.rolname = ?",
                    String.class, roleName
            );

            for (String user : usuariosActuales) {
                try {
                    adminJdbcTemplate.execute("REVOKE \"" + roleName + "\" FROM \"" + user + "\"");
                    System.out.println("✅ Rol revocado del usuario: " + user);
                } catch (Exception ex) {
                    System.out.println("⚠️ No se pudo revocar rol de " + user + ": " + ex.getMessage());
                }
            }
        } catch (Exception e) {
            System.out.println("⚠️ Error buscando usuarios para quitar: " + e.getMessage());
        }
    }

    @Override
    public void eliminarRol(String roleName) {
        System.out.println("🗑️ Intentando eliminar rol (Hard Delete): " + roleName);
        try {
            String schemas = "catalogos, empresas, ofertas, postulaciones, seguridad, usuarios";

            // 👉 Añado limpieza de secuencias aquí también para evitar error 2BP01
            adminJdbcTemplate.execute("REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA " + schemas + " FROM \"" + roleName + "\"");
            adminJdbcTemplate.execute("REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA " + schemas + " FROM \"" + roleName + "\"");
            adminJdbcTemplate.execute("REVOKE ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA " + schemas + " FROM \"" + roleName + "\"");
            adminJdbcTemplate.execute("REVOKE USAGE ON SCHEMA " + schemas + " FROM \"" + roleName + "\"");

            adminJdbcTemplate.execute("DROP ROLE IF EXISTS \"" + roleName + "\"");
            System.out.println("✅ Rol " + roleName + " eliminado limpiamente de la BD.");
        } catch (Exception e) {
            throw new RuntimeException("Error crítico al eliminar el rol en PostgreSQL: " + e.getMessage(), e);
        }
    }

    // ==============================================================================
    // CONSULTAS DE PERMISOS Y USUARIOS ASIGNADOS
    // ==============================================================================

    @Override
    public Map<String, Object> consultarPermisosDeRol(String roleName) {
        System.out.println("🔍 Consultando permisos reales en BD para el rol: " + roleName);

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("nombreRol", roleName);

        String sqlTablas = "SELECT table_schema, table_name, privilege_type " +
                "FROM information_schema.role_table_grants " +
                "WHERE grantee = ?";

        List<Map<String, Object>> grants = jdbcTemplate.queryForList(sqlTablas, roleName);

        Map<String, Map<String, List<String>>> schemasMap = new HashMap<>();

        for (Map<String, Object> grant : grants) {
            String schema = (String) grant.get("table_schema");
            String table = (String) grant.get("table_name");
            String privilege = (String) grant.get("privilege_type");

            schemasMap.putIfAbsent(schema, new HashMap<>());
            schemasMap.get(schema).putIfAbsent(table, new ArrayList<>());
            schemasMap.get(schema).get(table).add(privilege);
        }

        List<Map<String, Object>> esquemasList = new ArrayList<>();

        for (Map.Entry<String, Map<String, List<String>>> schemaEntry : schemasMap.entrySet()) {
            Map<String, Object> esquemaMap = new HashMap<>();
            esquemaMap.put("nombre", schemaEntry.getKey());
            esquemaMap.put("usage", true);
            esquemaMap.put("global", false);

            List<Map<String, Object>> tablasList = new ArrayList<>();
            for (Map.Entry<String, List<String>> tableEntry : schemaEntry.getValue().entrySet()) {
                Map<String, Object> tablaMap = new HashMap<>();
                tablaMap.put("nombre", tableEntry.getKey());
                tablaMap.put("permisos", tableEntry.getValue());
                tablasList.add(tablaMap);
            }

            esquemaMap.put("tablas", tablasList);
            esquemasList.add(esquemaMap);
        }

        Map<String, Object> permisosRoot = new HashMap<>();
        permisosRoot.put("esquemas", esquemasList);

        resultado.put("permisos", permisosRoot);

        return resultado;
    }

    @Override
    public List<Map<String, Object>> consultarUsuariosDeRol(String roleName) {
        System.out.println("🔍 Consultando usuarios asignados al rol: " + roleName);

        String sql = "SELECT s.id_usuario as \"idUsuario\", s.login_name as \"loginName\" " +
                "FROM pg_catalog.pg_auth_members am " +
                "JOIN pg_catalog.pg_roles r_group ON r_group.oid = am.roleid " +
                "JOIN pg_catalog.pg_roles r_member ON r_member.oid = am.member " +
                "JOIN seguridad.seguridad s ON s.login_name = r_member.rolname " +
                "WHERE r_group.rolname = ?";

        try {
            return jdbcTemplate.queryForList(sql, roleName);
        } catch (Exception e) {
            System.err.println("❌ Error consultando usuarios del rol " + roleName + ": " + e.getMessage());
            return new ArrayList<>();
        }
    }
}