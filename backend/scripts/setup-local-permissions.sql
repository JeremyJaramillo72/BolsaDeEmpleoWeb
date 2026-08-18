-- Permisos locales para Empleos (post-restore con --no-acl)
-- Ejecutar como postgres en base Empleos

-- =============================================================================
-- 1. Grupos base
-- =============================================================================
DO $$
DECLARE g TEXT;
BEGIN
  FOREACH g IN ARRAY ARRAY[
    'grupo_administrador', 'grupo_empresa', 'grupo_gerente',
    'grupo_supervisor', 'grupo_postulante'
  ] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = g) THEN
      EXECUTE format('CREATE ROLE %I NOLOGIN', g);
    END IF;
  END LOOP;
END $$;

-- =============================================================================
-- 2. Permisos completos a cada grupo (esquemas de la app)
-- =============================================================================
DO $$
DECLARE s text;
BEGIN
  FOREACH s IN ARRAY ARRAY[
    'catalogos', 'empresas', 'ofertas', 'postulaciones', 'seguridad', 'usuarios', 'public'
  ] LOOP
    EXECUTE format('GRANT USAGE ON SCHEMA %I TO grupo_administrador, grupo_gerente, grupo_supervisor, grupo_empresa, grupo_postulante', s);
    EXECUTE format('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA %I TO grupo_administrador', s);
    EXECUTE format('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA %I TO grupo_administrador', s);
    EXECUTE format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA %I TO grupo_administrador, grupo_gerente, grupo_supervisor, grupo_empresa, grupo_postulante', s);
    EXECUTE format('GRANT EXECUTE ON ALL PROCEDURES IN SCHEMA %I TO grupo_administrador, grupo_gerente, grupo_supervisor, grupo_empresa, grupo_postulante', s);
    -- Empresa y postulante: tablas (lectura/escritura según necesidad)
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA %I TO grupo_empresa, grupo_postulante', s);
    EXECUTE format('GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA %I TO grupo_empresa, grupo_postulante', s);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA %I TO grupo_gerente, grupo_supervisor', s);
    EXECUTE format('GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA %I TO grupo_gerente, grupo_supervisor', s);
  END LOOP;
END $$;

-- Default privileges para objetos futuros (desarrollo local)
ALTER DEFAULT PRIVILEGES IN SCHEMA catalogos, empresas, ofertas, postulaciones, seguridad, usuarios
  GRANT ALL ON TABLES TO grupo_administrador;
ALTER DEFAULT PRIVILEGES IN SCHEMA catalogos, empresas, ofertas, postulaciones, seguridad, usuarios
  GRANT EXECUTE ON FUNCTIONS TO grupo_administrador, grupo_empresa, grupo_postulante, grupo_gerente, grupo_supervisor;

-- =============================================================================
-- 3. Roles de login desde seguridad.seguridad + contraseña por clave_name
-- =============================================================================
DO $$
DECLARE
  rec RECORD;
  pwd TEXT;
BEGIN
  FOR rec IN
    SELECT DISTINCT s.login_name, s.clave_name, r.nombre_rol
    FROM seguridad.seguridad s
    JOIN usuarios.usuario u ON u.id_usuario = s.id_usuario
    JOIN usuarios.roles r ON r.id_rol = u.id_rol
    WHERE s.login_name IS NOT NULL
      AND TRIM(s.login_name) <> ''
      AND s.login_name <> '.'
  LOOP
    pwd := rec.clave_name;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = rec.login_name) THEN
      EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', rec.login_name, pwd);
    ELSE
      EXECUTE format('ALTER ROLE %I LOGIN PASSWORD %L', rec.login_name, pwd);
    END IF;

    CASE lower(rec.nombre_rol)
      WHEN 'administrador' THEN
        EXECUTE format('GRANT grupo_administrador TO %I', rec.login_name);
      WHEN 'empresa' THEN
        EXECUTE format('GRANT grupo_empresa TO %I', rec.login_name);
      WHEN 'postulante' THEN
        EXECUTE format('GRANT grupo_postulante TO %I', rec.login_name);
      WHEN 'gerente' THEN
        EXECUTE format('GRANT grupo_gerente TO %I', rec.login_name);
      WHEN 'supervisor' THEN
        EXECUTE format('GRANT grupo_supervisor TO %I', rec.login_name);
      WHEN 'miniadmin', 'prueba001', 'prueba011' THEN
        EXECUTE format('GRANT grupo_administrador TO %I', rec.login_name);
      ELSE
        NULL;
    END CASE;
  END LOOP;
END $$;

-- Roles de prueba del backup (por si el login usa id_rol_bd)
DO $$
DECLARE r TEXT;
BEGIN
  FOREACH r IN ARRAY ARRAY[
    'PruebaRoles', 'RolesBDpruebas', 'RolGerente__', 'RolSupevisorPrueba',
    'UltimaRol', 'RolGerente001', 'Miniadmin', 'Prueba_011', 'AdminSupervisor'
  ] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('CREATE ROLE %I NOLOGIN', r);
    END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'PruebaRoles') THEN
    GRANT grupo_administrador TO "PruebaRoles";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'RolesBDpruebas') THEN
    GRANT grupo_administrador TO "RolesBDpruebas";
  END IF;
END $$;

-- =============================================================================
-- 4. permisos_ui e id_rol_bd en usuarios.roles (frontend)
-- =============================================================================
UPDATE usuarios.roles SET
  nombre_rol = 'Administrador',
  id_rol_bd = 'grupo_administrador',
  permisos_ui = 'GESTION_USERS,USERS,Perfil_X,CATALOGOS,REGISTRO_OFERTAS,VALIDACION_O,REPORTES,VALIDACION_E,ROLES_BD,CONFIG_SISTEMA,GESTION_ADMINS'
WHERE id_rol = 1 OR nombre_rol IS NULL OR TRIM(nombre_rol) = '';

UPDATE usuarios.roles SET
  id_rol_bd = 'grupo_administrador',
  permisos_ui = 'GESTION_USERS,USERS,Perfil_X,CATALOGOS,REGISTRO_OFERTAS,VALIDACION_O,REPORTES,VALIDACION_E,ROLES_BD,CONFIG_SISTEMA,GESTION_ADMINS'
WHERE id_rol = 1 OR lower(nombre_rol) = 'administrador';

UPDATE usuarios.roles SET
  id_rol_bd = 'grupo_administrador',
  permisos_ui = 'GESTION_USERS,USERS,Perfil_X,CATALOGOS,REGISTRO_OFERTAS,VALIDACION_O,REPORTES,VALIDACION_E,ROLES_BD,CONFIG_SISTEMA,GESTION_ADMINS'
WHERE lower(nombre_rol) IN ('miniadmin', 'prueba001', 'prueba011');

UPDATE usuarios.roles SET
  id_rol_bd = 'grupo_empresa',
  permisos_ui = 'PERFIL_EMP,OFERTAS_EMP,POSTULANTES_EMP,REPORTES_EMP,NOTIFICACIONES'
WHERE id_rol = 2 OR lower(nombre_rol) = 'empresa';

UPDATE usuarios.roles SET
  id_rol_bd = 'grupo_postulante',
  permisos_ui = 'Perfil_X,NOTIFICACIONES'
WHERE id_rol = 3 OR lower(nombre_rol) = 'postulante';

UPDATE usuarios.roles SET
  id_rol_bd = 'grupo_supervisor',
  permisos_ui = 'Perfil_X,CATALOGOS,REGISTRO_OFERTAS,VALIDACION_O,REPORTES,USERS'
WHERE lower(nombre_rol) = 'supervisor';

UPDATE usuarios.roles SET
  id_rol_bd = 'grupo_gerente',
  permisos_ui = 'USERS,Perfil_X,CATALOGOS,REGISTRO_OFERTAS,VALIDACION_O,REPORTES,VALIDACION_E'
WHERE lower(nombre_rol) = 'gerente';

-- postgres sigue con acceso total
DO $$
DECLARE s text;
BEGIN
  FOREACH s IN ARRAY ARRAY['catalogos','empresas','ofertas','postulaciones','seguridad','usuarios','public'] LOOP
    EXECUTE format('GRANT ALL ON SCHEMA %I TO postgres', s);
    EXECUTE format('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA %I TO postgres', s);
    EXECUTE format('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA %I TO postgres', s);
    EXECUTE format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA %I TO postgres', s);
    EXECUTE format('GRANT EXECUTE ON ALL PROCEDURES IN SCHEMA %I TO postgres', s);
  END LOOP;
END $$;

SELECT 'OK permisos locales' AS estado;
