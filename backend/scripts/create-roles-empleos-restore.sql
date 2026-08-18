-- =============================================================================
-- Roles para restore de backup Azure (SOLO si quieres permisos Azure completos)
-- Normalmente NO hace falta: usa restore con --no-acl (ver restore-empleos.ps1)
--
-- Si aun asi quieres roles + ACL del backup:
--   1) Ejecuta ESTE script en base postgres
--   2) Luego: pg_restore ... --section=acl -d Empleos backup.bac
-- =============================================================================

DO $$
DECLARE g TEXT;
  grupos TEXT[] := ARRAY['grupo_administrador','grupo_empresa','grupo_gerente','grupo_supervisor','grupo_postulante'];
BEGIN
  FOREACH g IN ARRAY grupos LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = g) THEN
      EXECUTE format('CREATE ROLE %I NOLOGIN', g);
    END IF;
  END LOOP;
END $$;

DO $$
DECLARE r TEXT;
  roles TEXT[] := ARRAY[
    'Kennyvera43@gmail.com','Miniadmin','Prueba_011','AdminSupervisor','PruebaRoles',
    'RolesBDpruebas','RolGerente__','RolSupevisorPrueba','UltimaRol','RolGerente001',
    'SUPE','SUPERVISAR','RolShipu','RolZasque',
    'jeremyjaramillo567@gmail.com','jeremyjaramillo567@gmail.com7776432',
    'EmpresaPrueba@gmail.com','hzambranor@uteq.edu.ec'
  ];
  pwd TEXT := 'FeriaLocal_2025!';
BEGIN
  FOREACH r IN ARRAY roles LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', r, pwd);
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'adminAzure') THEN
    CREATE ROLE "adminAzure" NOLOGIN;
  END IF;
END $$;