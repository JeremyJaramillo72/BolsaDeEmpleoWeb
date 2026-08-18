-- Permisos para desarrollo local tras restore con --no-acl
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
