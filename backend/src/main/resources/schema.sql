--
-- PostgreSQL database dump
--

\restrict 6ckG9wZOTG7iFClB0F1ALs15eZZ8ILzKtosVTcvetiaLy90GPOb1GYjxsAqKl6v

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: catalogos; Type: SCHEMA; Schema: -; Owner: adminAzure
--

CREATE SCHEMA catalogos;


ALTER SCHEMA catalogos OWNER TO "adminAzure";

--
-- Name: empresas; Type: SCHEMA; Schema: -; Owner: adminAzure
--

CREATE SCHEMA empresas;


ALTER SCHEMA empresas OWNER TO "adminAzure";

--
-- Name: ofertas; Type: SCHEMA; Schema: -; Owner: adminAzure
--

CREATE SCHEMA ofertas;


ALTER SCHEMA ofertas OWNER TO "adminAzure";

--
-- Name: postulaciones; Type: SCHEMA; Schema: -; Owner: adminAzure
--

CREATE SCHEMA postulaciones;


ALTER SCHEMA postulaciones OWNER TO "adminAzure";

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: azure_pg_admin
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO azure_pg_admin;

--
-- Name: seguridad; Type: SCHEMA; Schema: -; Owner: adminAzure
--

CREATE SCHEMA seguridad;


ALTER SCHEMA seguridad OWNER TO "adminAzure";

--
-- Name: usuarios; Type: SCHEMA; Schema: -; Owner: adminAzure
--

CREATE SCHEMA usuarios;


ALTER SCHEMA usuarios OWNER TO "adminAzure";

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cargo; Type: TABLE; Schema: catalogos; Owner: adminAzure
--

CREATE TABLE catalogos.cargo (
    id_cargo integer NOT NULL,
    nombre_cargo character varying(40) NOT NULL,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE catalogos.cargo OWNER TO "adminAzure";

--
-- Name: fn_buscar_cargos(character varying); Type: FUNCTION; Schema: catalogos; Owner: adminAzure
--

CREATE FUNCTION catalogos.fn_buscar_cargos(p_termino character varying) RETURNS SETOF catalogos.cargo
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select *
    from catalogos.cargo c
    where lower(c.nombre_cargo) like lower(concat('%', p_termino, '%'))
    order by c.nombre_cargo asc
    limit 10;
end;
$$;


ALTER FUNCTION catalogos.fn_buscar_cargos(p_termino character varying) OWNER TO "adminAzure";

--
-- Name: fn_crear_cargo(character varying); Type: FUNCTION; Schema: catalogos; Owner: adminAzure
--

CREATE FUNCTION catalogos.fn_crear_cargo(p_nombre_cargo character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $$
declare
    v_id_cargo integer;
begin
    insert into catalogos.cargo (nombre_cargo, fecha_registro)
    values (p_nombre_cargo, current_timestamp)
    returning id_cargo into v_id_cargo;
    
    return v_id_cargo;
end;
$$;


ALTER FUNCTION catalogos.fn_crear_cargo(p_nombre_cargo character varying) OWNER TO "adminAzure";

--
-- Name: fn_buscar_empresas(character varying); Type: FUNCTION; Schema: empresas; Owner: adminAzure
--

CREATE FUNCTION empresas.fn_buscar_empresas(p_termino character varying) RETURNS TABLE(id_empresa bigint, nombre character varying, ruc character varying)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select eu.id_empresa, 
           ce.nombre, 
           eu.ruc
    from usuarios.usuario ce 
    inner join empresas.usuario_empresa eu on ce.id_usuario = eu.id_usuario
    where lower(ce.nombre) like lower(concat('%', p_termino, '%'))
       or eu.ruc like concat('%', p_termino, '%')
    order by ce.nombre asc
    limit 10;
end;
$$;


ALTER FUNCTION empresas.fn_buscar_empresas(p_termino character varying) OWNER TO "adminAzure";

--
-- Name: fn_buscar_empresascatalogo(character varying); Type: FUNCTION; Schema: empresas; Owner: adminAzure
--

CREATE FUNCTION empresas.fn_buscar_empresascatalogo(p_termino character varying) RETURNS TABLE(id_empresa_catalogo integer, nombre_empresa character varying, ruc character varying, es_verificada boolean, id_categoria integer, fecha_registro timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select c.id_empresa_catalogo, 
           c.nombre_empresa, 
           c.ruc,
           c.es_verificada,
           c.id_categoria,
           c.fecha_registro                     -- ¡AÑADIMOS ESTO!
    from empresas.catalogo_empresa c
    where lower(c.nombre_empresa) like lower(concat('%', p_termino, '%'))
       or c.ruc like concat('%', p_termino, '%')
    order by c.nombre_empresa asc
    limit 10;
end;
$$;


ALTER FUNCTION empresas.fn_buscar_empresascatalogo(p_termino character varying) OWNER TO "adminAzure";

--
-- Name: fn_contar_empresas_hoy(); Type: FUNCTION; Schema: empresas; Owner: adminAzure
--

CREATE FUNCTION empresas.fn_contar_empresas_hoy() RETURNS bigint
    LANGUAGE plpgsql
    AS $$
begin
    return (select count(*) from empresas.usuario_empresa 
            where cast(fecha_registro as date) = current_date);
end;
$$;


ALTER FUNCTION empresas.fn_contar_empresas_hoy() OWNER TO "adminAzure";

--
-- Name: fn_contar_empresas_total(); Type: FUNCTION; Schema: empresas; Owner: adminAzure
--

CREATE FUNCTION empresas.fn_contar_empresas_total() RETURNS bigint
    LANGUAGE plpgsql
    AS $$
begin
    return (select count(*) from empresas.usuario_empresa);
end;
$$;


ALTER FUNCTION empresas.fn_contar_empresas_total() OWNER TO "adminAzure";

--
-- Name: fn_crear_catalogo_empresa(character varying, character varying, integer); Type: FUNCTION; Schema: empresas; Owner: adminAzure
--

CREATE FUNCTION empresas.fn_crear_catalogo_empresa(p_nombre_empresa character varying, p_ruc character varying, p_id_categoria integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
declare
    v_id_empresa integer;
begin
    insert into empresas.catalogo_empresa (nombre_empresa, ruc, id_categoria, es_verificada, fecha_registro)
    values (p_nombre_empresa, p_ruc, p_id_categoria, false, current_timestamp)
    returning id_empresa_catalogo into v_id_empresa;
    
    return v_id_empresa;
end;
$$;


ALTER FUNCTION empresas.fn_crear_catalogo_empresa(p_nombre_empresa character varying, p_ruc character varying, p_id_categoria integer) OWNER TO "adminAzure";

--
-- Name: fn_crear_empresa(character varying, character varying, integer); Type: FUNCTION; Schema: empresas; Owner: adminAzure
--

CREATE FUNCTION empresas.fn_crear_empresa(p_nombre_empresa character varying, p_ruc character varying, p_id_categoria integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
declare
    v_id_empresa integer;
begin
    insert into empresas.catalogo_empresa (nombre_empresa, ruc, id_categoria, es_verificada, fecha_registro)
    values (p_nombre_empresa, p_ruc, p_id_categoria, false, current_timestamp)
    returning id_empresa_catalogo into v_id_empresa;
    
    return v_id_empresa;
end;
$$;


ALTER FUNCTION empresas.fn_crear_empresa(p_nombre_empresa character varying, p_ruc character varying, p_id_categoria integer) OWNER TO "adminAzure";

--
-- Name: fn_obtener_empresas_historico(); Type: FUNCTION; Schema: empresas; Owner: adminAzure
--

CREATE FUNCTION empresas.fn_obtener_empresas_historico() RETURNS TABLE(ano_mes text, cantidad bigint)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select to_char(fecha_registro, 'yyyy-mm') as ano_mes, count(*) as cantidad 
    from empresas.usuario_empresa 
    where fecha_registro >= '2026-01-01'::date 
    group by to_char(fecha_registro, 'yyyy-mm') 
    order by ano_mes asc;
end;
$$;


ALTER FUNCTION empresas.fn_obtener_empresas_historico() OWNER TO "adminAzure";

--
-- Name: fn_obtener_empresas_ultimos_7_dias(); Type: FUNCTION; Schema: empresas; Owner: adminAzure
--

CREATE FUNCTION empresas.fn_obtener_empresas_ultimos_7_dias() RETURNS TABLE(fecha date, cantidad bigint)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select cast(fecha_registro as date) as fecha, count(*) as cantidad 
    from empresas.usuario_empresa 
    where fecha_registro >= current_date - interval '7 days' 
    group by cast(fecha_registro as date) 
    order by fecha asc;
end;
$$;


ALTER FUNCTION empresas.fn_obtener_empresas_ultimos_7_dias() OWNER TO "adminAzure";

--
-- Name: fn_reporte_ofertas_empresa(bigint, integer, integer, integer, integer, integer, date, date, numeric, numeric, character varying); Type: FUNCTION; Schema: empresas; Owner: adminAzure
--

CREATE FUNCTION empresas.fn_reporte_ofertas_empresa(p_id_empresa bigint, p_top integer DEFAULT NULL::integer, p_id_ciudad integer DEFAULT NULL::integer, p_id_categoria integer DEFAULT NULL::integer, p_id_modalidad integer DEFAULT NULL::integer, p_id_jornada integer DEFAULT NULL::integer, p_fecha_inicio date DEFAULT NULL::date, p_fecha_fin date DEFAULT NULL::date, p_salario_min numeric DEFAULT NULL::numeric, p_salario_max numeric DEFAULT NULL::numeric, p_estado_oferta character varying DEFAULT NULL::character varying) RETURNS TABLE(id_oferta bigint, titulo character varying, nombre_categoria character varying, nombre_modalidad character varying, nombre_jornada character varying, nombre_ciudad character varying, salario_min numeric, salario_max numeric, fecha_inicio date, fecha_cierre date, estado_oferta character varying, cantidad_vacantes integer, experiencia_minima integer, total_postulaciones bigint, postulaciones_pendientes bigint, postulaciones_aceptadas bigint, postulaciones_rechazadas bigint, postulaciones_canceladas bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN

    -- ── Validación 1: id_empresa obligatorio ─────────────────────────────
    IF p_id_empresa IS NULL THEN
        RAISE EXCEPTION 'El parámetro id_empresa es obligatorio';
    END IF;

    -- ── Validación 2: top debe ser positivo si se proporciona ─────────────
    IF p_top IS NOT NULL AND p_top <= 0 THEN
        RAISE EXCEPTION 'El valor de Top debe ser mayor a cero';
    END IF;

    -- ── Validación 3: rango de fechas coherente ───────────────────────────
    IF p_fecha_inicio IS NOT NULL
       AND p_fecha_fin IS NOT NULL
       AND p_fecha_fin < p_fecha_inicio THEN
        RAISE EXCEPTION 'La fecha fin no puede ser anterior a la fecha inicio';
    END IF;

    -- ── Validación 4: rango salarial coherente ────────────────────────────
    IF p_salario_min IS NOT NULL AND p_salario_min < 0 THEN
        RAISE EXCEPTION 'El salario mínimo no puede ser negativo';
    END IF;

    IF p_salario_max IS NOT NULL AND p_salario_max < 0 THEN
        RAISE EXCEPTION 'El salario máximo no puede ser negativo';
    END IF;

    IF p_salario_min IS NOT NULL
       AND p_salario_max IS NOT NULL
       AND p_salario_max < p_salario_min THEN
        RAISE EXCEPTION 'El salario máximo no puede ser menor al salario mínimo';
    END IF;

    -- ══════════════════════════════════════════════════════════════════════
    -- Rama CON LIMIT — cuando se pide Top N
    -- ══════════════════════════════════════════════════════════════════════
    IF p_top IS NOT NULL THEN

        RETURN QUERY
        SELECT
            o.id_oferta,
            o.titulo,
            co.nombre_categoria,
            mo.nombre_modalidad,
            jo.nombre_jornada,
            c.nombre_ciudad,
            o.salario_min,
            o.salario_max,
            o.fecha_inicio,
            o.fecha_cierre,
            o.estado_oferta,
            o.cantidad_vacantes,
            o.experiencia_minima,
            COUNT(p.id_postulacion)                                                       AS total_postulaciones,
            COUNT(CASE WHEN LOWER(p.estado_validacion) = 'pendiente'  THEN 1 END)         AS postulaciones_pendientes,
            COUNT(CASE WHEN LOWER(p.estado_validacion) = 'aprobado'   THEN 1 END)         AS postulaciones_aceptadas,
            COUNT(CASE WHEN LOWER(p.estado_validacion) = 'rechazado'  THEN 1 END)         AS postulaciones_rechazadas,
            COUNT(CASE WHEN LOWER(p.estado_validacion) = 'cancelada'  THEN 1 END)         AS postulaciones_canceladas  -- ✅ Fix #4
        FROM ofertas.oferta_laboral o
        LEFT JOIN catalogos.categoria_oferta co                   -- ✅ Fix #3
            ON o.id_categoria = co.id_categoria
        LEFT JOIN catalogos.modalidad_oferta mo                   -- ✅ Fix #3
            ON o.id_modalidad = mo.id_modalidad
        LEFT JOIN catalogos.jornada_oferta jo                     -- ✅ Fix #3
            ON o.id_jornada = jo.id_jornada
        LEFT JOIN catalogos.ciudad c                              -- ✅ Fix #3
            ON o.id_ciudad = c.id_ciudad
        LEFT JOIN postulaciones.postulacion p
            ON o.id_oferta = p.id_oferta
        WHERE
            o.id_empresa    =  p_id_empresa
            AND (p_id_ciudad     IS NULL OR o.id_ciudad     = p_id_ciudad)
            AND (p_id_categoria  IS NULL OR o.id_categoria  = p_id_categoria)
            AND (p_id_modalidad  IS NULL OR o.id_modalidad  = p_id_modalidad)
            AND (p_id_jornada    IS NULL OR o.id_jornada    = p_id_jornada)
            AND (p_fecha_inicio  IS NULL OR o.fecha_inicio  >= p_fecha_inicio)
            AND (p_fecha_fin     IS NULL OR o.fecha_inicio  <= p_fecha_fin)
            AND (p_salario_min   IS NULL OR o.salario_min   >= p_salario_min)
            AND (p_salario_max   IS NULL OR o.salario_max   <= p_salario_max)
            AND (p_estado_oferta IS NULL OR LOWER(o.estado_oferta) = LOWER(p_estado_oferta))
        GROUP BY
            o.id_oferta,
            o.titulo,
            co.nombre_categoria,
            mo.nombre_modalidad,
            jo.nombre_jornada,
            c.nombre_ciudad,
            o.salario_min,
            o.salario_max,
            o.fecha_inicio,
            o.fecha_cierre,
            o.estado_oferta,
            o.cantidad_vacantes,
            o.experiencia_minima
        ORDER BY total_postulaciones DESC
        LIMIT p_top;

    -- ══════════════════════════════════════════════════════════════════════
    -- Rama SIN LIMIT — todos los registros
    -- ══════════════════════════════════════════════════════════════════════
    ELSE

        RETURN QUERY
        SELECT
            o.id_oferta,
            o.titulo,
            co.nombre_categoria,
            mo.nombre_modalidad,
            jo.nombre_jornada,
            c.nombre_ciudad,
            o.salario_min,
            o.salario_max,
            o.fecha_inicio,
            o.fecha_cierre,
            o.estado_oferta,
            o.cantidad_vacantes,
            o.experiencia_minima,
            COUNT(p.id_postulacion)                                                       AS total_postulaciones,
            COUNT(CASE WHEN LOWER(p.estado_validacion) = 'pendiente'  THEN 1 END)         AS postulaciones_pendientes,
            COUNT(CASE WHEN LOWER(p.estado_validacion) = 'aprobado'   THEN 1 END)         AS postulaciones_aceptadas,
            COUNT(CASE WHEN LOWER(p.estado_validacion) = 'rechazado'  THEN 1 END)         AS postulaciones_rechazadas,
            COUNT(CASE WHEN LOWER(p.estado_validacion) = 'cancelada'  THEN 1 END)         AS postulaciones_canceladas  -- ✅ Fix #4
        FROM ofertas.oferta_laboral o
        LEFT JOIN catalogos.categoria_oferta co                   -- ✅ Fix #3
            ON o.id_categoria = co.id_categoria
        LEFT JOIN catalogos.modalidad_oferta mo                   -- ✅ Fix #3
            ON o.id_modalidad = mo.id_modalidad
        LEFT JOIN catalogos.jornada_oferta jo                     -- ✅ Fix #3
            ON o.id_jornada = jo.id_jornada
        LEFT JOIN catalogos.ciudad c                              -- ✅ Fix #3
            ON o.id_ciudad = c.id_ciudad
        LEFT JOIN postulaciones.postulacion p
            ON o.id_oferta = p.id_oferta
        WHERE
            o.id_empresa    =  p_id_empresa
            AND (p_id_ciudad     IS NULL OR o.id_ciudad     = p_id_ciudad)
            AND (p_id_categoria  IS NULL OR o.id_categoria  = p_id_categoria)
            AND (p_id_modalidad  IS NULL OR o.id_modalidad  = p_id_modalidad)
            AND (p_id_jornada    IS NULL OR o.id_jornada    = p_id_jornada)
            AND (p_fecha_inicio  IS NULL OR o.fecha_inicio  >= p_fecha_inicio)
            AND (p_fecha_fin     IS NULL OR o.fecha_inicio  <= p_fecha_fin)
            AND (p_salario_min   IS NULL OR o.salario_min   >= p_salario_min)
            AND (p_salario_max   IS NULL OR o.salario_max   <= p_salario_max)
            AND (p_estado_oferta IS NULL OR LOWER(o.estado_oferta) = LOWER(p_estado_oferta))
        GROUP BY
            o.id_oferta,
            o.titulo,
            co.nombre_categoria,
            mo.nombre_modalidad,
            jo.nombre_jornada,
            c.nombre_ciudad,
            o.salario_min,
            o.salario_max,
            o.fecha_inicio,
            o.fecha_cierre,
            o.estado_oferta,
            o.cantidad_vacantes,
            o.experiencia_minima
        ORDER BY total_postulaciones DESC;

    END IF;

END;
$$;


ALTER FUNCTION empresas.fn_reporte_ofertas_empresa(p_id_empresa bigint, p_top integer, p_id_ciudad integer, p_id_categoria integer, p_id_modalidad integer, p_id_jornada integer, p_fecha_inicio date, p_fecha_fin date, p_salario_min numeric, p_salario_max numeric, p_estado_oferta character varying) OWNER TO "adminAzure";

--
-- Name: sp_modificarperfilempresa(bigint, character varying, character varying, character varying); Type: PROCEDURE; Schema: empresas; Owner: adminAzure
--

CREATE PROCEDURE empresas.sp_modificarperfilempresa(IN p_idempresa bigint, IN p_nombreempresa character varying, IN p_sitioweb character varying, IN p_descripcion character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Actualización en la tabla usuario_empresa (Esquema: empresas)
    UPDATE empresas.usuario_empresa 
    SET 
        sitioweb = p_sitioweb,
        descripcion = p_descripcion
    WHERE id_empresa = p_idempresa;
    
    -- Actualización en la tabla usuario (Esquema: usuarios)
    -- Usamos el esquema calificado en la subconsulta también
    UPDATE usuarios.usuario 
    SET nombre = p_nombreempresa 
    WHERE id_usuario = (SELECT id_usuario FROM empresas.usuario_empresa WHERE id_empresa = p_idempresa);

END;
$$;


ALTER PROCEDURE empresas.sp_modificarperfilempresa(IN p_idempresa bigint, IN p_nombreempresa character varying, IN p_sitioweb character varying, IN p_descripcion character varying) OWNER TO "adminAzure";

--
-- Name: sp_registrar_empresa_completa(character varying, character varying, integer, character varying, character varying, character varying, character varying); Type: PROCEDURE; Schema: empresas; Owner: adminAzure
--

CREATE PROCEDURE empresas.sp_registrar_empresa_completa(IN p_correo character varying, IN p_contrasena character varying, IN p_id_ciudad integer, IN p_nombre character varying, IN p_descripcion character varying, IN p_ruc character varying, IN p_sitioweb character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_usuario BIGINT; 
BEGIN

    INSERT INTO usuarios.usuario (
        correo, contrasena, id_ciudad, id_rol, 
        nombre, apellido, estado_validacion, fecha_registro
    ) VALUES (
        p_correo, p_contrasena, p_id_ciudad, 2, 
        p_nombre, '', 'Pendiente', NOW()
    ) RETURNING id_usuario INTO v_id_usuario;


    INSERT INTO empresas.usuario_empresa (
        id_usuario, descripcion, ruc, sitioweb
    ) VALUES (
        v_id_usuario, p_descripcion, p_ruc, p_sitioweb
    );


    INSERT INTO usuarios.usuario_imagen(
        id_usuario, id_imagen, fecha_registro
    ) VALUES (
        v_id_usuario, 2, now()
    );

    CALL seguridad.registrousuariologin(p_correo, v_id_usuario, 2);

END;
$$;


ALTER PROCEDURE empresas.sp_registrar_empresa_completa(IN p_correo character varying, IN p_contrasena character varying, IN p_id_ciudad integer, IN p_nombre character varying, IN p_descripcion character varying, IN p_ruc character varying, IN p_sitioweb character varying) OWNER TO "adminAzure";

--
-- Name: fn_auditar_historial_oferta(); Type: FUNCTION; Schema: ofertas; Owner: postgres
--

CREATE FUNCTION ofertas.fn_auditar_historial_oferta() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_id_oferta bigint;
    v_id_seguridad integer;
    v_user_real text;
    v_accion varchar(50);
    v_campos_modificados text := NULL;
    v_old jsonb := NULL;
    v_new jsonb := NULL;
BEGIN
    -- 1. Obtener tu id_seguridad basado en el usuario de sesión actual
    v_user_real := session_user; 
    
    SELECT id_seguridad INTO v_id_seguridad 
    FROM seguridad.seguridad 
    WHERE login_name = v_user_real;
    
    IF v_id_seguridad IS NULL THEN v_id_seguridad := 1; END IF;

    -- 2. Capturar los JSON y detectar EXACTAMENTE qué cambió
    IF (TG_OP = 'DELETE') THEN
        -- En eliminación es buena práctica guardar todo para saber qué se borró
        v_old := to_jsonb(OLD);
        v_campos_modificados := 'N/A (Eliminacion)';
        
    ELSIF (TG_OP = 'UPDATE') THEN
        -- ¡AQUÍ ESTÁ LA MEJORA! Solo extrae al JSON los campos que realmente cambiaron
        SELECT 
            string_agg(k, ', '),
            jsonb_object_agg(k, to_jsonb(OLD)->k),
            jsonb_object_agg(k, to_jsonb(NEW)->k)
        INTO 
            v_campos_modificados,
            v_old,
            v_new
        FROM jsonb_object_keys(to_jsonb(NEW)) k
        WHERE to_jsonb(NEW)->k IS DISTINCT FROM to_jsonb(OLD)->k;
        
        -- Si se disparó el UPDATE pero los datos son idénticos, no guardamos basura
        IF v_campos_modificados IS NULL THEN
            RETURN NEW;
        END IF;
        
    ELSE -- INSERT
        -- En creación es todo nuevo, así que guardamos el registro inicial
        v_new := to_jsonb(NEW);
        v_campos_modificados := 'TODOS_LOS_CAMPOS (Creacion)';
    END IF;

    -- 3. Lógica dependiendo de la tabla que dispara el trigger
    IF TG_TABLE_NAME = 'oferta_laboral' THEN
        v_id_oferta := CASE WHEN TG_OP = 'DELETE' THEN OLD.id_oferta ELSE NEW.id_oferta END;
        v_accion := CASE 
            WHEN TG_OP = 'INSERT' THEN 'OFERTA_CREADA' 
            WHEN TG_OP = 'UPDATE' THEN 'OFERTA_ACTUALIZADA' 
            ELSE 'OFERTA_ELIMINADA' 
        END;

    ELSIF TG_TABLE_NAME = 'postulacion' THEN
        v_id_oferta := CASE WHEN TG_OP = 'DELETE' THEN OLD.id_oferta ELSE NEW.id_oferta END;
        v_accion := CASE 
            WHEN TG_OP = 'INSERT' THEN 'NUEVA_POSTULACION' 
            WHEN TG_OP = 'UPDATE' THEN 'ACTUALIZACION_POSTULACION'
            ELSE 'POSTULACION_RETIRADA' 
        END;

    ELSIF TG_TABLE_NAME = 'validacion_oferta' THEN
        v_id_oferta := CASE WHEN TG_OP = 'DELETE' THEN OLD.id_oferta ELSE NEW.id_oferta END;
        IF (TG_OP IN ('INSERT', 'UPDATE')) THEN
            v_accion := 'OFERTA_' || UPPER(NEW.estado_validacion); 
        ELSE
            v_accion := 'VALIDACION_ELIMINADA';
        END IF;
    END IF;

    -- 4. Insertar el registro en el historial
    INSERT INTO ofertas.historial_oferta (
        id_oferta,
        id_seguridad,
        accion,
        campo_modificado,
        valores_anteriores,
        valores_nuevos
    ) VALUES (
        v_id_oferta,
        v_id_seguridad,
        v_accion,
        v_campos_modificados,
        v_old,
        v_new
    );

    IF (TG_OP = 'DELETE') THEN 
        RETURN OLD; 
    ELSE 
        RETURN NEW; 
    END IF;
END;
$$;


ALTER FUNCTION ofertas.fn_auditar_historial_oferta() OWNER TO postgres;

--
-- Name: fn_consultar_ofertas_empresa_provincia(bigint, character varying); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_consultar_ofertas_empresa_provincia(p_id_empresa bigint, p_nombre_provincia character varying) RETURNS TABLE(titulo_oferta character varying, id_empresa_ref bigint, ciudad_nombre character varying, provincia_nombre character varying, salario numeric, fecha_cierre_oferta date)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ol.titulo,
        e.id_empresa,
        c.nombre_ciudad,
        p.nombre_provincia,
        ol.salario_promedio,
        ol.fecha_cierre
    FROM 
        ofertas.oferta_laboral ol
    JOIN 
        empresas.usuario_empresa e ON ol.id_empresa = e.id_empresa
    JOIN 
        catalogos.ciudad c ON ol.id_ciudad = c.id_ciudad
    JOIN 
        catalogos.provincia p ON c.id_provincia = p.id_provincia
    WHERE 
        e.id_empresa = p_id_empresa
        AND p.nombre_provincia = p_nombre_provincia;
END;
$$;


ALTER FUNCTION ofertas.fn_consultar_ofertas_empresa_provincia(p_id_empresa bigint, p_nombre_provincia character varying) OWNER TO "adminAzure";

--
-- Name: fn_contar_favoritas_usuario(bigint); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_contar_favoritas_usuario(p_id_usuario bigint) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
begin
    return (select count(*) from ofertas.ofertas_favoritas 
            where id_usuario = p_id_usuario and estado_fav = 'Activo');
end;
$$;


ALTER FUNCTION ofertas.fn_contar_favoritas_usuario(p_id_usuario bigint) OWNER TO "adminAzure";

--
-- Name: fn_contar_favoritas_usuario_hoy(bigint); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_contar_favoritas_usuario_hoy(p_id_usuario bigint) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
begin
    return (select count(*) from ofertas.ofertas_favoritas 
            where id_usuario = p_id_usuario and estado_fav = 'Activo'
            and cast(fecha_agregado as date) = current_date);
end;
$$;


ALTER FUNCTION ofertas.fn_contar_favoritas_usuario_hoy(p_id_usuario bigint) OWNER TO "adminAzure";

--
-- Name: fn_contar_ofertas_empresa_estado(bigint, character varying); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_contar_ofertas_empresa_estado(p_id_empresa bigint, p_estado character varying) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
begin
    return (select count(*) from ofertas.oferta_laboral 
            where id_empresa = p_id_empresa and estado_oferta = p_estado);
end;
$$;


ALTER FUNCTION ofertas.fn_contar_ofertas_empresa_estado(p_id_empresa bigint, p_estado character varying) OWNER TO "adminAzure";

--
-- Name: fn_contar_ofertas_empresa_estado_hoy(bigint, character varying); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_contar_ofertas_empresa_estado_hoy(p_id_empresa bigint, p_estado character varying) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
begin
    return (select count(*) from ofertas.oferta_laboral 
            where id_empresa = p_id_empresa and estado_oferta = p_estado 
            and cast(fecha_inicio as date) = current_date);
end;
$$;


ALTER FUNCTION ofertas.fn_contar_ofertas_empresa_estado_hoy(p_id_empresa bigint, p_estado character varying) OWNER TO "adminAzure";

--
-- Name: fn_contar_ofertas_por_estado(character varying); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_contar_ofertas_por_estado(p_estado character varying) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
begin
    return (select count(*) from ofertas.oferta_laboral where estado_oferta = p_estado);
end;
$$;


ALTER FUNCTION ofertas.fn_contar_ofertas_por_estado(p_estado character varying) OWNER TO "adminAzure";

--
-- Name: fn_contar_ofertas_por_estado_hoy(character varying); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_contar_ofertas_por_estado_hoy(p_estado character varying) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
begin
    return (select count(*) from ofertas.oferta_laboral 
            where estado_oferta = p_estado and cast(fecha_inicio as date) = current_date);
end;
$$;


ALTER FUNCTION ofertas.fn_contar_ofertas_por_estado_hoy(p_estado character varying) OWNER TO "adminAzure";

--
-- Name: fn_datos_ubicacion_oferta(integer); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_datos_ubicacion_oferta(p_id_oferta integer) RETURNS TABLE(titulo character varying, nombre_ciudad character varying, id_ciudad integer, nombre_provincia character varying, id_provincia integer)
    LANGUAGE sql
    AS $$
    SELECT
        o.titulo,
        c.nombre_ciudad,
        c.id_ciudad,
        p.nombre_provincia,
        p.id_provincia
    FROM ofertas.oferta_laboral o
    JOIN catalogos.ciudad    c ON o.id_ciudad    = c.id_ciudad
    JOIN catalogos.provincia p ON c.id_provincia = p.id_provincia
    WHERE o.id_oferta = p_id_oferta;
$$;


ALTER FUNCTION ofertas.fn_datos_ubicacion_oferta(p_id_oferta integer) OWNER TO "adminAzure";

--
-- Name: fn_listar_ofertas_completo(bigint); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_listar_ofertas_completo(p_id_usuario bigint) RETURNS TABLE(id_oferta bigint, titulo character varying, descripcion text, cantidad_vacantes integer, experiencia_minima integer, fecha_inicio date, fecha_cierre date, nombre_modalidad character varying, nombre_jornada character varying, nombre_categoria character varying, salario_min numeric, salario_max numeric, estado_oferta character varying, id_favoritas integer, estado_fav character varying, id_postulacion integer, estado_validacion character varying, observaciones text, nombre_empresa character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id_oferta,
        o.titulo,
        o.descripcion,
        o.cantidad_vacantes,
        o.experiencia_minima,
        o.fecha_inicio,
        o.fecha_cierre,
        m.nombre_modalidad,
        j.nombre_jornada,
        c.nombre_categoria,
        o.salario_min,
        o.salario_max,
        o.estado_oferta,
        f.id_favoritas,
        f.estado_fav,
        ult.sub_id_post::INTEGER,
        ult.sub_estado_val,
        ult.sub_observaciones,
        u_emp.nombre::character varying
    FROM ofertas.oferta_laboral o
    LEFT JOIN catalogos.modalidad_oferta m ON m.id_modalidad = o.id_modalidad
    LEFT JOIN catalogos.jornada_oferta j   ON j.id_jornada   = o.id_jornada
    LEFT JOIN catalogos.categoria_oferta c ON c.id_categoria = o.id_categoria
    LEFT JOIN ofertas.ofertas_favoritas f
           ON f.id_oferta  = o.id_oferta
          AND f.id_usuario = p_id_usuario
          AND f.estado_fav = 'Activo'
    LEFT JOIN (
        SELECT DISTINCT ON (post.id_oferta)
            post.id_postulacion   AS sub_id_post,
            post.id_oferta        AS sub_id_oferta,
            post.estado_validacion AS sub_estado_val,
            post.observaciones    AS sub_observaciones
        FROM postulaciones.postulacion post
        WHERE post.id_usuario = p_id_usuario
        ORDER BY post.id_oferta, post.fecha_postulacion DESC
    ) ult ON ult.sub_id_oferta = o.id_oferta
    LEFT JOIN empresas.usuario_empresa ue ON ue.id_empresa    = o.id_empresa
    LEFT JOIN usuarios.usuario u_emp      ON u_emp.id_usuario = ue.id_usuario
    WHERE o.estado_oferta = 'aprobado'
    ORDER BY o.fecha_inicio DESC;
END;
$$;


ALTER FUNCTION ofertas.fn_listar_ofertas_completo(p_id_usuario bigint) OWNER TO "adminAzure";

--
-- Name: fn_listar_ofertas_fisicas(); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_listar_ofertas_fisicas() RETURNS TABLE(id_oferta bigint, id_empresa bigint, nombre_empresa character varying, id_modalidad integer, modalidad character varying, id_categoria integer, id_jornada integer, jornada character varying, id_provincia integer, id_ciudad integer, ciudad character varying, titulo character varying, descripcion text, salario_min numeric, salario_max numeric, cantidad_vacantes integer, experiencia_minima integer, fecha_inicio date, fecha_cierre date, estado_oferta character varying, fecha_creacion timestamp without time zone, postulantes bigint, habilidades text, requisitos_manuales text)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select 
        o.id_oferta,
        o.id_empresa,
        coalesce(u.nombre, 'empresa sin nombre')::character varying as nombre_empresa,
        o.id_modalidad,
        m.nombre_modalidad as modalidad,
        o.id_categoria,
        o.id_jornada,
        j.nombre_jornada as jornada,
        c.id_provincia,
        o.id_ciudad,
        c.nombre_ciudad as ciudad,
        o.titulo,
        o.descripcion,
        o.salario_min,
        o.salario_max,
        o.cantidad_vacantes,
        o.experiencia_minima,
        o.fecha_inicio,
        o.fecha_cierre,
        o.estado_oferta,
        o.fecha_creacion,
        coalesce((select count(p.id_postulacion) from postulaciones.postulacion p where p.id_oferta = o.id_oferta), 0)::bigint as postulantes,
        
     
        coalesce((
            select jsonb_agg(
                jsonb_build_object(
                    'idHabilidad', oh.id_habilidad,
                    'nombreHabilidad', ch.nombre_habilidad,
                    'nivelRequerido', oh.nivel_requerido,
                    'esObligatorio', oh.es_obligatorio
                )
            )
            from ofertas.oferta_habilidad_seleccionada oh
            inner join catalogos.catalogo_habilidad ch on oh.id_habilidad = ch.id_habilidad
            where oh.id_oferta = o.id_oferta
        ), '[]'::jsonb)::text as habilidades,

    
        coalesce((
            select jsonb_agg(
                jsonb_build_object(
                    'descripcion', rm.descripcion
                )
            )
            from ofertas.requisito_manual rm
            where rm.id_oferta = o.id_oferta
        ), '[]'::jsonb)::text as requisitos_manuales

    from ofertas.oferta_laboral o
    left join empresas.usuario_empresa ue on o.id_empresa = ue.id_empresa
    left join usuarios.usuario u on ue.id_usuario = u.id_usuario
    left join catalogos.modalidad_oferta m on o.id_modalidad = m.id_modalidad
    left join catalogos.jornada_oferta j on o.id_jornada = j.id_jornada
    left join catalogos.ciudad c on o.id_ciudad = c.id_ciudad
    where o.es_fisica = true
    order by o.fecha_creacion desc;
end;
$$;


ALTER FUNCTION ofertas.fn_listar_ofertas_fisicas() OWNER TO "adminAzure";

--
-- Name: fn_mostrar_postulantes_oferta(bigint); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_mostrar_postulantes_oferta(p_idoferta bigint) RETURNS TABLE(id_postulacion bigint, id_graduado bigint, nombres character varying, apellidos character varying, correo character varying, profesion character varying, fecha_postulacion date, estado_postulacion character varying)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select 
        p.id_postulacion,
        g.id_usuario as id_graduado,
        g.nombres,
        g.apellidos,
        g.correo,
        g.profesion,
        p.fecha_postulacion,
        p.estado_postulacion
    from ofertas.postulacion p
    inner join usuarios.graduado g on p.id_graduado = g.id_usuario
    where p.id_oferta = p_idoferta
    order by p.fecha_postulacion desc;
end;
$$;


ALTER FUNCTION ofertas.fn_mostrar_postulantes_oferta(p_idoferta bigint) OWNER TO "adminAzure";

--
-- Name: fn_mostrarofertasempresa(bigint); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_mostrarofertasempresa(p_id_empresa bigint) RETURNS TABLE(id_oferta bigint, id_empresa bigint, id_modalidad integer, modalidad character varying, id_categoria integer, id_jornada integer, jornada character varying, id_provincia integer, id_ciudad integer, ciudad character varying, titulo character varying, descripcion text, salario_min numeric, salario_max numeric, cantidad_vacantes integer, experiencia_minima integer, fecha_inicio date, fecha_cierre date, estado_oferta character varying, fecha_creacion timestamp without time zone, postulantes bigint, habilidades jsonb, requisitos_manuales jsonb)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select
        o.id_oferta,
        o.id_empresa,
        o.id_modalidad,
        m.nombre_modalidad as modalidad,
        o.id_categoria,
        o.id_jornada,
        j.nombre_jornada as jornada,
        c.id_provincia,
        o.id_ciudad,
        c.nombre_ciudad as ciudad,
        o.titulo,
        o.descripcion,
        o.salario_min,
        o.salario_max,
        o.cantidad_vacantes,
        o.experiencia_minima,
        o.fecha_inicio,
        o.fecha_cierre,
        o.estado_oferta,
        o.fecha_creacion,
        
        coalesce((select count(p.id_postulacion) 
                  from postulaciones.postulacion p 
                  where p.id_oferta = o.id_oferta), 0) as postulantes,
                  
        coalesce((
            select jsonb_agg(
                jsonb_build_object(
                    'idHabilidad', oh.id_habilidad,
                    'nombreHabilidad', ch.nombre_habilidad,
                    'nivelRequerido', oh.nivel_requerido,
                    'esObligatorio', oh.es_obligatorio
                )
            )
            from ofertas.oferta_habilidad_seleccionada oh
            inner join catalogos.catalogo_habilidad ch on oh.id_habilidad = ch.id_habilidad
            where oh.id_oferta = o.id_oferta
        ), '[]'::jsonb) as habilidades,

        coalesce((
            select jsonb_agg(
                jsonb_build_object(
                    'descripcion', rm.descripcion
                )
            )
            from ofertas.requisito_manual rm
            where rm.id_oferta = o.id_oferta
        ), '[]'::jsonb) as requisitos_manuales

    from ofertas.oferta_laboral o
    left join catalogos.modalidad_oferta m on o.id_modalidad = m.id_modalidad
    left join catalogos.jornada_oferta j on o.id_jornada = j.id_jornada
    left join catalogos.ciudad c on o.id_ciudad = c.id_ciudad
    where o.id_empresa = p_id_empresa
    order by o.fecha_creacion desc;
end;
$$;


ALTER FUNCTION ofertas.fn_mostrarofertasempresa(p_id_empresa bigint) OWNER TO "adminAzure";

--
-- Name: fn_obtener_datos_oferta_ia(bigint); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_obtener_datos_oferta_ia(p_id_oferta bigint) RETURNS TABLE(titulo character varying, descripcion text, experiencia_minima integer, habilidades text, requisitos text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.titulo,
        o.descripcion,
        o.experiencia_minima,
        
        COALESCE((
            SELECT string_agg(ch.nombre_habilidad || ' (' || oh.nivel_requerido || ')', ', ')
            FROM ofertas.oferta_habilidad_seleccionada oh
            JOIN catalogos.catalogo_habilidad ch ON ch.id_habilidad = oh.id_habilidad
            WHERE oh.id_oferta = o.id_oferta
        ), '')::text AS habilidades,
        
        COALESCE((
            SELECT string_agg(rm.descripcion, ' | ')
            FROM ofertas.requisito_manual rm
            WHERE rm.id_oferta = o.id_oferta
        ), '')::text AS requisitos
        
    FROM ofertas.oferta_laboral o
    WHERE o.id_oferta = p_id_oferta;
END;
$$;


ALTER FUNCTION ofertas.fn_obtener_datos_oferta_ia(p_id_oferta bigint) OWNER TO "adminAzure";

--
-- Name: fn_obtener_extra_oferta(integer); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_obtener_extra_oferta(p_idoferta integer) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_ciudad      TEXT;
    v_empresa     TEXT;
    v_habilidades JSON;
    v_requisitos  JSON;
BEGIN
    SELECT c.nombre_ciudad, u_emp.nombre
    INTO v_ciudad, v_empresa
    FROM ofertas.oferta_laboral o
    LEFT JOIN catalogos.ciudad c          ON c.id_ciudad     = o.id_ciudad
    LEFT JOIN empresas.usuario_empresa ue ON ue.id_empresa   = o.id_empresa
    LEFT JOIN usuarios.usuario u_emp      ON u_emp.id_usuario = ue.id_usuario
    WHERE o.id_oferta = p_idoferta;

    SELECT COALESCE(json_agg(json_build_object(
        'idHabilidad',     ohs.id_habilidad,
        'nombreHabilidad', ch.nombre_habilidad,
        'nivelRequerido',  ohs.nivel_requerido,
        'esObligatorio',   ohs.es_obligatorio
    )), '[]'::json)
    INTO v_habilidades
    FROM ofertas.oferta_habilidad_seleccionada ohs
    JOIN catalogos.catalogo_habilidad ch ON ch.id_habilidad = ohs.id_habilidad
    WHERE ohs.id_oferta = p_idoferta;

    SELECT COALESCE(json_agg(json_build_object(
        'idRequisitoManual', rm.id_requisito_manual,
        'descripcion',       rm.descripcion,
        'esObligatorio',     rm.es_obligatorio
    )), '[]'::json)
    INTO v_requisitos
    FROM ofertas.requisito_manual rm
    WHERE rm.id_oferta = p_idoferta;

    RETURN json_build_object(
        'idOferta',      p_idoferta,
        'nombreCiudad',  COALESCE(v_ciudad,  ''),
        'nombreEmpresa', COALESCE(v_empresa, ''),
        'habilidades',   v_habilidades,
        'requisitos',    v_requisitos
    );
END;
$$;


ALTER FUNCTION ofertas.fn_obtener_extra_oferta(p_idoferta integer) OWNER TO "adminAzure";

--
-- Name: fn_obtener_favoritas_usuario_historico(bigint); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_obtener_favoritas_usuario_historico(p_id_usuario bigint) RETURNS TABLE(ano_mes text, cantidad bigint)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select to_char(fecha_agregado, 'yyyy-mm') as ano_mes, count(*) as cantidad 
    from ofertas.ofertas_favoritas 
    where id_usuario = p_id_usuario and estado_fav = 'Activo'
    and fecha_agregado >= '2026-01-01'::date 
    group by to_char(fecha_agregado, 'yyyy-mm') 
    order by ano_mes asc;
end;
$$;


ALTER FUNCTION ofertas.fn_obtener_favoritas_usuario_historico(p_id_usuario bigint) OWNER TO "adminAzure";

--
-- Name: fn_obtener_favoritas_usuario_mixtas(bigint); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_obtener_favoritas_usuario_mixtas(p_id_usuario bigint) RETURNS TABLE(id_favoritas integer, id_oferta integer, origen_oferta character varying, estado_fav character varying, titulo character varying, descripcion text, nombre_empresa character varying, nombre_ciudad character varying, fecha_inicio date, fecha_cierre date, salario_min numeric, salario_max numeric, url_aplicar text, id_origen_externa character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.id_favoritas,
        f.id_oferta,
        f.origen_oferta,
        f.estado_fav,
        o.titulo,
        o.descripcion,
        u_emp.nombre::VARCHAR AS nombre_empresa,
        c.nombre_ciudad::VARCHAR AS nombre_ciudad,
        o.fecha_inicio,
        o.fecha_cierre,
        o.salario_min,
        o.salario_max,
        NULL::TEXT AS url_aplicar,
        NULL::VARCHAR AS id_origen_externa
    FROM ofertas.ofertas_favoritas f
    INNER JOIN ofertas.oferta_laboral o ON o.id_oferta = f.id_oferta
    LEFT JOIN catalogos.ciudad c ON c.id_ciudad = o.id_ciudad
    LEFT JOIN empresas.usuario_empresa ue ON ue.id_empresa = o.id_empresa
    LEFT JOIN usuarios.usuario u_emp ON u_emp.id_usuario = ue.id_usuario
    WHERE f.id_usuario = p_id_usuario
      AND LOWER(COALESCE(f.origen_oferta, 'interna')) = 'interna'
      AND LOWER(COALESCE(f.estado_fav, 'inactivo')) = 'activo'

    UNION ALL

    SELECT
        f.id_favoritas,
        f.id_oferta,
        f.origen_oferta,
        f.estado_fav,
        e.titulo,
        e.descripcion,
        e.nombre_empresa,
        TRIM(BOTH ', ' FROM CONCAT_WS(', ', e.ciudad, e.estado, e.pais))::VARCHAR AS nombre_ciudad,
        NULL::DATE AS fecha_inicio,
        NULL::DATE AS fecha_cierre,
        NULL::NUMERIC AS salario_min,
        NULL::NUMERIC AS salario_max,
        e.url_aplicar,
        e.id_oferta_externa_origen::VARCHAR AS id_origen_externa
    FROM ofertas.ofertas_favoritas f
    INNER JOIN ofertas.oferta_externa_guardada e ON e.id_oferta_externa = f.id_oferta
    WHERE f.id_usuario = p_id_usuario
      AND LOWER(COALESCE(f.origen_oferta, 'interna')) = 'externa'
      AND LOWER(COALESCE(f.estado_fav, 'inactivo')) = 'activo'

    ORDER BY id_favoritas DESC;
END;
$$;


ALTER FUNCTION ofertas.fn_obtener_favoritas_usuario_mixtas(p_id_usuario bigint) OWNER TO "adminAzure";

--
-- Name: fn_obtener_favoritas_usuario_ultimos_7_dias(bigint); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_obtener_favoritas_usuario_ultimos_7_dias(p_id_usuario bigint) RETURNS TABLE(fecha date, cantidad bigint)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select cast(fecha_agregado as date) as fecha, count(*) as cantidad 
    from ofertas.ofertas_favoritas 
    where id_usuario = p_id_usuario and estado_fav = 'Activo'
    and fecha_agregado >= current_date - interval '7 days' 
    group by cast(fecha_agregado as date) 
    order by fecha asc;
end;
$$;


ALTER FUNCTION ofertas.fn_obtener_favoritas_usuario_ultimos_7_dias(p_id_usuario bigint) OWNER TO "adminAzure";

--
-- Name: fn_obtener_ofertas_empresa_estado_historico(bigint, character varying); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_obtener_ofertas_empresa_estado_historico(p_id_empresa bigint, p_estado character varying) RETURNS TABLE(ano_mes text, cantidad bigint)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select to_char(fecha_inicio, 'yyyy-mm') as ano_mes, count(*) as cantidad 
    from ofertas.oferta_laboral 
    where id_empresa = p_id_empresa and estado_oferta = p_estado 
    and fecha_inicio >= '2026-01-01'::date 
    group by to_char(fecha_inicio, 'yyyy-mm') 
    order by ano_mes asc;
end;
$$;


ALTER FUNCTION ofertas.fn_obtener_ofertas_empresa_estado_historico(p_id_empresa bigint, p_estado character varying) OWNER TO "adminAzure";

--
-- Name: fn_obtener_ofertas_empresa_estado_ultimos_7_dias(bigint, character varying); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_obtener_ofertas_empresa_estado_ultimos_7_dias(p_id_empresa bigint, p_estado character varying) RETURNS TABLE(fecha date, cantidad bigint)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select cast(fecha_inicio as date) as fecha, count(*) as cantidad 
    from ofertas.oferta_laboral 
    where id_empresa = p_id_empresa and estado_oferta = p_estado 
    and fecha_inicio >= current_date - interval '7 days' 
    group by cast(fecha_inicio as date) 
    order by fecha asc;
end;
$$;


ALTER FUNCTION ofertas.fn_obtener_ofertas_empresa_estado_ultimos_7_dias(p_id_empresa bigint, p_estado character varying) OWNER TO "adminAzure";

--
-- Name: fn_obtener_ofertas_estado_historico(character varying); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_obtener_ofertas_estado_historico(p_estado character varying) RETURNS TABLE(ano_mes text, cantidad bigint)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select to_char(fecha_inicio, 'yyyy-mm') as ano_mes, count(*) as cantidad 
    from ofertas.oferta_laboral 
    where estado_oferta = p_estado and fecha_inicio >= '2026-01-01'::date 
    group by to_char(fecha_inicio, 'yyyy-mm') 
    order by ano_mes asc;
end;
$$;


ALTER FUNCTION ofertas.fn_obtener_ofertas_estado_historico(p_estado character varying) OWNER TO "adminAzure";

--
-- Name: fn_obtener_ofertas_estado_ultimos_7_dias(character varying); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_obtener_ofertas_estado_ultimos_7_dias(p_estado character varying) RETURNS TABLE(fecha date, cantidad bigint)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select cast(fecha_inicio as date) as fecha, count(*) as cantidad 
    from ofertas.oferta_laboral 
    where estado_oferta = p_estado and fecha_inicio >= current_date - interval '7 days' 
    group by cast(fecha_inicio as date) 
    order by fecha asc;
end;
$$;


ALTER FUNCTION ofertas.fn_obtener_ofertas_estado_ultimos_7_dias(p_estado character varying) OWNER TO "adminAzure";

--
-- Name: fn_obtener_ofertas_sin_postular(bigint); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_obtener_ofertas_sin_postular(p_id_usuario bigint) RETURNS TABLE(id_oferta integer, id_empresa integer, titulo character varying, descripcion text, cantidad_vacantes integer, experiencia_minima integer, salario_min numeric, salario_max numeric, fecha_inicio date, fecha_cierre date, estado_oferta character varying, fecha_creacion timestamp without time zone)
    LANGUAGE sql STABLE ROWS 100 PARALLEL SAFE
    AS $$
    SELECT 
        ol.id_oferta,
        ol.id_empresa,
        ol.titulo,
        ol.descripcion,
        ol.cantidad_vacantes,
        ol.experiencia_minima,
        ol.salario_min,
        ol.salario_max,
        ol.fecha_inicio,
        ol.fecha_cierre,
        ol.estado_oferta,
        ol.fecha_creacion
    FROM ofertas.oferta_laboral ol
    WHERE ol.estado_oferta = 'aprobado'
      AND ol.fecha_cierre IS NOT NULL
      AND ol.fecha_cierre <= CURRENT_DATE + INTERVAL '1 day'
      AND ol.fecha_cierre > CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1 FROM postulaciones.postulacion p
        WHERE p.id_usuario = p_id_usuario
          AND p.id_oferta = ol.id_oferta
      )
    ORDER BY ol.fecha_cierre ASC;
$$;


ALTER FUNCTION ofertas.fn_obtener_ofertas_sin_postular(p_id_usuario bigint) OWNER TO "adminAzure";

--
-- Name: fn_obtener_ofertas_unicas_historial(json); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_obtener_ofertas_unicas_historial(p_json json) RETURNS TABLE(id_historial bigint, id_oferta bigint, titulo character varying, empresa_o_usuario text, ejecutor text, accion character varying, estado_oferta character varying, fecha_hora timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    WITH UltimoMovimiento AS ( 
        SELECT ho.id_oferta, MAX(ho.fecha_hora) AS ultima_fecha 
        FROM ofertas.historial_oferta ho
        GROUP BY ho.id_oferta 
    ) 
    SELECT 
        ho.id_historial, 
        ho.id_oferta, 
        ol.titulo, 
        COALESCE(ce.nombre_empresa, u.nombre || ' ' || u.apellido)::text AS empresa_o_usuario, 
        COALESCE(s.login_name, 'Sistema')::text AS ejecutor, 
        ho.accion, 
        ol.estado_oferta, 
        ho.fecha_hora 
    FROM UltimoMovimiento um 
    INNER JOIN ofertas.historial_oferta ho ON ho.id_oferta = um.id_oferta AND ho.fecha_hora = um.ultima_fecha 
    INNER JOIN ofertas.oferta_laboral ol ON ho.id_oferta = ol.id_oferta 
    LEFT JOIN seguridad.seguridad s ON ho.id_seguridad = s.id_seguridad 
    LEFT JOIN empresas.usuario_empresa ue ON ol.id_empresa = ue.id_empresa 
    LEFT JOIN empresas.catalogo_empresa ce ON ue.ruc = ce.ruc 
    LEFT JOIN usuarios.usuario u ON ue.id_usuario = u.id_usuario 
    ORDER BY ho.fecha_hora DESC;
END;
$$;


ALTER FUNCTION ofertas.fn_obtener_ofertas_unicas_historial(p_json json) OWNER TO "adminAzure";

--
-- Name: fn_obtener_trazabilidad_oferta(json); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_obtener_trazabilidad_oferta(p_json json) RETURNS TABLE(id_historial bigint, accion character varying, fecha_hora timestamp without time zone, ejecutor text, campo_modificado text, valores_anteriores jsonb, valores_nuevos jsonb)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_oferta bigint;
BEGIN
    v_id_oferta := (p_json->>'id_oferta')::bigint;

    RETURN QUERY
    SELECT 
        ho.id_historial, 
        ho.accion, 
        ho.fecha_hora, 
        COALESCE(s.login_name, 'Sistema')::text AS ejecutor, 
        
        -- Limpiamos el texto de campos modificados
        REPLACE(REPLACE(REPLACE(ho.campo_modificado, 'id_empresa', 'empresa'), 'id_ciudad', 'ciudad'), 'id_jornada', 'jornada') AS campo_modificado, 
        
        -- 1. Inyectar nombres reales en VALORES ANTERIORES (Blindado contra nulos)
        CASE WHEN ho.valores_anteriores IS NULL THEN NULL ELSE
            ho.valores_anteriores
            || CASE WHEN ho.valores_anteriores ? 'id_empresa' AND NULLIF(ho.valores_anteriores->>'id_empresa', '') IS NOT NULL THEN jsonb_build_object('empresa', COALESCE((SELECT nombre_empresa FROM empresas.catalogo_empresa WHERE id_empresa = (ho.valores_anteriores->>'id_empresa')::integer), 'Desconocida')) ELSE '{}'::jsonb END
            || CASE WHEN ho.valores_anteriores ? 'id_ciudad' AND NULLIF(ho.valores_anteriores->>'id_ciudad', '') IS NOT NULL THEN jsonb_build_object('ciudad', COALESCE((SELECT nombre FROM catalogos.ciudad WHERE id_ciudad = (ho.valores_anteriores->>'id_ciudad')::integer), 'Desconocida')) ELSE '{}'::jsonb END
            || CASE WHEN ho.valores_anteriores ? 'id_jornada' AND NULLIF(ho.valores_anteriores->>'id_jornada', '') IS NOT NULL THEN jsonb_build_object('jornada', COALESCE((SELECT nombre FROM catalogos.jornada WHERE id_jornada = (ho.valores_anteriores->>'id_jornada')::integer), 'Desconocida')) ELSE '{}'::jsonb END
        END AS valores_anteriores,

        -- 2. Inyectar nombres reales en VALORES NUEVOS (Blindado contra nulos)
        CASE WHEN ho.valores_nuevos IS NULL THEN NULL ELSE
            ho.valores_nuevos
            || CASE WHEN ho.valores_nuevos ? 'id_empresa' AND NULLIF(ho.valores_nuevos->>'id_empresa', '') IS NOT NULL THEN jsonb_build_object('empresa', COALESCE((SELECT nombre_empresa FROM empresas.catalogo_empresa WHERE id_empresa = (ho.valores_nuevos->>'id_empresa')::integer), 'Desconocida')) ELSE '{}'::jsonb END
            || CASE WHEN ho.valores_nuevos ? 'id_ciudad' AND NULLIF(ho.valores_nuevos->>'id_ciudad', '') IS NOT NULL THEN jsonb_build_object('ciudad', COALESCE((SELECT nombre FROM catalogos.ciudad WHERE id_ciudad = (ho.valores_nuevos->>'id_ciudad')::integer), 'Desconocida')) ELSE '{}'::jsonb END
            || CASE WHEN ho.valores_nuevos ? 'id_jornada' AND NULLIF(ho.valores_nuevos->>'id_jornada', '') IS NOT NULL THEN jsonb_build_object('jornada', COALESCE((SELECT nombre FROM catalogos.jornada WHERE id_jornada = (ho.valores_nuevos->>'id_jornada')::integer), 'Desconocida')) ELSE '{}'::jsonb END
        END AS valores_nuevos
        
    FROM ofertas.historial_oferta ho 
    LEFT JOIN seguridad.seguridad s ON ho.id_seguridad = s.id_seguridad 
    WHERE ho.id_oferta = v_id_oferta 
    ORDER BY ho.fecha_hora DESC;
END;
$$;


ALTER FUNCTION ofertas.fn_obtener_trazabilidad_oferta(p_json json) OWNER TO "adminAzure";

--
-- Name: fn_reporte_ofertas_laborales(integer, integer, integer, integer, date, date, numeric, numeric, character varying); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.fn_reporte_ofertas_laborales(p_id_ciudad integer DEFAULT NULL::integer, p_id_categoria integer DEFAULT NULL::integer, p_id_modalidad integer DEFAULT NULL::integer, p_id_jornada integer DEFAULT NULL::integer, p_fecha_inicio date DEFAULT NULL::date, p_fecha_fin date DEFAULT NULL::date, p_salario_min numeric DEFAULT NULL::numeric, p_salario_max numeric DEFAULT NULL::numeric, p_estado_oferta character varying DEFAULT NULL::character varying) RETURNS TABLE(id_oferta bigint, titulo character varying, nombre_empresa text, nombre_provincia character varying, nombre_ciudad character varying, nombre_modalidad character varying, nombre_jornada character varying, nombre_categoria character varying, salario_min numeric, salario_max numeric, cantidad_vacantes integer, experiencia_minima integer, fecha_inicio date, fecha_cierre date, estado_oferta character varying, fecha_creacion timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Validación de rango salarial
    IF p_salario_min IS NOT NULL
       AND p_salario_max IS NOT NULL
       AND p_salario_max < p_salario_min THEN
        RAISE EXCEPTION 'El salario máximo no puede ser menor al salario mínimo';
    END IF;

    -- Validación de rango de fechas
    IF p_fecha_inicio IS NOT NULL
       AND p_fecha_fin IS NOT NULL
       AND p_fecha_fin < p_fecha_inicio THEN
        RAISE EXCEPTION 'La fecha fin no puede ser anterior a la fecha inicio';
    END IF;

    RETURN QUERY
    SELECT
        o.id_oferta,
        o.titulo,
        (u.nombre || ' ' || u.apellido)::TEXT   AS nombre_empresa,
        prov.nombre_provincia,
        c.nombre_ciudad,
        mo.nombre_modalidad,
        jo.nombre_jornada,
        co.nombre_categoria,
        o.salario_min,
        o.salario_max,
        o.cantidad_vacantes,
        o.experiencia_minima,
        o.fecha_inicio,
        o.fecha_cierre,
        o.estado_oferta,
        o.fecha_creacion
    FROM ofertas.oferta_laboral o
    -- ✅ INNER JOIN solo en empresa y usuario — son obligatorios
    INNER JOIN empresas.usuario_empresa   ue  ON o.id_empresa    = ue.id_empresa
    INNER JOIN usuarios.usuario           u   ON ue.id_usuario   = u.id_usuario
    -- ✅ CORREGIDO: LEFT JOIN en todo lo demás — pueden ser NULL en los datos
    LEFT  JOIN catalogos.ciudad           c   ON o.id_ciudad     = c.id_ciudad
    LEFT  JOIN catalogos.provincia        prov ON c.id_provincia = prov.id_provincia
    LEFT  JOIN catalogos.modalidad_oferta mo  ON o.id_modalidad  = mo.id_modalidad
    LEFT  JOIN catalogos.jornada_oferta   jo  ON o.id_jornada    = jo.id_jornada
    LEFT  JOIN catalogos.categoria_oferta co  ON o.id_categoria  = co.id_categoria
    WHERE
        (p_id_ciudad     IS NULL OR o.id_ciudad     = p_id_ciudad)
        AND (p_id_categoria  IS NULL OR o.id_categoria  = p_id_categoria)
        AND (p_id_modalidad  IS NULL OR o.id_modalidad  = p_id_modalidad)
        AND (p_id_jornada    IS NULL OR o.id_jornada    = p_id_jornada)
        AND (p_estado_oferta IS NULL OR o.estado_oferta = p_estado_oferta)
        AND (p_fecha_inicio  IS NULL OR o.fecha_inicio  >= p_fecha_inicio)
        AND (p_fecha_fin     IS NULL OR o.fecha_inicio  <= p_fecha_fin)
        AND (p_salario_min   IS NULL OR o.salario_min   >= p_salario_min)
        AND (p_salario_max   IS NULL OR o.salario_max   <= p_salario_max)
    ORDER BY o.fecha_creacion DESC;
END;
$$;


ALTER FUNCTION ofertas.fn_reporte_ofertas_laborales(p_id_ciudad integer, p_id_categoria integer, p_id_modalidad integer, p_id_jornada integer, p_fecha_inicio date, p_fecha_fin date, p_salario_min numeric, p_salario_max numeric, p_estado_oferta character varying) OWNER TO "adminAzure";

--
-- Name: listar_ofertas_por_estado(character varying); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.listar_ofertas_por_estado(p_estado character varying) RETURNS TABLE(id_oferta bigint, titulo character varying, descripcion text, fecha_inicio date, fecha_cierre date, salario_min numeric, salario_max numeric, cantidad_vacantes integer, id_empresa bigint, nombre_empresa text, correo character varying, ruc_empresa character varying, nombre_ciudad character varying, nombre_modalidad character varying, nombre_jornada character varying, nombre_categoria character varying)
    LANGUAGE plpgsql
    AS $$
begin
    return query 
    select 
        ol.id_oferta,
        ol.titulo,
        ol.descripcion,
        ol.fecha_inicio,
        ol.fecha_cierre,
        ol.salario_min,
        ol.salario_max,
        ol.cantidad_vacantes,
        ue.id_empresa,
        (u.nombre || ' ' || u.apellido) as nombre_empresa,
        u.correo,
        ue.ruc::varchar as ruc_empresa,
        c.nombre_ciudad::varchar,
        m.nombre_modalidad::varchar,
        j.nombre_jornada::varchar,
        cat.nombre_categoria::varchar
    from ofertas.oferta_laboral ol
    inner join empresas.usuario_empresa ue on ol.id_empresa = ue.id_empresa
    inner join usuarios.usuario u on ue.id_usuario = u.id_usuario
    inner join catalogos.ciudad c on ol.id_ciudad = c.id_ciudad
    inner join catalogos.modalidad_oferta m on ol.id_modalidad = m.id_modalidad
    inner join catalogos.jornada_oferta j on ol.id_jornada = j.id_jornada
    inner join catalogos.categoria_oferta cat on ol.id_categoria = cat.id_categoria
    where ol.estado_oferta = p_estado
    order by ol.id_oferta;
end;
$$;


ALTER FUNCTION ofertas.listar_ofertas_por_estado(p_estado character varying) OWNER TO "adminAzure";

--
-- Name: sp_actualizar_oferta_fisica(bigint, integer, integer, integer, integer, character varying, text, numeric, numeric, integer, integer, character varying, date, jsonb, jsonb, text); Type: PROCEDURE; Schema: ofertas; Owner: adminAzure
--

CREATE PROCEDURE ofertas.sp_actualizar_oferta_fisica(IN p_idoferta bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion text, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_estado_oferta character varying, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb, IN p_url_documento text)
    LANGUAGE plpgsql
    AS $$
declare
    v_hab jsonb;
    v_req jsonb;
begin
 
    update ofertas.oferta_laboral
    set id_modalidad = p_idmodalidad,
        id_categoria = p_idcategoria,
        id_jornada = p_idjornada,
        id_ciudad = p_idciudad,
        titulo = p_titulo,
        descripcion = p_descripcion,
        salario_min = p_salario_min,
        salario_max = p_salario_max,
        cantidad_vacantes = p_cantidad_vacantes,
        experiencia_minima = p_experiencia_minima,
        estado_oferta = p_estado_oferta,
        fecha_cierre = p_fecha_cierre,
        url_documento_fisico = coalesce(p_url_documento, url_documento_fisico) 
    where id_oferta = p_idoferta;


    delete from ofertas.oferta_habilidad_seleccionada where id_oferta = p_idoferta;
    if p_habilidades is not null then
        for v_hab in select * from jsonb_array_elements(p_habilidades)
        loop
            insert into ofertas.oferta_habilidad_seleccionada (id_oferta, id_habilidad, nivel_requerido, es_obligatorio)
            values (p_idoferta, (v_hab->>'idHabilidad')::integer, v_hab->>'nivelRequerido', (v_hab->>'esObligatorio')::boolean);
        end loop;
    end if;


    delete from ofertas.requisito_manual where id_oferta = p_idoferta;
    if p_requisitos_manuales is not null then
        for v_req in select * from jsonb_array_elements(p_requisitos_manuales)
        loop
            insert into ofertas.requisito_manual (id_oferta, descripcion)
            values (p_idoferta, v_req->>'descripcion');
        end loop;
    end if;
end;
$$;


ALTER PROCEDURE ofertas.sp_actualizar_oferta_fisica(IN p_idoferta bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion text, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_estado_oferta character varying, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb, IN p_url_documento text) OWNER TO "adminAzure";

--
-- Name: sp_actualizaroferta(bigint, integer, integer, integer, integer, character varying, character varying, numeric, numeric, integer, integer, character varying, date, jsonb, jsonb); Type: PROCEDURE; Schema: ofertas; Owner: adminAzure
--

CREATE PROCEDURE ofertas.sp_actualizaroferta(IN p_idoferta bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion character varying, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_estado_oferta character varying, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    v_habilidad jsonb;
    v_requisito jsonb;
begin
    update ofertas.oferta_laboral
    set id_modalidad = p_idmodalidad, 
        id_categoria = p_idcategoria, 
        id_jornada = p_idjornada, 
        id_ciudad = p_idciudad, 
        titulo = p_titulo, 
        descripcion = p_descripcion, 
        salario_min = p_salario_min, 
        salario_max = p_salario_max,
        cantidad_vacantes = p_cantidad_vacantes,
        experiencia_minima = p_experiencia_minima,
        fecha_cierre = p_fecha_cierre, 
        estado_oferta = p_estado_oferta
    where id_oferta = p_idoferta; 
    
    delete from ofertas.oferta_habilidad_seleccionada where id_oferta = p_idoferta;

    if p_habilidades is not null and jsonb_array_length(p_habilidades) > 0 then
        for v_habilidad in select * from jsonb_array_elements(p_habilidades)
        loop
            insert into ofertas.oferta_habilidad_seleccionada (
                id_oferta,
                id_habilidad,
                nivel_requerido,
                es_obligatorio
            ) values (
                p_idoferta,
                (v_habilidad->>'idHabilidad')::integer,
                v_habilidad->>'nivelRequerido',
                (v_habilidad->>'esObligatorio')::boolean
            );
        end loop;
    end if;

    delete from ofertas.requisito_manual where id_oferta = p_idoferta;

    if p_requisitos_manuales is not null and jsonb_array_length(p_requisitos_manuales) > 0 then
        for v_requisito in select * from jsonb_array_elements(p_requisitos_manuales)
        loop
            insert into ofertas.requisito_manual (
                id_oferta,
                descripcion,
                fecha_registro
            ) values (
                p_idoferta,
                v_requisito->>'descripcion',
                current_timestamp
            );
        end loop;
    end if;
    
end;
$$;


ALTER PROCEDURE ofertas.sp_actualizaroferta(IN p_idoferta bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion character varying, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_estado_oferta character varying, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb) OWNER TO "adminAzure";

--
-- Name: sp_crear_oferta_fisica(bigint, bigint, integer, integer, integer, integer, character varying, text, numeric, numeric, integer, integer, date, date, jsonb, jsonb, text); Type: PROCEDURE; Schema: ofertas; Owner: adminAzure
--

CREATE PROCEDURE ofertas.sp_crear_oferta_fisica(IN p_idempresa bigint, IN p_idadmin bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion text, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_fecha_inicio date, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb, IN p_url_documento text)
    LANGUAGE plpgsql
    AS $$
declare
    v_idoferta bigint;
    v_hab jsonb;
    v_req jsonb;
begin

    insert into ofertas.oferta_laboral (
        id_empresa, id_modalidad, id_categoria, id_jornada, id_ciudad,
        titulo, descripcion, salario_min, salario_max, cantidad_vacantes,
        experiencia_minima, fecha_inicio, fecha_cierre, estado_oferta,
        es_fisica, url_documento_fisico, fecha_creacion
    ) values (
        p_idempresa, p_idmodalidad, p_idcategoria, p_idjornada, p_idciudad,
        p_titulo, p_descripcion, p_salario_min, p_salario_max, p_cantidad_vacantes,
        p_experiencia_minima, p_fecha_inicio, p_fecha_cierre, 'aprobado',
        true, p_url_documento, current_timestamp
    ) returning id_oferta into v_idoferta;


    if p_habilidades is not null then
        for v_hab in select * from jsonb_array_elements(p_habilidades)
        loop
            insert into ofertas.oferta_habilidad_seleccionada (id_oferta, id_habilidad, nivel_requerido, es_obligatorio)
            values (v_idoferta, (v_hab->>'idHabilidad')::integer, v_hab->>'nivelRequerido', (v_hab->>'esObligatorio')::boolean);
        end loop;
    end if;


    if p_requisitos_manuales is not null then
        for v_req in select * from jsonb_array_elements(p_requisitos_manuales)
        loop
            insert into ofertas.requisito_manual (id_oferta, descripcion)
            values (v_idoferta, v_req->>'descripcion');
        end loop;
    end if;
end;
$$;


ALTER PROCEDURE ofertas.sp_crear_oferta_fisica(IN p_idempresa bigint, IN p_idadmin bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion text, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_fecha_inicio date, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb, IN p_url_documento text) OWNER TO "adminAzure";

--
-- Name: sp_crearoferta(bigint, integer, integer, integer, integer, character varying, character varying, numeric, numeric, integer, integer, date, date, jsonb, jsonb); Type: PROCEDURE; Schema: ofertas; Owner: postgres
--

CREATE PROCEDURE ofertas.sp_crearoferta(IN p_idempresa bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion character varying, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_fecha_inicio date, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    v_id_oferta bigint;
    v_habilidad jsonb;
    v_requisito jsonb;
begin

    insert into ofertas.oferta_laboral (
        id_empresa, 
        id_modalidad, 
        id_categoria, 
        id_jornada, 
        id_ciudad, 
        titulo, 
        descripcion, 
        salario_min, 
        salario_max,
        cantidad_vacantes,
        experiencia_minima,
        fecha_inicio, 
        fecha_cierre, 
        estado_oferta, 
        fecha_creacion
    ) values (
        p_idempresa,
        p_idmodalidad,
        p_idcategoria,
        p_idjornada,
        p_idciudad,
        p_titulo,
        p_descripcion,
        p_salario_min,
        p_salario_max,
        p_cantidad_vacantes,
        p_experiencia_minima,
        p_fecha_inicio,
        p_fecha_cierre,
        'pendiente',
        current_timestamp
    ) returning id_oferta into v_id_oferta;
    
 
    if p_habilidades is not null and jsonb_array_length(p_habilidades) > 0 then
        for v_habilidad in select * from jsonb_array_elements(p_habilidades)
        loop
            insert into ofertas.oferta_habilidad_seleccionada (
                id_oferta,
                id_habilidad,
                nivel_requerido,
                es_obligatorio
            ) values (
                v_id_oferta,
                (v_habilidad->>'idHabilidad')::integer,
                v_habilidad->>'nivelRequerido',
                (v_habilidad->>'esObligatorio')::boolean
            );
        end loop;
    end if;

    if p_requisitos_manuales is not null and jsonb_array_length(p_requisitos_manuales) > 0 then
        for v_requisito in select * from jsonb_array_elements(p_requisitos_manuales)
        loop
            insert into ofertas.requisito_manual (
                id_oferta,
                descripcion,
                fecha_registro
            ) values (
                v_id_oferta,
                v_requisito->>'descripcion',
                current_timestamp
            );
        end loop;
    end if;
    
end;
$$;


ALTER PROCEDURE ofertas.sp_crearoferta(IN p_idempresa bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion character varying, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_fecha_inicio date, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb) OWNER TO postgres;

--
-- Name: sp_toggle_favorita_confirmacion(integer, bigint); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.sp_toggle_favorita_confirmacion(p_id_oferta integer, p_id_usuario bigint) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_favorita INTEGER;
BEGIN

    -- Buscar si ya existe
    SELECT id_favoritas
    INTO v_id_favorita
    FROM ofertas.ofertas_favoritas
    WHERE id_oferta = p_id_oferta
    AND id_usuario = p_id_usuario
    LIMIT 1;

    -- Si no existe → insertar
    IF v_id_favorita IS NULL THEN
        
        INSERT INTO ofertas.ofertas_favoritas
        (id_oferta, id_usuario, estado_fav)
        VALUES (p_id_oferta, p_id_usuario, 'Activo');

        RETURN json_build_object(
            'success', true,
            'mensaje', 'Favorita agregada correctamente'
        );

    END IF;

    -- Si existe → toggle
    UPDATE ofertas.ofertas_favoritas
    SET estado_fav = 
        CASE 
            WHEN estado_fav = 'Activo' THEN 'Inactivo'
            ELSE 'Activo'
        END
    WHERE id_favoritas = v_id_favorita;

    RETURN json_build_object(
        'success', true,
        'mensaje', 'Estado de favorita actualizado'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'mensaje', SQLERRM
        );
END;
$$;


ALTER FUNCTION ofertas.sp_toggle_favorita_confirmacion(p_id_oferta integer, p_id_usuario bigint) OWNER TO "adminAzure";

--
-- Name: sp_toggle_favorita_externa_json(bigint, jsonb); Type: FUNCTION; Schema: ofertas; Owner: adminAzure
--

CREATE FUNCTION ofertas.sp_toggle_favorita_externa_json(p_id_usuario bigint, p_oferta jsonb) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_job_id TEXT;
    v_id_oferta_externa INTEGER;
    v_id_favorita INTEGER;
    v_estado_actual VARCHAR;
    v_accion TEXT;
BEGIN
    v_job_id := NULLIF(TRIM(COALESCE(p_oferta ->> 'jobId', '')), '');
    IF v_job_id IS NULL THEN
        RAISE EXCEPTION 'jobId es obligatorio para guardar una oferta externa';
    END IF;

    INSERT INTO ofertas.oferta_externa_guardada (
        id_oferta_externa_origen,
        titulo,
        nombre_empresa,
        tipo_empleo,
        ciudad,
        estado,
        pais,
        descripcion,
        fecha_publicacion,
        url_aplicar,
        url_google,
        es_remoto
    ) VALUES (
        v_job_id,
        p_oferta ->> 'jobTitle',
        p_oferta ->> 'employerName',
        p_oferta ->> 'jobEmploymentType',
        p_oferta ->> 'jobCity',
        p_oferta ->> 'jobState',
        p_oferta ->> 'jobCountry',
        p_oferta ->> 'jobDescription',
        p_oferta ->> 'jobPostedAt',
        p_oferta ->> 'jobApplyLink',
        p_oferta ->> 'jobGoogleLink',
        COALESCE((p_oferta ->> 'jobIsRemote')::BOOLEAN, FALSE)
    )
    ON CONFLICT (id_oferta_externa_origen)
    DO UPDATE SET
        titulo = EXCLUDED.titulo,
        nombre_empresa = EXCLUDED.nombre_empresa,
        tipo_empleo = EXCLUDED.tipo_empleo,
        ciudad = EXCLUDED.ciudad,
        estado = EXCLUDED.estado,
        pais = EXCLUDED.pais,
        descripcion = EXCLUDED.descripcion,
        fecha_publicacion = EXCLUDED.fecha_publicacion,
        url_aplicar = EXCLUDED.url_aplicar,
        url_google = EXCLUDED.url_google,
        es_remoto = EXCLUDED.es_remoto
    RETURNING id_oferta_externa INTO v_id_oferta_externa;

    SELECT f.id_favoritas, f.estado_fav
      INTO v_id_favorita, v_estado_actual
      FROM ofertas.ofertas_favoritas f
     WHERE f.id_usuario = p_id_usuario
       AND f.id_oferta = v_id_oferta_externa
       AND LOWER(COALESCE(f.origen_oferta, 'interna')) = 'externa'
     ORDER BY f.id_favoritas DESC
     LIMIT 1;

    IF v_id_favorita IS NULL THEN
        INSERT INTO ofertas.ofertas_favoritas(id_usuario, id_oferta, estado_fav, origen_oferta)
        VALUES (p_id_usuario, v_id_oferta_externa, 'Activo', 'Externa');
        v_accion := 'agregada';
    ELSE
        IF LOWER(COALESCE(v_estado_actual, 'inactivo')) = 'activo' THEN
            UPDATE ofertas.ofertas_favoritas
               SET estado_fav = 'Inactivo'
             WHERE id_favoritas = v_id_favorita;
            v_accion := 'eliminada';
        ELSE
            UPDATE ofertas.ofertas_favoritas
               SET estado_fav = 'Activo'
             WHERE id_favoritas = v_id_favorita;
            v_accion := 'agregada';
        END IF;
    END IF;

    RETURN json_build_object(
        'success', TRUE,
        'accion', v_accion,
        'idOferta', v_id_oferta_externa,
        'idOrigenExterna', v_job_id,
        'origen', 'Externa'
    )::TEXT;
END;
$$;


ALTER FUNCTION ofertas.sp_toggle_favorita_externa_json(p_id_usuario bigint, p_oferta jsonb) OWNER TO "adminAzure";

--
-- Name: fn_contar_postulantes_por_ofertas(integer[]); Type: FUNCTION; Schema: postulaciones; Owner: adminAzure
--

CREATE FUNCTION postulaciones.fn_contar_postulantes_por_ofertas(p_ids integer[]) RETURNS TABLE(id_oferta integer, total bigint)
    LANGUAGE sql
    AS $$
    SELECT p.id_oferta, COUNT(*)
    FROM postulaciones.postulacion p
    WHERE p.id_oferta = ANY(p_ids)
    GROUP BY p.id_oferta;
$$;


ALTER FUNCTION postulaciones.fn_contar_postulantes_por_ofertas(p_ids integer[]) OWNER TO "adminAzure";

--
-- Name: fn_datos_notificacion_postulacion(integer); Type: FUNCTION; Schema: postulaciones; Owner: adminAzure
--

CREATE FUNCTION postulaciones.fn_datos_notificacion_postulacion(p_id_postulacion integer) RETURNS TABLE(id_usuario_postulante bigint, titulo_oferta character varying, nombre_empresa text, correo_empresa character varying)
    LANGUAGE sql
    AS $$
    SELECT
        p.id_usuario,
        o.titulo,
        u.nombre || ' ' || u.apellido,
		u.correo 
    FROM postulaciones.postulacion p
    JOIN ofertas.oferta_laboral     o  ON p.id_oferta  = o.id_oferta
    JOIN empresas.usuario_empresa   ue ON o.id_empresa = ue.id_empresa
    JOIN usuarios.usuario           u  ON ue.id_usuario = u.id_usuario
    WHERE p.id_postulacion = p_id_postulacion;
$$;


ALTER FUNCTION postulaciones.fn_datos_notificacion_postulacion(p_id_postulacion integer) OWNER TO "adminAzure";

--
-- Name: fn_evaluar_postulacion_general(bigint, character varying, text); Type: FUNCTION; Schema: postulaciones; Owner: adminAzure
--

CREATE FUNCTION postulaciones.fn_evaluar_postulacion_general(p_id_postulacion bigint, p_estado character varying, p_mensaje text) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
    v_id_usuario bigint;
    v_id_oferta bigint;
    v_titulo_oferta varchar;
begin

    update postulaciones.postulacion
    set estado_validacion = p_estado,
        observaciones = p_mensaje
    where id_postulacion = p_id_postulacion
    returning id_usuario, id_oferta into v_id_usuario, v_id_oferta;


end;
$$;


ALTER FUNCTION postulaciones.fn_evaluar_postulacion_general(p_id_postulacion bigint, p_estado character varying, p_mensaje text) OWNER TO "adminAzure";

--
-- Name: fn_listar_mis_postulaciones(bigint); Type: FUNCTION; Schema: postulaciones; Owner: adminAzure
--

CREATE FUNCTION postulaciones.fn_listar_mis_postulaciones(p_id_usuario bigint) RETURNS TABLE(id_postulacion bigint, id_oferta bigint, titulo character varying, descripcion text, cantidad_vacantes integer, experiencia_minima integer, fecha_inicio date, fecha_cierre date, nombre_modalidad character varying, nombre_jornada character varying, nombre_categoria character varying, salario_min numeric, salario_max numeric, estado_validacion character varying, observaciones text, nombre_empresa character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        po.id_postulacion,
        o.id_oferta,
        o.titulo,
        o.descripcion,
        o.cantidad_vacantes,
        o.experiencia_minima,
        o.fecha_inicio,
        o.fecha_cierre,
        m.nombre_modalidad,
        j.nombre_jornada,
        c.nombre_categoria,
        o.salario_min,
        o.salario_max,
        po.estado_validacion,
        po.observaciones,
        u_emp.nombre::character varying AS col_nombre_emp
    FROM postulaciones.postulacion po
    INNER JOIN ofertas.oferta_laboral o    ON o.id_oferta      = po.id_oferta
    LEFT JOIN catalogos.modalidad_oferta m ON m.id_modalidad   = o.id_modalidad
    LEFT JOIN catalogos.jornada_oferta j   ON j.id_jornada     = o.id_jornada
    LEFT JOIN catalogos.categoria_oferta c ON c.id_categoria   = o.id_categoria
    LEFT JOIN empresas.usuario_empresa ue  ON ue.id_empresa    = o.id_empresa
    LEFT JOIN usuarios.usuario u_emp       ON u_emp.id_usuario = ue.id_usuario
    WHERE po.id_usuario = p_id_usuario
      AND po.estado_validacion <> 'cancelada'
    ORDER BY po.fecha_postulacion DESC;
END;
$$;


ALTER FUNCTION postulaciones.fn_listar_mis_postulaciones(p_id_usuario bigint) OWNER TO "adminAzure";

--
-- Name: fn_obtener_categorias_empresa(bigint); Type: FUNCTION; Schema: postulaciones; Owner: adminAzure
--

CREATE FUNCTION postulaciones.fn_obtener_categorias_empresa(p_id_empresa bigint) RETURNS TABLE(nombre_categoria character varying)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select distinct c.nombre_categoria 
    from catalogos.categoria_oferta c 
    join ofertas.oferta_laboral o on c.id_categoria = o.id_categoria 
    where o.id_empresa = p_id_empresa 
    order by c.nombre_categoria asc;
end;
$$;


ALTER FUNCTION postulaciones.fn_obtener_categorias_empresa(p_id_empresa bigint) OWNER TO "adminAzure";

--
-- Name: fn_obtener_perfil_postulante(bigint); Type: FUNCTION; Schema: postulaciones; Owner: adminAzure
--

CREATE FUNCTION postulaciones.fn_obtener_perfil_postulante(p_id_postulacion bigint) RETURNS TABLE(id_usuario bigint, nombre character varying, apellido character varying, correo character varying, telefono character varying, genero character varying, archivo_cv character varying, fecha_postulacion timestamp without time zone, url_foto_perfil character varying, formacion_academica jsonb, experiencia_laboral jsonb, cursos_realizados jsonb, idiomas jsonb, estado_postulacion character varying, mensaje_evaluacion text, porcentaje_match integer, analisis_ia jsonb)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select 
        u.id_usuario, u.nombre, u.apellido, u.correo, u.telefono, u.genero,
        po.archivo_cv, po.fecha_postulacion,
        
        (select i.url_imagen from usuarios.usuario_imagen ui_img
         inner join catalogos.imagen i on i.id_imagen = ui_img.id_imagen
         where ui_img.id_usuario = u.id_usuario order by ui_img.fecha_registro desc limit 1)::varchar as url_foto_perfil,
        
    
(select coalesce(jsonb_agg(jsonb_build_object(
    'id_academico', ep.id_perfil_academico, 
    'facultad', cf.nombre_facultad, 
    'carrera', cca.nombre_carrera,
    'registro_senescyt', ep.numero_registro_senescyt, 
    'fecha_graduacion', ep.fecha_graduacion,
    'estado_v', vd.estado_validacion 
)), '[]'::jsonb)
 from usuarios.perfil_academico ep
 left join catalogos.carrera cca on cca.id_carrera = ep.id_carrera
 left join catalogos.facultad cf on cf.id_facultad = cca.id_facultad
 
 left join usuarios.documentacion_academica da on da.id_perfil_academico = ep.id_perfil_academico
 left join postulaciones.validacion_documentacion vd on vd.id_documentacion = da.id_documentacion 
      and vd.id_postulacion = p_id_postulacion
 where ep.id_usuario = u.id_usuario) as formacion_academica,

        
       
        (select coalesce(jsonb_agg(jsonb_build_object(
            'id_exp_laboral', ue.id_exp_laboral, 
            'empresa', ec.nombre_empresa,
            'fecha_inicio', ue.fecha_inicio, 'fecha_fin', ue.fecha_fin,
            'descripcion', ue.descripcion, 
            'id_ciudad', ue.id_ciudad, 'nombre_ciudad', ciud.nombre_ciudad,
            'id_provincia', prov.id_provincia, 'nombre_provincia', prov.nombre_provincia,
            'archivo_comprobante', ue.archivo_comprobante,
            'estado_v', vel.estado_validacion,
            
          
            'cargos', (
                select coalesce(jsonb_agg(jsonb_build_object(
                    'id_cargo', cc.id_cargo,
                    'nombre_cargo', cc.nombre_cargo
                )), '[]'::jsonb)
                from usuarios.exp_laboral_cargo elc
                inner join catalogos.cargo cc on cc.id_cargo = elc.id_cargo
                where elc.id_exp_laboral = ue.id_exp_laboral
            )
        )), '[]'::jsonb)
         from usuarios.exp_laboral ue
         left join empresas.catalogo_empresa ec on ec.id_empresa_catalogo = ue.id_empresa_catalogo
         left join catalogos.ciudad ciud on ciud.id_ciudad = ue.id_ciudad
         left join catalogos.provincia prov on prov.id_provincia = ciud.id_provincia
         left join postulaciones.validacion_exp_laboral vel on vel.id_exp_laboral = ue.id_exp_laboral and vel.id_postulacion = p_id_postulacion
         where ue.id_usuario = u.id_usuario) as experiencia_laboral,
        
        (select coalesce(jsonb_agg(jsonb_build_object(
            'id_curso', uc.id_curso, 
            'curso', uc.nombre_curso, 'institucion', uc.institucion,
            'duracion_horas', uc.horas_duracion, 'archivo_certificado', uc.archivo_certificado,
            'estado_v', vc.estado_validacion
        )), '[]'::jsonb)
         from usuarios.cursos uc 
         left join postulaciones.validacion_curso vc on vc.id_curso = uc.id_curso and vc.id_postulacion = p_id_postulacion
         where uc.id_usuario = u.id_usuario) as cursos_realizados,
        
        (select coalesce(jsonb_agg(jsonb_build_object(
            'id_usuario_idioma', ui.id_usuario_idioma, 
            'idioma', ci.nombre_idioma, 'nivel', ui.nivel, 'archivo_certificado', ui.archivo_certificado,
            'estado_v', vi.estado_validacion
        )), '[]'::jsonb)
         from usuarios.usuario_idioma ui
         left join catalogos.idioma ci on ci.id_idioma = ui.id_idioma
         left join postulaciones.validacion_idioma vi on vi.id_usuario_idioma = ui.id_usuario_idioma and vi.id_postulacion = p_id_postulacion
         where ui.id_usuario = u.id_usuario) as idiomas,
         
         po.estado_validacion as estado_postulacion,
         po.observaciones as mensaje_evaluacion,
         po.porcentaje_match,    
         po.analisis_ia::jsonb     
        
    from postulaciones.postulacion po
    inner join usuarios.usuario u on u.id_usuario = po.id_usuario
    where po.id_postulacion = p_id_postulacion;
end;
$$;


ALTER FUNCTION postulaciones.fn_obtener_perfil_postulante(p_id_postulacion bigint) OWNER TO "adminAzure";

--
-- Name: fn_obtener_postulantes_por_oferta(bigint); Type: FUNCTION; Schema: postulaciones; Owner: adminAzure
--

CREATE FUNCTION postulaciones.fn_obtener_postulantes_por_oferta(p_id_oferta bigint) RETURNS TABLE(id_postulacion bigint, nombre_completo character varying, profesion character varying, fecha_postulacion timestamp without time zone, estado character varying)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select 
        po.id_postulacion,
        (u.nombre || ' ' || u.apellido)::varchar as nombre_completo,
        coalesce(
            (select cc.nombre_cargo 
             from usuarios.exp_laboral ue 
             inner join usuarios.exp_laboral_cargo elc on elc.id_exp_laboral = ue.id_exp_laboral
             inner join catalogos.cargo cc on cc.id_cargo = elc.id_cargo 
             where ue.id_usuario = u.id_usuario 
             order by ue.fecha_inicio desc 
             limit 1), 
        'profesional')::varchar as profesion,
        po.fecha_postulacion,
        po.estado_validacion::varchar as estado
    from postulaciones.postulacion po
    inner join usuarios.usuario u on u.id_usuario = po.id_usuario
    where po.id_oferta = p_id_oferta
    order by po.fecha_postulacion desc;
end;
$$;


ALTER FUNCTION postulaciones.fn_obtener_postulantes_por_oferta(p_id_oferta bigint) OWNER TO "adminAzure";

--
-- Name: fn_obtener_url_cv(bigint); Type: FUNCTION; Schema: postulaciones; Owner: adminAzure
--

CREATE FUNCTION postulaciones.fn_obtener_url_cv(p_id_postulacion bigint) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_url_cv VARCHAR(500);
BEGIN
    -- Obtener la URL del archivo CV
    SELECT archivo_cv
    INTO v_url_cv
    FROM postulaciones.postulacion
    WHERE id_postulacion = p_id_postulacion;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró la postulación con ID %', p_id_postulacion;
    END IF;
    
    RETURN v_url_cv;
END;
$$;


ALTER FUNCTION postulaciones.fn_obtener_url_cv(p_id_postulacion bigint) OWNER TO "adminAzure";

--
-- Name: fn_reporte_postulaciones(character varying, date, date, integer, integer, integer); Type: FUNCTION; Schema: postulaciones; Owner: adminAzure
--

CREATE FUNCTION postulaciones.fn_reporte_postulaciones(p_estado_validacion character varying DEFAULT NULL::character varying, p_fecha_inicio date DEFAULT NULL::date, p_fecha_fin date DEFAULT NULL::date, p_id_ciudad integer DEFAULT NULL::integer, p_id_categoria integer DEFAULT NULL::integer, p_id_modalidad integer DEFAULT NULL::integer) RETURNS TABLE(id_postulacion bigint, titulo_oferta character varying, nombre_empresa text, nombre_modalidad character varying, nombre_categoria character varying, nombre_ciudad character varying, nombre_postulante text, correo_postulante character varying, fecha_postulacion timestamp without time zone, estado_validacion character varying, observaciones text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Validación de rango de fechas
    IF p_fecha_inicio IS NOT NULL
       AND p_fecha_fin IS NOT NULL
       AND p_fecha_fin < p_fecha_inicio THEN
        RAISE EXCEPTION 'La fecha fin no puede ser anterior a la fecha inicio';
    END IF;

    RETURN QUERY
    SELECT
        p.id_postulacion,
        o.titulo                                        AS titulo_oferta,
        (u_emp.nombre || ' ' || u_emp.apellido)         AS nombre_empresa,
        mo.nombre_modalidad,
        co.nombre_categoria,
        c.nombre_ciudad,
        (u.nombre  || ' ' || u.apellido)                AS nombre_postulante,
        u.correo                                        AS correo_postulante,
        p.fecha_postulacion,
        p.estado_validacion,
        p.observaciones
    FROM postulaciones.postulacion p
    -- Postulante
    INNER JOIN usuarios.usuario u
        ON p.id_usuario = u.id_usuario
    -- Oferta
    INNER JOIN ofertas.oferta_laboral o
        ON p.id_oferta = o.id_oferta
    -- Empresa dueña de la oferta
    INNER JOIN empresas.usuario_empresa ue
        ON o.id_empresa = ue.id_empresa
    -- Usuario que representa la empresa
    -- Alias u_emp para no colisionar con el usuario postulante (u)
    INNER JOIN usuarios.usuario u_emp
        ON ue.id_usuario = u_emp.id_usuario
    -- Catálogos de la oferta
    INNER JOIN catalogos.modalidad_oferta mo
        ON o.id_modalidad = mo.id_modalidad
    INNER JOIN catalogos.categoria_oferta co
        ON o.id_categoria = co.id_categoria
    INNER JOIN catalogos.ciudad c
        ON o.id_ciudad = c.id_ciudad
    WHERE
        (p_estado_validacion IS NULL
            OR p.estado_validacion = p_estado_validacion)
        AND (p_fecha_inicio IS NULL
            OR p.fecha_postulacion::date >= p_fecha_inicio)
        AND (p_fecha_fin IS NULL
            OR p.fecha_postulacion::date <= p_fecha_fin)
        AND (p_id_ciudad IS NULL
            OR o.id_ciudad    = p_id_ciudad)
        AND (p_id_categoria IS NULL
            OR o.id_categoria = p_id_categoria)
        AND (p_id_modalidad IS NULL
            OR o.id_modalidad = p_id_modalidad)
    ORDER BY p.fecha_postulacion DESC;
END;
$$;


ALTER FUNCTION postulaciones.fn_reporte_postulaciones(p_estado_validacion character varying, p_fecha_inicio date, p_fecha_fin date, p_id_ciudad integer, p_id_categoria integer, p_id_modalidad integer) OWNER TO "adminAzure";

--
-- Name: fn_resumen_cursos(bigint); Type: FUNCTION; Schema: postulaciones; Owner: adminAzure
--

CREATE FUNCTION postulaciones.fn_resumen_cursos(p_id_postulacion bigint) RETURNS TABLE(p_nombre character varying, p_archivo character varying, p_estado_v character varying, p_observacion_v text)
    LANGUAGE plpgsql ROWS 10
    AS $$
DECLARE v_id_usuario bigint;
BEGIN
    SELECT po.id_usuario INTO v_id_usuario
    FROM postulaciones.postulacion po
    WHERE po.id_postulacion = p_id_postulacion;

    RETURN QUERY
    SELECT
        uc.nombre_curso::character varying,
        uc.archivo_certificado::character varying,
        vc.estado_validacion::character varying,
        vc.observaciones::text
    FROM usuarios.cursos uc
    LEFT JOIN postulaciones.validacion_curso vc
          ON vc.id_curso       = uc.id_curso
         AND vc.id_postulacion = p_id_postulacion
    WHERE uc.id_usuario = v_id_usuario;
END;
$$;


ALTER FUNCTION postulaciones.fn_resumen_cursos(p_id_postulacion bigint) OWNER TO "adminAzure";

--
-- Name: fn_resumen_experiencia(bigint); Type: FUNCTION; Schema: postulaciones; Owner: adminAzure
--

CREATE FUNCTION postulaciones.fn_resumen_experiencia(p_id_postulacion bigint) RETURNS TABLE(p_nombre character varying, p_archivo character varying, p_estado_v character varying, p_observacion_v text)
    LANGUAGE plpgsql ROWS 10
    AS $$
DECLARE v_id_usuario bigint;
BEGIN
    SELECT po.id_usuario INTO v_id_usuario
    FROM postulaciones.postulacion po
    WHERE po.id_postulacion = p_id_postulacion;

    RETURN QUERY
    SELECT
        (
            COALESCE(string_agg(DISTINCT cc.nombre_cargo, ', '), 'Experiencia') ||
            ' - ' ||
            COALESCE(ec.nombre_empresa, '')
        )::character varying,
        ue_exp.archivo_comprobante::character varying,
        vel.estado_validacion::character varying,
        vel.observaciones::text
    FROM usuarios.exp_laboral ue_exp
    LEFT JOIN usuarios.exp_laboral_cargo elc
           ON elc.id_exp_laboral = ue_exp.id_exp_laboral
          AND COALESCE(elc.estado_registro, 'activo') = 'activo'
    LEFT JOIN catalogos.cargo cc            ON cc.id_cargo            = elc.id_cargo
    LEFT JOIN empresas.catalogo_empresa ec  ON ec.id_empresa_catalogo = ue_exp.id_empresa_catalogo
    LEFT JOIN postulaciones.validacion_exp_laboral vel
          ON vel.id_exp_laboral = ue_exp.id_exp_laboral
         AND vel.id_postulacion = p_id_postulacion
    WHERE ue_exp.id_usuario = v_id_usuario
      AND COALESCE(ue_exp.estado_registro, 'activo') = 'activo'
    GROUP BY ue_exp.id_exp_laboral, ue_exp.archivo_comprobante, vel.estado_validacion, vel.observaciones, ec.nombre_empresa;
END;
$$;


ALTER FUNCTION postulaciones.fn_resumen_experiencia(p_id_postulacion bigint) OWNER TO "adminAzure";

--
-- Name: fn_resumen_formacion(bigint); Type: FUNCTION; Schema: postulaciones; Owner: adminAzure
--

CREATE FUNCTION postulaciones.fn_resumen_formacion(p_id_postulacion bigint) RETURNS TABLE(p_nombre character varying, p_archivo character varying, p_estado_v character varying, p_observacion_v text)
    LANGUAGE plpgsql ROWS 10
    AS $$
DECLARE v_id_usuario bigint;
BEGIN
    SELECT po.id_usuario INTO v_id_usuario
    FROM postulaciones.postulacion po
    WHERE po.id_postulacion = p_id_postulacion;

    RETURN QUERY
    SELECT
        cca.nombre_carrera::character varying,
        da.archivo_titulo::character varying,
        vd.estado_validacion::character varying,
        vd.observaciones::text
    FROM usuarios.perfil_academico ep
    LEFT JOIN catalogos.carrera cca ON cca.id_carrera = ep.id_carrera
    LEFT JOIN usuarios.documentacion_academica da
           ON da.id_perfil_academico = ep.id_perfil_academico
          AND COALESCE(da.estado_registro, 'activo') = 'activo'
    LEFT JOIN postulaciones.validacion_documentacion vd
          ON vd.id_documentacion = da.id_documentacion
         AND vd.id_postulacion   = p_id_postulacion
    WHERE ep.id_usuario = v_id_usuario
      AND COALESCE(ep.estado_registro, 'activo') = 'activo';
END;
$$;


ALTER FUNCTION postulaciones.fn_resumen_formacion(p_id_postulacion bigint) OWNER TO "adminAzure";

--
-- Name: fn_resumen_idiomas(bigint); Type: FUNCTION; Schema: postulaciones; Owner: adminAzure
--

CREATE FUNCTION postulaciones.fn_resumen_idiomas(p_id_postulacion bigint) RETURNS TABLE(p_nombre character varying, p_archivo character varying, p_estado_v character varying, p_observacion_v text)
    LANGUAGE plpgsql ROWS 10
    AS $$
DECLARE v_id_usuario bigint;
BEGIN
    SELECT po.id_usuario INTO v_id_usuario
    FROM postulaciones.postulacion po
    WHERE po.id_postulacion = p_id_postulacion;

    RETURN QUERY
    SELECT
        (ci.nombre_idioma || ' (' || ui_lang.nivel || ')')::character varying,
        ui_lang.archivo_certificado::character varying,
        vi.estado_validacion::character varying,
        vi.observaciones::text
    FROM usuarios.usuario_idioma ui_lang
    LEFT JOIN catalogos.idioma ci ON ci.id_idioma = ui_lang.id_idioma
    LEFT JOIN postulaciones.validacion_idioma vi
          ON vi.id_usuario_idioma = ui_lang.id_usuario_idioma
         AND vi.id_postulacion    = p_id_postulacion
    WHERE ui_lang.id_usuario = v_id_usuario;
END;
$$;


ALTER FUNCTION postulaciones.fn_resumen_idiomas(p_id_postulacion bigint) OWNER TO "adminAzure";

--
-- Name: fn_resumen_perfil_base(bigint); Type: FUNCTION; Schema: postulaciones; Owner: adminAzure
--

CREATE FUNCTION postulaciones.fn_resumen_perfil_base(p_id_postulacion bigint) RETURNS TABLE(p_nombre character varying, p_apellido character varying, p_correo character varying, p_url_foto_perfil character varying, p_archivo_cv character varying, p_fecha_postulacion timestamp without time zone, p_estado_postulacion character varying, p_mensaje_evaluacion text, p_nombre_empresa character varying)
    LANGUAGE plpgsql ROWS 1
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.nombre::character varying,
        u.apellido::character varying,
        u.correo::character varying,
        (SELECT i.url_imagen
         FROM usuarios.usuario_imagen ui_img
         INNER JOIN catalogos.imagen i ON i.id_imagen = ui_img.id_imagen
         WHERE ui_img.id_usuario = u.id_usuario
         ORDER BY ui_img.fecha_registro DESC LIMIT 1)::character varying,
        po.archivo_cv::character varying,
        po.fecha_postulacion,
        po.estado_validacion::character varying,
        po.observaciones::text,
        u_emp.nombre::character varying
    FROM postulaciones.postulacion po
    INNER JOIN usuarios.usuario u          ON u.id_usuario     = po.id_usuario
    LEFT JOIN ofertas.oferta_laboral o     ON o.id_oferta      = po.id_oferta
    LEFT JOIN empresas.usuario_empresa ue  ON ue.id_empresa    = o.id_empresa
    LEFT JOIN usuarios.usuario u_emp       ON u_emp.id_usuario = ue.id_usuario
    WHERE po.id_postulacion = p_id_postulacion;
END;
$$;


ALTER FUNCTION postulaciones.fn_resumen_perfil_base(p_id_postulacion bigint) OWNER TO "adminAzure";

--
-- Name: fn_validar_item_individual(bigint, character varying, integer, character varying, text); Type: FUNCTION; Schema: postulaciones; Owner: adminAzure
--

CREATE FUNCTION postulaciones.fn_validar_item_individual(p_id_postulacion bigint, p_tipo_item character varying, p_id_item integer, p_estado character varying, p_observacion text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_documento_real integer;
BEGIN
    if p_tipo_item = 'experiencia' then
        insert into postulaciones.validacion_exp_laboral (id_postulacion, id_exp_laboral, estado_validacion, observaciones, fecha_revision)
        values (p_id_postulacion, p_id_item, p_estado, p_observacion, current_date);
        
    elsif p_tipo_item = 'curso' then
        insert into postulaciones.validacion_curso (id_postulacion, id_curso, estado_validacion, observaciones, fecha_revision)
        values (p_id_postulacion, p_id_item, p_estado, p_observacion, current_timestamp);
        
    elsif p_tipo_item = 'idioma' then
        insert into postulaciones.validacion_idioma (id_postulacion, id_usuario_idioma, estado_validacion, observaciones, fecha_revision)
        values (p_id_postulacion, p_id_item, p_estado, p_observacion, current_timestamp);
        
    elsif p_tipo_item = 'documentacion' then
        
        SELECT id_documentacion INTO v_id_documento_real
        FROM usuarios.documentacion_academica
        WHERE id_perfil_academico = p_id_item
        LIMIT 1;

        IF v_id_documento_real IS NULL THEN
            RAISE EXCEPTION 'El perfil académico % no tiene un archivo PDF asociado para validar.', p_id_item;
        END IF;

        insert into postulaciones.validacion_documentacion (id_postulacion, id_documentacion, estado_validacion, observaciones, fecha_revision)
        values (p_id_postulacion, v_id_documento_real, p_estado, p_observacion, current_timestamp);
        
    end if;
END;
$$;


ALTER FUNCTION postulaciones.fn_validar_item_individual(p_id_postulacion bigint, p_tipo_item character varying, p_id_item integer, p_estado character varying, p_observacion text) OWNER TO "adminAzure";

--
-- Name: sp_cancelar_postulacion(bigint); Type: PROCEDURE; Schema: postulaciones; Owner: adminAzure
--

CREATE PROCEDURE postulaciones.sp_cancelar_postulacion(IN p_id_postulacion bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Actualizar el estado de la postulación
    UPDATE postulaciones.postulacion
    SET estado_validacion = 'Cancelada'
    WHERE id_postulacion = p_id_postulacion;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró la postulación con ID %', p_id_postulacion;
    END IF;
    
    RAISE NOTICE 'Postulación % cancelada exitosamente', p_id_postulacion;
END;
$$;


ALTER PROCEDURE postulaciones.sp_cancelar_postulacion(IN p_id_postulacion bigint) OWNER TO "adminAzure";

--
-- Name: sp_registrar_postulacion(bigint, bigint, character varying, integer, text); Type: PROCEDURE; Schema: postulaciones; Owner: adminAzure
--

CREATE PROCEDURE postulaciones.sp_registrar_postulacion(IN p_id_usuario bigint, IN p_id_oferta bigint, IN p_url_cv character varying, IN p_porcentaje_match integer, IN p_analisis_ia text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO postulaciones.postulacion (
        id_usuario, id_oferta, archivo_cv, estado_validacion, porcentaje_match, analisis_ia
    ) VALUES (
        p_id_usuario, p_id_oferta, p_url_cv, 'Pendiente', p_porcentaje_match, p_analisis_ia::jsonb -- LO CONVERTIMOS AQUÍ
    );
END;
$$;


ALTER PROCEDURE postulaciones.sp_registrar_postulacion(IN p_id_usuario bigint, IN p_id_oferta bigint, IN p_url_cv character varying, IN p_porcentaje_match integer, IN p_analisis_ia text) OWNER TO "adminAzure";

--
-- Name: sp_obtenerofertamayorsalario(integer); Type: PROCEDURE; Schema: public; Owner: adminAzure
--

CREATE PROCEDURE public.sp_obtenerofertamayorsalario(IN pid_empresa integer, OUT p_oferta_nombre text, OUT p_detalles text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    SELECT 
        ol.titulo,
        CONCAT(
            'Oferta: ', ol.titulo, 
            ' | Empresa ID: ', e.id_empresa, 
            ' | Ciudad: ', c.nombre_ciudad, 
            ' | Provincia: ', p.nombre_provincia, 
            ' | Salario: ', ol.salario_promedio, 
            ' | Cierre: ', ol.fecha_cierre
        )
    INTO p_oferta_nombre, p_detalles -- Asignamos directamente a los parámetros de salida
    FROM 
        public.oferta_laboral ol
    JOIN 
        public.usuario_empresa e ON ol.id_empresa = e.id_empresa
    JOIN 
        public.ciudad c ON ol.id_ciudad = c.id_ciudad
    JOIN 
        public.provincia p ON c.id_provincia = p.id_provincia
    WHERE 
        e.id_empresa = pid_empresa
    ORDER BY ol.salario_promedio DESC
    LIMIT 1;

    -- Opcional: Para verificar en la consola de la BD
    RAISE NOTICE 'Oferta encontrada: %', p_oferta_nombre;
END;
$$;


ALTER PROCEDURE public.sp_obtenerofertamayorsalario(IN pid_empresa integer, OUT p_oferta_nombre text, OUT p_detalles text) OWNER TO "adminAzure";

--
-- Name: sp_registrar_usuario_google(json); Type: PROCEDURE; Schema: public; Owner: adminAzure
--

CREATE PROCEDURE public.sp_registrar_usuario_google(IN p_datos json)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_nombre     character varying := p_datos->>'nombre';
    v_apellido   character varying := p_datos->>'apellido';
    v_correo     character varying := p_datos->>'correo';
    v_foto_url   text              := p_datos->>'foto_url';
    v_id_rol     integer           := COALESCE((p_datos->>'id_rol')::integer, 3);
    v_id_usuario bigint;
    v_id_imagen  integer;
BEGIN
    -- 1. Insertar usuario
    INSERT INTO usuarios.usuario(nombre, apellido, correo, contrasena, id_rol)
    VALUES (v_nombre, v_apellido, v_correo, 'GOOGLE_AUTH', v_id_rol)
    RETURNING id_usuario INTO v_id_usuario;

    -- 2. Guardar la foto solo si viene en el JSON
    IF v_foto_url IS NOT NULL THEN
        INSERT INTO catalogos.imagen(url_imagen)
        VALUES (v_foto_url)
        RETURNING id_imagen INTO v_id_imagen;

        INSERT INTO usuarios.usuario_imagen(id_usuario, id_imagen)
        VALUES (v_id_usuario, v_id_imagen);
    END IF;
END;
$$;


ALTER PROCEDURE public.sp_registrar_usuario_google(IN p_datos json) OWNER TO "adminAzure";

--
-- Name: fn_auditoria_catalogos(); Type: FUNCTION; Schema: seguridad; Owner: adminAzure
--

CREATE FUNCTION seguridad.fn_auditoria_catalogos() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_id_seguridad INTEGER;
    v_user_real TEXT;
    v_id_afectado INTEGER;
    v_data jsonb;
    v_cambios jsonb := NULL; -- ✨ NUEVA VARIABLE PARA GUARDAR LAS DIFERENCIAS
BEGIN
    v_user_real := session_user; 
    SELECT id_seguridad INTO v_id_seguridad 
    FROM seguridad.seguridad 
    WHERE login_name = v_user_real;
    
    IF v_id_seguridad IS NULL THEN v_id_seguridad := 1; END IF;

    IF (TG_OP = 'DELETE') THEN v_data := to_jsonb(OLD); ELSE v_data := to_jsonb(NEW); END IF;

    -- ID dinámico: busca la primera columna que empiece con 'id_'
    SELECT (v_data->>key)::int INTO v_id_afectado
    FROM jsonb_object_keys(v_data) AS key
    WHERE key LIKE 'id_%'
    LIMIT 1;

    v_id_afectado := COALESCE(v_id_afectado, 0);

    -- 🔥 LA MAGIA: Calculamos diferencias solo si es un UPDATE
    IF TG_OP = 'UPDATE' THEN
        SELECT jsonb_object_agg(
            n.key,
            jsonb_build_object('anterior', o.value, 'nuevo', n.value)
        ) INTO v_cambios
        FROM jsonb_each(to_jsonb(NEW)) n
        JOIN jsonb_each(to_jsonb(OLD)) o ON n.key = o.key
        WHERE n.value IS DISTINCT FROM o.value;

        -- Opción pro: Si hicieron un UPDATE pero no cambiaron ningún dato real, 
        -- abortamos la auditoría para no llenar la BD de basura.
        IF v_cambios IS NULL THEN
            RETURN NEW;
        END IF;
    END IF;

    INSERT INTO seguridad.auditoria (
        id_seguridad,
        usuario_db,
        accion,
        tabla_afectada,
        id_registro_afectado,
        datos_anteriores,
        datos_nuevos,
        campos_modificados -- ✨ INSERTAMOS EL NUEVO CAMPO AQUÍ
    ) VALUES (
        v_id_seguridad,
        v_user_real, 
        TG_OP,
        TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
        v_id_afectado, 
        CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
        v_cambios -- ✨ LE PASAMOS LA VARIABLE CON EL JSON
    );

    IF (TG_OP = 'DELETE') THEN RETURN OLD; ELSE RETURN NEW; END IF;

EXCEPTION WHEN OTHERS THEN
    IF (TG_OP = 'DELETE') THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;


ALTER FUNCTION seguridad.fn_auditoria_catalogos() OWNER TO "adminAzure";

--
-- Name: fn_auditoria_general(); Type: FUNCTION; Schema: seguridad; Owner: adminAzure
--

CREATE FUNCTION seguridad.fn_auditoria_general() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_id_seguridad INTEGER;
    v_user_real TEXT;
    v_id_afectado INTEGER;
    v_data jsonb;
    v_cambios jsonb := NULL; -- ✨ NUEVA VARIABLE PARA GUARDAR LAS DIFERENCIAS
BEGIN
    v_user_real := session_user; 

    SELECT id_seguridad INTO v_id_seguridad 
    FROM seguridad.seguridad 
    WHERE login_name = v_user_real;

    IF v_id_seguridad IS NULL THEN v_id_seguridad := 1; END IF;

    -- Capturamos los datos según la operación
    IF (TG_OP = 'DELETE') THEN v_data := to_jsonb(OLD); ELSE v_data := to_jsonb(NEW); END IF;

    -- Búsqueda de IDs (Tal cual lo tenías)
    v_id_afectado := COALESCE(
        (v_data->>'id_usuario')::int,
        (v_data->>'id_empresa')::int,
        (v_data->>'id_oferta')::int,
        (v_data->>'id_auditoria')::int,
        (v_data->>'id_postulacion')::int,
        0 
    );

    -- 🔥 LA MAGIA: Calculamos diferencias solo si es un UPDATE
    IF TG_OP = 'UPDATE' THEN
        SELECT jsonb_object_agg(
            n.key,
            jsonb_build_object('anterior', o.value, 'nuevo', n.value)
        ) INTO v_cambios
        FROM jsonb_each(to_jsonb(NEW)) n
        JOIN jsonb_each(to_jsonb(OLD)) o ON n.key = o.key
        WHERE n.value IS DISTINCT FROM o.value;

        -- Opción pro: Si hicieron un UPDATE pero no cambiaron ningún dato real, 
        -- abortamos la auditoría para no llenar la BD de basura.
        IF v_cambios IS NULL THEN
            RETURN NEW;
        END IF;
    END IF;

    INSERT INTO seguridad.auditoria (
        id_seguridad,
        usuario_db,
        accion,
        tabla_afectada,
        id_registro_afectado,
        datos_anteriores,
        datos_nuevos,
        campos_modificados -- ✨ INSERTAMOS EL NUEVO CAMPO
    ) VALUES (
        v_id_seguridad,
        v_user_real, 
        TG_OP,
        TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
        v_id_afectado, 
        CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
        v_cambios -- ✨ ESTO TENDRÁ EL JSON HERMOSO DE DIFERENCIAS O NULL
    );

    IF (TG_OP = 'DELETE') THEN RETURN OLD; ELSE RETURN NEW; END IF;
EXCEPTION WHEN OTHERS THEN
    -- Si algo falla, el sistema sigue vivo
    IF (TG_OP = 'DELETE') THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;


ALTER FUNCTION seguridad.fn_auditoria_general() OWNER TO "adminAzure";

--
-- Name: fn_auditoria_ofertas(); Type: FUNCTION; Schema: seguridad; Owner: adminAzure
--

CREATE FUNCTION seguridad.fn_auditoria_ofertas() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_id_seguridad INTEGER;
    v_user_real TEXT;
    v_id_afectado INTEGER;
    v_data jsonb;
BEGIN
    v_user_real := session_user; 
    SELECT id_seguridad INTO v_id_seguridad 
    FROM seguridad.seguridad 
    WHERE login_name = v_user_real;
    IF v_id_seguridad IS NULL THEN v_id_seguridad := 1; END IF;

    IF (TG_OP = 'DELETE') THEN v_data := to_jsonb(OLD); ELSE v_data := to_jsonb(NEW); END IF;

    -- Busca el PK específico según la tabla
    v_id_afectado := CASE TG_TABLE_NAME
        WHEN 'oferta_laboral'                THEN COALESCE((v_data->>'id_oferta')::int, 0)
        WHEN 'oferta_habilidad_seleccionada' THEN COALESCE((v_data->>'id_oferta_habilidad')::int, 0)
        WHEN 'ofertas_favoritas'             THEN COALESCE((v_data->>'id_favorita')::int, 0)
        WHEN 'requisito_manual'              THEN COALESCE((v_data->>'id_requisito_manual')::int, 0)
        ELSE 0
    END;

    INSERT INTO seguridad.auditoria (
        id_seguridad,
        usuario_db,
        accion,
        tabla_afectada,
        id_registro_afectado,
        datos_anteriores,
        datos_nuevos
    ) VALUES (
        v_id_seguridad,
        v_user_real, 
        TG_OP,
        TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
        v_id_afectado, 
        CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
    );

    IF (TG_OP = 'DELETE') THEN RETURN OLD; ELSE RETURN NEW; END IF;

EXCEPTION WHEN OTHERS THEN
    IF (TG_OP = 'DELETE') THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;


ALTER FUNCTION seguridad.fn_auditoria_ofertas() OWNER TO "adminAzure";

--
-- Name: fn_auditoria_plantilla_notificacion(); Type: FUNCTION; Schema: seguridad; Owner: adminAzure
--

CREATE FUNCTION seguridad.fn_auditoria_plantilla_notificacion() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_id_seguridad INTEGER;
    v_user_real TEXT;
    v_campos_modificados jsonb := '{}'::jsonb;
    v_datos_anteriores jsonb := NULL;
    v_datos_nuevos jsonb := NULL;
    v_key text;
BEGIN
    -- 1. Obtener el usuario de sesión actual de la BD
    v_user_real := session_user; 
    SELECT id_seguridad INTO v_id_seguridad 
    FROM seguridad.seguridad 
    WHERE login_name = v_user_real;
    
    IF v_id_seguridad IS NULL THEN v_id_seguridad := 1; END IF;

    -- 2. Capturar los JSONs
    IF (TG_OP = 'UPDATE') THEN
        v_datos_anteriores := to_jsonb(OLD);
        v_datos_nuevos := to_jsonb(NEW);

        -- MAGIA: Construir el JSON exacto que tu backend de Spring Boot espera
        -- Formato: {"titulo": {"anterior": "viejo", "nuevo": "nuevo"}}
        FOR v_key IN SELECT * FROM jsonb_object_keys(v_datos_nuevos)
        LOOP
            IF v_datos_nuevos->v_key IS DISTINCT FROM v_datos_anteriores->v_key THEN
                -- Excluimos la fecha_modificacion porque siempre cambia y ensucia el historial
                IF v_key != 'fecha_modificacion' THEN
                    v_campos_modificados := jsonb_set(
                        v_campos_modificados,
                        array[v_key],
                        jsonb_build_object('anterior', v_datos_anteriores->v_key, 'nuevo', v_datos_nuevos->v_key)
                    );
                END IF;
            END IF;
        END LOOP;

        -- Si no hubo cambios reales, abortar auditoría silenciosamente
        IF v_campos_modificados = '{}'::jsonb THEN
            RETURN NEW;
        END IF;

    ELSIF (TG_OP = 'DELETE') THEN
        v_datos_anteriores := to_jsonb(OLD);
    ELSIF (TG_OP = 'INSERT') THEN
        v_datos_nuevos := to_jsonb(NEW);
    END IF;

    -- 3. Insertar en la tabla auditoria (esquema seguridad)
    INSERT INTO seguridad.auditoria (
        id_seguridad,
        usuario_db,
        accion,
        tabla_afectada,
        id_registro_afectado,
        datos_anteriores,
        datos_nuevos,
        campos_modificados
    ) VALUES (
        v_id_seguridad,
        v_user_real, 
        TG_OP,
        'plantilla_notificacion',
        CASE WHEN TG_OP = 'DELETE' THEN OLD.id_plantilla ELSE NEW.id_plantilla END, 
        v_datos_anteriores,
        v_datos_nuevos,
        CASE WHEN v_campos_modificados = '{}'::jsonb THEN NULL ELSE v_campos_modificados END
    );

    IF (TG_OP = 'DELETE') THEN RETURN OLD; ELSE RETURN NEW; END IF;

EXCEPTION WHEN OTHERS THEN
    -- En caso de error, permitir que la transacción principal continúe
    IF (TG_OP = 'DELETE') THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;


ALTER FUNCTION seguridad.fn_auditoria_plantilla_notificacion() OWNER TO "adminAzure";

--
-- Name: fn_contar_auditorias_hoy(); Type: FUNCTION; Schema: seguridad; Owner: adminAzure
--

CREATE FUNCTION seguridad.fn_contar_auditorias_hoy() RETURNS bigint
    LANGUAGE plpgsql
    AS $$
begin
    return (select count(*) from seguridad.auditoria 
            where cast(fecha_hora as date) = current_date);
end;
$$;


ALTER FUNCTION seguridad.fn_contar_auditorias_hoy() OWNER TO "adminAzure";

--
-- Name: fn_contar_auditorias_total(); Type: FUNCTION; Schema: seguridad; Owner: adminAzure
--

CREATE FUNCTION seguridad.fn_contar_auditorias_total() RETURNS bigint
    LANGUAGE plpgsql
    AS $$
begin
    return (select count(*) from seguridad.auditoria);
end;
$$;


ALTER FUNCTION seguridad.fn_contar_auditorias_total() OWNER TO "adminAzure";

--
-- Name: fn_estadisticas_usuarios(); Type: FUNCTION; Schema: seguridad; Owner: adminAzure
--

CREATE FUNCTION seguridad.fn_estadisticas_usuarios() RETURNS TABLE(total_usuarios bigint, usuarios_activos bigint, administradores bigint, empresas bigint, usuarios_normales bigint, registros_hoy bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)                                                                AS total_usuarios,
        COUNT(*) FILTER (WHERE u.estado_validacion = 'Activo')                 AS usuarios_activos,
        COUNT(*) FILTER (WHERE r.nombre_rol ILIKE '%admin%')                   AS administradores,
        COUNT(*) FILTER (WHERE r.nombre_rol ILIKE '%empresa%')                 AS empresas,
        COUNT(*) FILTER (WHERE r.nombre_rol ILIKE '%postulante%' 
                            OR r.nombre_rol ILIKE '%usuario%')                 AS usuarios_normales,
        COUNT(*) FILTER (WHERE DATE(u.fecha_registro) = CURRENT_DATE)          AS registros_hoy
    FROM usuarios.usuario u
    LEFT JOIN usuarios.roles r ON r.id_rol = u.id_rol;
END;
$$;


ALTER FUNCTION seguridad.fn_estadisticas_usuarios() OWNER TO "adminAzure";

--
-- Name: fn_obtener_auditorias_historico(); Type: FUNCTION; Schema: seguridad; Owner: adminAzure
--

CREATE FUNCTION seguridad.fn_obtener_auditorias_historico() RETURNS TABLE(ano_mes text, cantidad bigint)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select to_char(fecha_hora, 'yyyy-mm') as ano_mes, count(*) as cantidad 
    from seguridad.auditoria 
    where fecha_hora >= '2026-01-01'::date 
    group by to_char(fecha_hora, 'yyyy-mm') 
    order by ano_mes asc;
end;
$$;


ALTER FUNCTION seguridad.fn_obtener_auditorias_historico() OWNER TO "adminAzure";

--
-- Name: fn_obtener_auditorias_top_usuarios_historico(); Type: FUNCTION; Schema: seguridad; Owner: adminAzure
--

CREATE FUNCTION seguridad.fn_obtener_auditorias_top_usuarios_historico() RETURNS TABLE(usuario_db character varying, ano_mes text, conteo bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    WITH top_users AS (
        SELECT a.usuario_db
        FROM seguridad.auditoria a
        WHERE a.fecha_hora >= DATE '2026-01-01'
        GROUP BY a.usuario_db
        ORDER BY COUNT(*) DESC
        LIMIT 5
    )
    SELECT
        a.usuario_db::varchar,
        TO_CHAR(a.fecha_hora, 'YYYY-MM')::text as ano_mes,
        COUNT(*) as conteo
    FROM seguridad.auditoria a
    WHERE a.usuario_db IN (SELECT tu.usuario_db FROM top_users tu)
        AND a.fecha_hora >= DATE '2026-01-01'
    GROUP BY a.usuario_db, TO_CHAR(a.fecha_hora, 'YYYY-MM')
    ORDER BY a.usuario_db, ano_mes;
END;
$$;


ALTER FUNCTION seguridad.fn_obtener_auditorias_top_usuarios_historico() OWNER TO "adminAzure";

--
-- Name: fn_obtener_auditorias_ultimos_7_dias(); Type: FUNCTION; Schema: seguridad; Owner: adminAzure
--

CREATE FUNCTION seguridad.fn_obtener_auditorias_ultimos_7_dias() RETURNS TABLE(fecha date, cantidad bigint)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select cast(fecha_hora as date) as fecha, count(*) as cantidad 
    from seguridad.auditoria 
    where fecha_hora >= current_date - interval '7 days' 
    group by cast(fecha_hora as date) 
    order by fecha asc;
end;
$$;


ALTER FUNCTION seguridad.fn_obtener_auditorias_ultimos_7_dias() OWNER TO "adminAzure";

--
-- Name: fn_obtener_config_sistema(); Type: FUNCTION; Schema: seguridad; Owner: adminAzure
--

CREATE FUNCTION seguridad.fn_obtener_config_sistema() RETURNS TABLE(id_config integer, nombre_aplicativo character varying, descripcion text, logo_url text, correo_soporte character varying, telefono_contacto character varying, direccion_institucion character varying, fecha_creacion timestamp without time zone, fecha_actualizacion timestamp without time zone)
    LANGUAGE sql STABLE
    AS $$
    SELECT id_config, nombre_aplicativo, descripcion, logo_url,
           correo_soporte, telefono_contacto, direccion_institucion,
           fecha_creacion, fecha_actualizacion
    FROM   seguridad.sistema_empresa
    WHERE  id_config = 1;
$$;


ALTER FUNCTION seguridad.fn_obtener_config_sistema() OWNER TO "adminAzure";

--
-- Name: fn_obtener_sesiones(); Type: FUNCTION; Schema: seguridad; Owner: adminAzure
--

CREATE FUNCTION seguridad.fn_obtener_sesiones() RETURNS TABLE(id_sesion bigint, login_name text, fecha_inicio timestamp without time zone, fecha_cierre timestamp without time zone, ip_address character varying, navegador character varying, accion character varying, estado_validacion character varying)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
         s.id_sesion,             
         g.login_name::TEXT, 
         s.fecha_inicio, 
         s.fecha_cierre,
         s.ip_address, 
         s.navegador, 
         s.accion,
         u.estado_validacion      -- 🔥 TRAEMOS EL ESTADO DE LA TABLA USUARIO
  FROM seguridad.sesiones s
  JOIN seguridad.seguridad g ON s.id_seguridad = g.id_seguridad
  JOIN usuarios.usuario u ON g.id_usuario = u.id_usuario -- 🔥 EL INNER JOIN QUE PENSASTE
  ORDER BY s.fecha_inicio DESC;
END;
$$;


ALTER FUNCTION seguridad.fn_obtener_sesiones() OWNER TO "adminAzure";

--
-- Name: fn_obtener_todos_usuarios(); Type: FUNCTION; Schema: seguridad; Owner: adminAzure
--

CREATE FUNCTION seguridad.fn_obtener_todos_usuarios() RETURNS TABLE(id_usuario bigint, nombre text, apellido text, correo text, fecha_registro timestamp without time zone, estado_validacion text, nombre_rol text, ultimo_acceso timestamp without time zone, total_auditorias bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id_usuario,
        u.nombre::text,
        u.apellido::text,
        u.correo::text,
        u.fecha_registro,
        u.estado_validacion::text,
        r.nombre_rol::text,
        s.ultimo_acceso,
        -- Asumo que la tabla 'auditoria' y 'seguridad' sí están en el esquema 'seguridad'
        -- Si no es así, cámbialas también a 'usuarios.'
        (SELECT COUNT(*) FROM seguridad.auditoria a WHERE a.id_seguridad = s.id_seguridad)
    FROM usuarios.usuario u
    INNER JOIN seguridad.seguridad s ON s.id_usuario = u.id_usuario
    INNER JOIN usuarios.roles r ON r.id_rol = u.id_rol; -- <--- CAMBIADO A usuarios.roles
END;
$$;


ALTER FUNCTION seguridad.fn_obtener_todos_usuarios() OWNER TO "adminAzure";

--
-- Name: fn_registrar_sesion(integer, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: seguridad; Owner: adminAzure
--

CREATE FUNCTION seguridad.fn_registrar_sesion(p_id_seguridad integer, p_ip_address character varying, p_navegador character varying, p_dispositivo character varying, p_accion character varying) RETURNS bigint
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_id_sesion bigint; 
BEGIN
    IF p_accion = 'ACTIVA' THEN
        INSERT INTO seguridad.sesiones (id_seguridad, ip_address, navegador, dispositivo, accion, fecha_inicio)
        VALUES (p_id_seguridad, p_ip_address, p_navegador, p_dispositivo, 'ACTIVA', NOW())
        RETURNING id_sesion INTO v_id_sesion;

    ELSIF p_accion = 'CERRADA' THEN
        UPDATE seguridad.sesiones
        SET accion = 'CERRADA', fecha_cierre = NOW()
        WHERE id_seguridad = p_id_seguridad
          AND accion = 'ACTIVA'
        RETURNING id_sesion INTO v_id_sesion; 
    END IF;

    RETURN v_id_sesion; 
END;
$$;


ALTER FUNCTION seguridad.fn_registrar_sesion(p_id_seguridad integer, p_ip_address character varying, p_navegador character varying, p_dispositivo character varying, p_accion character varying) OWNER TO "adminAzure";

--
-- Name: fn_reporte_auditoria_usuario(integer); Type: FUNCTION; Schema: seguridad; Owner: adminAzure
--

CREATE FUNCTION seguridad.fn_reporte_auditoria_usuario(p_id_usuario integer) RETURNS TABLE(id_auditoria integer, usuario_db text, fecha_hora timestamp without time zone, accion text, tabla_afectada text, id_registro_afectado integer, datos_anteriores text, datos_nuevos text, campos_modificados text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id_auditoria,
        a.usuario_db::text,
        a.fecha_hora,
        a.accion::text,
        a.tabla_afectada::text,
        a.id_registro_afectado,
        a.datos_anteriores::text,
        a.datos_nuevos::text,
        a.campos_modificados::text  -- ← AGREGAR
    FROM seguridad.auditoria a
    INNER JOIN seguridad.seguridad s ON s.id_seguridad = a.id_seguridad
    WHERE s.id_usuario = p_id_usuario
    ORDER BY a.fecha_hora DESC;
END;
$$;


ALTER FUNCTION seguridad.fn_reporte_auditoria_usuario(p_id_usuario integer) OWNER TO "adminAzure";

--
-- Name: fn_resumen_auditoria_usuario(integer); Type: FUNCTION; Schema: seguridad; Owner: adminAzure
--

CREATE FUNCTION seguridad.fn_resumen_auditoria_usuario(p_id_usuario integer) RETURNS TABLE(total_acciones integer, ultimo_acceso timestamp without time zone, total_insert integer, total_update integer, total_delete integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER,
        MAX(a.fecha_hora),
        COUNT(*) FILTER (WHERE a.accion = 'INSERT')::INTEGER,
        COUNT(*) FILTER (WHERE a.accion = 'UPDATE')::INTEGER,
        COUNT(*) FILTER (WHERE a.accion = 'DELETE')::INTEGER
    FROM seguridad.auditoria a
    INNER JOIN seguridad.seguridad s ON s.id_seguridad = a.id_seguridad
    WHERE s.id_usuario = p_id_usuario;
END;
$$;


ALTER FUNCTION seguridad.fn_resumen_auditoria_usuario(p_id_usuario integer) OWNER TO "adminAzure";

--
-- Name: registrousuariologin(text, bigint, integer); Type: PROCEDURE; Schema: seguridad; Owner: adminAzure
--

CREATE PROCEDURE seguridad.registrousuariologin(IN p_correo text, IN p_id_usuario bigint, IN p_id_rol integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    clave text;
    grupo text := NULL; -- Lo iniciamos vacío por seguridad
BEGIN
    -- Lógica de asignación de roles y claves
    IF p_id_rol = 3 THEN 
        clave := 'clavepostulante'; 
        grupo := 'grupo_postulante';
    ELSIF p_id_rol = 2 THEN
        clave := 'claveempresa';
        grupo := 'grupo_empresa';
    ELSIF p_id_rol = 1 THEN 
        clave := 'claveadmin';
        grupo := 'grupo_administrador';
    ELSE
        -- ¡AQUÍ ESTÁ LA MAGIA PARA LOS ROLES DINÁMICOS!
        -- Cualquier otro ID (4, 5, 6...) solo recibe una clave para conectarse,
        -- pero NO se le asigna ningún grupo por defecto (grupo queda en NULL).
        clave := 'clavedinamicobase'; 
    END IF;

    -- 1. Creación del usuario a nivel de Base de Datos (Esto se ejecuta SIEMPRE)
    EXECUTE format('CREATE USER %I WITH PASSWORD %L', p_correo, clave);

    -- 2. Asignación de permisos (Solo se ejecuta si le dimos un grupo)
    IF grupo IS NOT NULL THEN
        EXECUTE format('GRANT %I TO %I', grupo, p_correo);
    END IF;

    -- 3. Inserción en la tabla de seguridad (Esquema: seguridad)
    INSERT INTO seguridad.seguridad (id_usuario, login_name, clave_name, ultimo_acceso)
    VALUES (p_id_usuario, p_correo, clave, now());

END;
$$;


ALTER PROCEDURE seguridad.registrousuariologin(IN p_correo text, IN p_id_usuario bigint, IN p_id_rol integer) OWNER TO "adminAzure";

--
-- Name: sp_actualizar_config_sistema(jsonb); Type: PROCEDURE; Schema: seguridad; Owner: adminAzure
--

CREATE PROCEDURE seguridad.sp_actualizar_config_sistema(IN p_datos jsonb)
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE seguridad.sistema_empresa
    SET nombre_aplicativo     = COALESCE(p_datos->>'nombre_aplicativo',     nombre_aplicativo),
        descripcion           = COALESCE(p_datos->>'descripcion',           descripcion),
        correo_soporte        = COALESCE(p_datos->>'correo_soporte',        correo_soporte),
        telefono_contacto     = COALESCE(p_datos->>'telefono_contacto',     telefono_contacto),
        direccion_institucion = COALESCE(p_datos->>'direccion_institucion', direccion_institucion),
        fecha_actualizacion   = CURRENT_TIMESTAMP
    WHERE id_config = 1;
END;
$$;


ALTER PROCEDURE seguridad.sp_actualizar_config_sistema(IN p_datos jsonb) OWNER TO "adminAzure";

--
-- Name: sp_actualizar_logo_sistema(jsonb); Type: PROCEDURE; Schema: seguridad; Owner: adminAzure
--

CREATE PROCEDURE seguridad.sp_actualizar_logo_sistema(IN p_datos jsonb)
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE seguridad.sistema_empresa
    SET logo_url            = p_datos->>'logo_url',
        fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id_config = 1;
END;
$$;


ALTER PROCEDURE seguridad.sp_actualizar_logo_sistema(IN p_datos jsonb) OWNER TO "adminAzure";

--
-- Name: sp_registrar_admin_interno(text, text, text, text, date, text, text, integer, integer); Type: PROCEDURE; Schema: seguridad; Owner: adminAzure
--

CREATE PROCEDURE seguridad.sp_registrar_admin_interno(IN p_nombre text, IN p_apellido text, IN p_contrasena text, IN p_correo text, IN p_fecha_nacimiento date, IN p_genero text, IN p_telefono text, IN p_id_ciudad integer, IN p_id_rol integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Insertamos en usuarios.usuario sin el campo permisos_ui
    INSERT INTO usuarios.usuario (
        nombre, apellido, contrasena, correo, 
        fecha_nacimiento, genero, telefono, 
        id_ciudad, id_rol  
    ) VALUES (
        p_nombre, p_apellido, p_contrasena, p_correo, 
        p_fecha_nacimiento, p_genero, p_telefono, 
        p_id_ciudad, p_id_rol
    );
END;
$$;


ALTER PROCEDURE seguridad.sp_registrar_admin_interno(IN p_nombre text, IN p_apellido text, IN p_contrasena text, IN p_correo text, IN p_fecha_nacimiento date, IN p_genero text, IN p_telefono text, IN p_id_ciudad integer, IN p_id_rol integer) OWNER TO "adminAzure";

--
-- Name: fn_auditar_perfil_postulante(); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_auditar_perfil_postulante() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_id_perfil integer;
    v_id_seguridad integer;
    v_user_real text;
    v_seccion varchar(50);
    v_campos_modificados text := NULL;
    v_old jsonb := NULL;
    v_new jsonb := NULL;
    v_data jsonb;
BEGIN
    -- 1. Identificar sección (nombre de la tabla)
    v_seccion := UPPER(TG_TABLE_NAME);

    -- 2. Obtener el ID de Seguridad basado en el usuario de BD actual
    v_user_real := session_user; 
    
    SELECT id_seguridad INTO v_id_seguridad 
    FROM seguridad.seguridad 
    WHERE login_name = v_user_real;
    
    IF v_id_seguridad IS NULL THEN v_id_seguridad := 1; END IF;

    -- 3. Capturar JSON principal según la operación
    IF (TG_OP = 'DELETE') THEN 
        v_data := to_jsonb(OLD); 
    ELSE 
        v_data := to_jsonb(NEW); 
    END IF;

    -- 4. Obtener el id_perfil_academico de forma dinámica
    -- Si la tabla tiene id_perfil_academico directo, lo tomamos:
    v_id_perfil := (v_data->>'id_perfil_academico')::integer;
    
    -- MAGIA: Si la tabla (como experiencia o idiomas) no tiene id_perfil_academico
    -- pero sí tiene id_usuario, buscamos automáticamente a qué perfil le pertenece:
    IF v_id_perfil IS NULL AND (v_data->>'id_usuario') IS NOT NULL THEN
        SELECT id_perfil_academico INTO v_id_perfil
        FROM usuarios.perfil_academico
        WHERE id_usuario = (v_data->>'id_usuario')::bigint
        LIMIT 1;
    END IF;

    -- 5. Capturar los cambios exactos (Lógica JSONB)
    IF (TG_OP = 'DELETE') THEN
        v_old := to_jsonb(OLD);
        v_campos_modificados := 'ELIMINACION DE REGISTRO';
        
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Extraer solo los campos que cambiaron
        SELECT 
            string_agg(k, ', '),
            jsonb_object_agg(k, to_jsonb(OLD)->k),
            jsonb_object_agg(k, to_jsonb(NEW)->k)
        INTO v_campos_modificados, v_old, v_new
        FROM jsonb_object_keys(to_jsonb(NEW)) k
        WHERE to_jsonb(NEW)->k IS DISTINCT FROM to_jsonb(OLD)->k;
        
        -- Si disparan un UPDATE pero sin cambiar datos reales, ignoramos
        IF v_campos_modificados IS NULL THEN
            RETURN NEW;
        END IF;
        
    ELSE -- INSERT
        v_new := to_jsonb(NEW);
        v_campos_modificados := 'NUEVO REGISTRO CREADO';
    END IF;

    -- 6. Insertar en el historial (Solo si logramos encontrar a qué perfil pertenece)
    IF v_id_perfil IS NOT NULL THEN
        INSERT INTO usuarios.historial_postulante (
            id_perfil_academico, id_seguridad, seccion, accion, campos_modificados, valores_anteriores, valores_nuevos
        ) VALUES (
            v_id_perfil, v_id_seguridad, v_seccion, TG_OP, v_campos_modificados, v_old, v_new
        );
    END IF;

    -- 7. Retornar la operación para que Postgres termine su trabajo
    IF (TG_OP = 'DELETE') THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;


ALTER FUNCTION usuarios.fn_auditar_perfil_postulante() OWNER TO "adminAzure";

--
-- Name: fn_buscar_empresas(character varying); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_buscar_empresas(p_termino character varying) RETURNS TABLE(id_empresa integer, nombre_empresa character varying, ruc character varying)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select e.id_empresa, 
           e.nombre_empresa, 
           e.ruc
    from usuarios.empresa e
    inner join usuarios.usuario u on u.id_usuario = e.id_usuario
    where (lower(e.nombre_empresa) like lower(concat('%', p_termino, '%'))
       or e.ruc like concat('%', p_termino, '%'))
      and lower(u.estado) = 'aprobado'
    order by e.nombre_empresa asc
    limit 10;
end;
$$;


ALTER FUNCTION usuarios.fn_buscar_empresas(p_termino character varying) OWNER TO "adminAzure";

--
-- Name: fn_contar_no_leidas(bigint); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_contar_no_leidas(p_id_usuario bigint) RETURNS bigint
    LANGUAGE sql
    AS $$
    SELECT COUNT(*)
    FROM usuarios.notificacion
    WHERE id_usuario = p_id_usuario
      AND leida = false;
$$;


ALTER FUNCTION usuarios.fn_contar_no_leidas(p_id_usuario bigint) OWNER TO "adminAzure";

--
-- Name: fn_contar_notificaciones_empresa(bigint); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_contar_notificaciones_empresa(p_id_empresa bigint) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
begin
    return (select count(*) from usuarios.notificacion n 
            inner join empresas.usuario_empresa ue on n.id_usuario = ue.id_usuario 
            where ue.id_empresa = p_id_empresa);
end;
$$;


ALTER FUNCTION usuarios.fn_contar_notificaciones_empresa(p_id_empresa bigint) OWNER TO "adminAzure";

--
-- Name: fn_contar_notificaciones_empresa_hoy(bigint); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_contar_notificaciones_empresa_hoy(p_id_empresa bigint) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
begin
    return (select count(*) from usuarios.notificacion n 
            inner join empresas.usuario_empresa ue on n.id_usuario = ue.id_usuario 
            where ue.id_empresa = p_id_empresa 
            and cast(n.fecha_creacion as date) = current_date);
end;
$$;


ALTER FUNCTION usuarios.fn_contar_notificaciones_empresa_hoy(p_id_empresa bigint) OWNER TO "adminAzure";

--
-- Name: fn_contar_notificaciones_no_leidas(bigint); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_contar_notificaciones_no_leidas(p_id_usuario bigint) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
begin
    return (select count(*) from usuarios.notificacion 
            where id_usuario = p_id_usuario and leida = false);
end;
$$;


ALTER FUNCTION usuarios.fn_contar_notificaciones_no_leidas(p_id_usuario bigint) OWNER TO "adminAzure";

--
-- Name: fn_contar_notificaciones_no_leidas_hoy(bigint); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_contar_notificaciones_no_leidas_hoy(p_id_usuario bigint) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
begin
    return (select count(*) from usuarios.notificacion 
            where id_usuario = p_id_usuario and leida = false 
            and cast(fecha_creacion as date) = current_date);
end;
$$;


ALTER FUNCTION usuarios.fn_contar_notificaciones_no_leidas_hoy(p_id_usuario bigint) OWNER TO "adminAzure";

--
-- Name: fn_contar_usuarios_hoy(); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_contar_usuarios_hoy() RETURNS bigint
    LANGUAGE plpgsql
    AS $$
begin
    return (select count(*) from usuarios.usuario 
            where cast(fecha_registro as date) = current_date);
end;
$$;


ALTER FUNCTION usuarios.fn_contar_usuarios_hoy() OWNER TO "adminAzure";

--
-- Name: fn_eliminar_item_perfil(bigint, character varying, integer); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_eliminar_item_perfil(p_id_usuario bigint, p_tipo_item character varying, p_id_item integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
   
   if p_tipo_item = 'academico' then
   
        if exists (
            select 1 from postulaciones.validacion_documentacion vd
            inner join usuarios.documentacion_academica da on da.id_documentacion = vd.id_documentacion
            where da.id_perfil_academico = p_id_item
        ) then
      
            update usuarios.documentacion_academica set estado_registro = 'inactivo' where id_perfil_academico = p_id_item;
            update usuarios.perfil_academico set estado_registro = 'inactivo' where id_usuario = p_id_usuario and id_perfil_academico = p_id_item;
        else
       
            delete from usuarios.documentacion_academica where id_perfil_academico = p_id_item;
            delete from usuarios.perfil_academico where id_usuario = p_id_usuario and id_perfil_academico = p_id_item;
        end if;

    elsif p_tipo_item = 'idioma' then
  
        if exists (select 1 from postulaciones.validacion_idioma where id_usuario_idioma = p_id_item) then
            update usuarios.usuario_idioma set estado_registro = 'inactivo' where id_usuario = p_id_usuario and id_usuario_idioma = p_id_item;
        else
            delete from usuarios.usuario_idioma where id_usuario = p_id_usuario and id_usuario_idioma = p_id_item;
        end if;
        
    elsif p_tipo_item = 'experiencia' then
        if exists (select 1 from postulaciones.validacion_exp_laboral where id_exp_laboral = p_id_item) then
            update usuarios.exp_laboral set estado_registro = 'inactivo' where id_usuario = p_id_usuario and id_exp_laboral = p_id_item;
        else
            delete from usuarios.exp_laboral_cargo where id_exp_laboral = p_id_item;
            delete from usuarios.exp_laboral where id_usuario = p_id_usuario and id_exp_laboral = p_id_item;
        end if;
        
    elsif p_tipo_item = 'curso' then
 
        if exists (select 1 from postulaciones.validacion_curso where id_curso = p_id_item) then
            update usuarios.cursos set estado_registro = 'inactivo' where id_usuario = p_id_usuario and id_curso = p_id_item;
        else
            delete from usuarios.cursos where id_usuario = p_id_usuario and id_curso = p_id_item;
        end if;
        
    end if;
end;
$$;


ALTER FUNCTION usuarios.fn_eliminar_item_perfil(p_id_usuario bigint, p_tipo_item character varying, p_id_item integer) OWNER TO "adminAzure";

--
-- Name: fn_enlazar_permisos_rol(json); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_enlazar_permisos_rol(p_json_data json) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_rol_app INTEGER;
    v_id_rol_bd VARCHAR;
    v_permisos VARCHAR;
BEGIN
    -- 1. Extraer datos del JSON (el ->> extrae como texto)
    v_id_rol_app := (p_json_data->>'idRolAplicativo')::INTEGER;
    v_id_rol_bd := p_json_data->>'idRolBd';
    v_permisos := p_json_data->>'permisosUi';

    -- 2. Actualizar los permisos en tu tabla de roles
	UPDATE usuarios.roles
	SET permisos_ui = v_permisos,
	    id_rol_bd = v_id_rol_bd  -- ✅ guardamos el nombre del rol BD
	WHERE id_rol = v_id_rol_app;

    -- Nota: Aquí tienes la variable v_id_rol_bd lista por si 
    -- luego necesitas hacer un INSERT en alguna otra tabla de enlace.

    RETURN 'Permisos enlazados correctamente al Rol Aplicativo ID: ' || v_id_rol_app;
    
EXCEPTION WHEN OTHERS THEN
    RETURN 'Error en base de datos: ' || SQLERRM;
END;
$$;


ALTER FUNCTION usuarios.fn_enlazar_permisos_rol(p_json_data json) OWNER TO "adminAzure";

--
-- Name: fn_existe_notificacion_tipo(bigint, character varying); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_existe_notificacion_tipo(p_id_usuario bigint, p_tipo character varying) RETURNS boolean
    LANGUAGE sql
    AS $$
    SELECT EXISTS (
        SELECT 1
        FROM usuarios.notificacion
        WHERE id_usuario = p_id_usuario
          AND tipo       = p_tipo
          AND leida      = false
    );
$$;


ALTER FUNCTION usuarios.fn_existe_notificacion_tipo(p_id_usuario bigint, p_tipo character varying) OWNER TO "adminAzure";

--
-- Name: fn_obtener_notificaciones_activas(bigint); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_obtener_notificaciones_activas(p_id_usuario bigint) RETURNS TABLE(id_notificacion integer, id_usuario bigint, titulo character varying, mensaje text, tipo character varying, icono character varying, enlace character varying, datos jsonb, leida boolean, fecha_creacion timestamp without time zone)
    LANGUAGE sql
    AS $$
SELECT id_notificacion, id_usuario, titulo, mensaje, tipo, icono, enlace, datos, leida, fecha_creacion
FROM usuarios.notificacion
WHERE id_usuario = p_id_usuario
  AND leida = false
  AND fecha_creacion >= CURRENT_DATE - INTERVAL '5 days'
ORDER BY fecha_creacion DESC;
$$;


ALTER FUNCTION usuarios.fn_obtener_notificaciones_activas(p_id_usuario bigint) OWNER TO "adminAzure";

--
-- Name: fn_obtener_notificaciones_empresa_historico(bigint); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_obtener_notificaciones_empresa_historico(p_id_empresa bigint) RETURNS TABLE(ano_mes text, cantidad bigint)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select to_char(n.fecha_creacion, 'yyyy-mm') as ano_mes, count(*) as cantidad 
    from usuarios.notificacion n 
    inner join empresas.usuario_empresa ue on n.id_usuario = ue.id_usuario 
    where ue.id_empresa = p_id_empresa 
    and n.fecha_creacion >= '2026-01-01'::date 
    group by to_char(n.fecha_creacion, 'yyyy-mm') 
    order by ano_mes asc;
end;
$$;


ALTER FUNCTION usuarios.fn_obtener_notificaciones_empresa_historico(p_id_empresa bigint) OWNER TO "adminAzure";

--
-- Name: fn_obtener_notificaciones_empresa_ultimos_7_dias(bigint); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_obtener_notificaciones_empresa_ultimos_7_dias(p_id_empresa bigint) RETURNS TABLE(fecha date, cantidad bigint)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select cast(n.fecha_creacion as date) as fecha, count(*) as cantidad 
    from usuarios.notificacion n 
    inner join empresas.usuario_empresa ue on n.id_usuario = ue.id_usuario 
    where ue.id_empresa = p_id_empresa 
    and n.fecha_creacion >= current_date - interval '7 days' 
    group by cast(n.fecha_creacion as date) 
    order by fecha asc;
end;
$$;


ALTER FUNCTION usuarios.fn_obtener_notificaciones_empresa_ultimos_7_dias(p_id_empresa bigint) OWNER TO "adminAzure";

--
-- Name: fn_obtener_notificaciones_no_leidas_historico(bigint); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_obtener_notificaciones_no_leidas_historico(p_id_usuario bigint) RETURNS TABLE(ano_mes text, cantidad bigint)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select to_char(fecha_creacion, 'yyyy-mm') as ano_mes, count(*) as cantidad 
    from usuarios.notificacion 
    where id_usuario = p_id_usuario and leida = false 
    and fecha_creacion >= '2026-01-01'::date 
    group by to_char(fecha_creacion, 'yyyy-mm') 
    order by ano_mes asc;
end;
$$;


ALTER FUNCTION usuarios.fn_obtener_notificaciones_no_leidas_historico(p_id_usuario bigint) OWNER TO "adminAzure";

--
-- Name: fn_obtener_notificaciones_no_leidas_ultimos_7_dias(bigint); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_obtener_notificaciones_no_leidas_ultimos_7_dias(p_id_usuario bigint) RETURNS TABLE(fecha date, cantidad bigint)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select cast(fecha_creacion as date) as fecha, count(*) as cantidad 
    from usuarios.notificacion 
    where id_usuario = p_id_usuario and leida = false 
    and fecha_creacion >= current_date - interval '7 days' 
    group by cast(fecha_creacion as date) 
    order by fecha asc;
end;
$$;


ALTER FUNCTION usuarios.fn_obtener_notificaciones_no_leidas_ultimos_7_dias(p_id_usuario bigint) OWNER TO "adminAzure";

--
-- Name: fn_obtener_notificaciones_usuario(bigint); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_obtener_notificaciones_usuario(p_id_usuario bigint) RETURNS TABLE(id_notificacion integer, id_usuario bigint, titulo character varying, mensaje text, tipo character varying, icono character varying, enlace character varying, datos jsonb, leida boolean, fecha_creacion timestamp without time zone)
    LANGUAGE sql
    AS $$
    SELECT id_notificacion, id_usuario, titulo, mensaje, tipo, icono, enlace, datos, leida, fecha_creacion
    FROM usuarios.notificacion
    WHERE id_usuario = p_id_usuario
    ORDER BY fecha_creacion DESC;
$$;


ALTER FUNCTION usuarios.fn_obtener_notificaciones_usuario(p_id_usuario bigint) OWNER TO "adminAzure";

--
-- Name: fn_obtener_perfil_profesional(bigint); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_obtener_perfil_profesional(p_id_usuario bigint) RETURNS TABLE(id_usuario bigint, nombre character varying, apellido character varying, correo character varying, telefono character varying, genero character varying, fecha_nacimiento date, id_ciudad integer, id_provincia integer, url_foto_perfil character varying, formacion_academica jsonb, experiencia_laboral jsonb, cursos_realizados jsonb, idiomas jsonb)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select 
        u.id_usuario, u.nombre, u.apellido, u.correo, u.telefono, u.genero, u.fecha_nacimiento, u.id_ciudad::integer,
        (select cu.id_provincia from catalogos.ciudad cu where cu.id_ciudad = u.id_ciudad limit 1)::integer as id_provincia,
        (select i.url_imagen from usuarios.usuario_imagen ui_img
         inner join catalogos.imagen i on i.id_imagen = ui_img.id_imagen
         where ui_img.id_usuario = u.id_usuario order by ui_img.id_usuario_imagen desc limit 1)::varchar as url_foto_perfil,
        
        (select coalesce(jsonb_agg(jsonb_build_object(
            'id_academico', ep.id_perfil_academico, 'id_facultad', cf.id_facultad, 'id_carrera', cca.id_carrera,
            'facultad', cf.nombre_facultad, 'carrera', cca.nombre_carrera, 'registro_senescyt', ep.numero_registro_senescyt, 
            'fecha_graduacion', ep.fecha_graduacion, 'archivo_referencia', da.archivo_titulo
        )), '[]'::jsonb)
         from usuarios.perfil_academico ep
         left join catalogos.carrera cca on cca.id_carrera = ep.id_carrera left join catalogos.facultad cf on cf.id_facultad = cca.id_facultad left join usuarios.documentacion_academica da on da.id_perfil_academico = ep.id_perfil_academico
         where ep.id_usuario = u.id_usuario and ep.estado_registro = 'activo') as formacion_academica,
        
    
        (select coalesce(jsonb_agg(jsonb_build_object(
            'id_exp_laboral', ue.id_exp_laboral, 
            'id_empresa_catalogo', ec.id_empresa_catalogo, 
            'empresa', ec.nombre_empresa,
            'fecha_inicio', ue.fecha_inicio, 
            'fecha_fin', ue.fecha_fin, 
            'descripcion', ue.descripcion, 
            'id_ciudad', ue.id_ciudad, 'nombre_ciudad', ciud.nombre_ciudad,
            'id_provincia', prov.id_provincia, 'nombre_provincia', prov.nombre_provincia,
            'archivo_comprobante', ue.archivo_comprobante,
            

            'cargos', (
                select coalesce(jsonb_agg(jsonb_build_object(
                    'id_cargo', cc.id_cargo,
                    'nombre_cargo', cc.nombre_cargo
                )), '[]'::jsonb)
                from usuarios.exp_laboral_cargo elc
                inner join catalogos.cargo cc on cc.id_cargo = elc.id_cargo
              
                where elc.id_exp_laboral = ue.id_exp_laboral and elc.estado_registro = 'activo'
            )
        )), '[]'::jsonb)
         from usuarios.exp_laboral ue
         left join empresas.catalogo_empresa ec on ec.id_empresa_catalogo = ue.id_empresa_catalogo
         left join catalogos.ciudad ciud on ciud.id_ciudad = ue.id_ciudad left join catalogos.provincia prov on prov.id_provincia = ciud.id_provincia
         where ue.id_usuario = u.id_usuario and ue.estado_registro = 'activo') as experiencia_laboral,
        
        (select coalesce(jsonb_agg(jsonb_build_object(
            'id_curso', uc.id_curso, 'curso', uc.nombre_curso, 'institucion', uc.institucion,
            'duracion_horas', uc.horas_duracion, 'archivo_certificado', uc.archivo_certificado
        )), '[]'::jsonb)
         from usuarios.cursos uc where uc.id_usuario = u.id_usuario and uc.estado_registro = 'activo') as cursos_realizados,
        
        (select coalesce(jsonb_agg(jsonb_build_object(
            'id_usuario_idioma', ui.id_usuario_idioma, 'id_idioma', ci.id_idioma, 'idioma', ci.nombre_idioma, 
            'nivel', ui.nivel, 'archivo_certificado', ui.archivo_certificado
        )), '[]'::jsonb)
         from usuarios.usuario_idioma ui left join catalogos.idioma ci on ci.id_idioma = ui.id_idioma
         where ui.id_usuario = u.id_usuario and ui.estado_registro = 'activo') as idiomas
         
    from usuarios.usuario u
    where u.id_usuario = p_id_usuario;
end;
$$;


ALTER FUNCTION usuarios.fn_obtener_perfil_profesional(p_id_usuario bigint) OWNER TO "adminAzure";

--
-- Name: fn_obtener_perfil_usuario(bigint); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_obtener_perfil_usuario(p_id_usuario bigint) RETURNS TABLE(id_usuario bigint, nombre character varying, apellido character varying, correo character varying, telefono character varying, genero character varying, fecha_nacimiento date, url_imagen text)
    LANGUAGE sql STABLE
    AS $$
    SELECT
        u.id_usuario,
        u.nombre,
        u.apellido,
        u.correo,
        u.telefono,
        u.genero,
        u.fecha_nacimiento,
        (
            SELECT ci.url_imagen
            FROM   usuarios.usuario_imagen  ui
            JOIN   catalogos.imagen         ci ON ci.id_imagen = ui.id_imagen
            WHERE  ui.id_usuario = u.id_usuario
              AND  ci.url_imagen NOT LIKE '/assets/%'
              AND  ci.url_imagen NOT LIKE '%.pdf'
            ORDER  BY ui.fecha_registro DESC
            LIMIT  1
        ) AS url_imagen
    FROM usuarios.usuario u
    WHERE u.id_usuario = p_id_usuario;
$$;


ALTER FUNCTION usuarios.fn_obtener_perfil_usuario(p_id_usuario bigint) OWNER TO "adminAzure";

--
-- Name: fn_obtener_postulantes_auditoria(json); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_obtener_postulantes_auditoria(p_json json) RETURNS TABLE(id_usuario bigint, id_perfil_academico integer, nombre_postulante text, correo character varying, ultima_modificacion timestamp without time zone, total_movimientos bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id_usuario,
        pa.id_perfil_academico,
        (u.nombre || ' ' || u.apellido)::text AS nombre_postulante,
        u.correo,
        MAX(hp.fecha_hora) AS ultima_modificacion,
        COUNT(hp.id_historial)::bigint AS total_movimientos
    FROM usuarios.usuario u
    INNER JOIN usuarios.perfil_academico pa ON u.id_usuario = pa.id_usuario
    LEFT JOIN usuarios.historial_postulante hp ON pa.id_perfil_academico = hp.id_perfil_academico
    WHERE u.id_rol = 3 
    GROUP BY 
        u.id_usuario, 
        pa.id_perfil_academico, 
        u.nombre, 
        u.apellido, 
        u.correo
    ORDER BY ultima_modificacion DESC NULLS LAST;
END;
$$;


ALTER FUNCTION usuarios.fn_obtener_postulantes_auditoria(p_json json) OWNER TO "adminAzure";

--
-- Name: fn_obtener_trazabilidad_postulante(json); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_obtener_trazabilidad_postulante(p_json json) RETURNS TABLE(id_historial bigint, seccion character varying, accion character varying, fecha_hora timestamp without time zone, ejecutor text, campos_modificados text, valores_anteriores jsonb, valores_nuevos jsonb)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_perfil integer;
BEGIN
    v_id_perfil := (p_json->>'id_perfil_academico')::integer;

    RETURN QUERY
    SELECT 
        hp.id_historial,
        hp.seccion, 
        hp.accion,  
        hp.fecha_hora,
        COALESCE(s.login_name, 'Sistema')::text AS ejecutor,
        -- Cambiamos el texto para que no diga "id_carrera" sino "carrera"
        REPLACE(hp.campos_modificados, 'id_carrera', 'carrera') AS campos_modificados,

        -- 1. Inyectar el nombre de la Carrera en los valores ANTERIORES
        CASE 
            WHEN hp.valores_anteriores IS NULL THEN NULL
            WHEN hp.seccion = 'PERFIL_ACADEMICO' AND hp.valores_anteriores ? 'id_carrera' THEN
                hp.valores_anteriores || jsonb_build_object('carrera', COALESCE((SELECT nombre_carrera FROM catalogos.carrera WHERE id_carrera = (hp.valores_anteriores->>'id_carrera')::integer), 'Desconocida'))
            ELSE hp.valores_anteriores
        END AS valores_anteriores,

        -- 2. Inyectar el nombre de la Carrera en los valores NUEVOS
        CASE 
            WHEN hp.valores_nuevos IS NULL THEN NULL
            WHEN hp.seccion = 'PERFIL_ACADEMICO' AND hp.valores_nuevos ? 'id_carrera' THEN
                hp.valores_nuevos || jsonb_build_object('carrera', COALESCE((SELECT nombre_carrera FROM catalogos.carrera WHERE id_carrera = (hp.valores_nuevos->>'id_carrera')::integer), 'Desconocida'))
            ELSE hp.valores_nuevos
        END AS valores_nuevos

    FROM usuarios.historial_postulante hp
    LEFT JOIN seguridad.seguridad s ON hp.id_seguridad = s.id_seguridad
    WHERE hp.id_perfil_academico = v_id_perfil
    ORDER BY hp.fecha_hora DESC;
END;
$$;


ALTER FUNCTION usuarios.fn_obtener_trazabilidad_postulante(p_json json) OWNER TO "adminAzure";

--
-- Name: fn_obtener_url_imagen(bigint); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_obtener_url_imagen(p_id_usuario bigint) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_url text;
BEGIN
    SELECT i.url_imagen INTO v_url
    FROM catalogos.imagen i
    JOIN usuarios.usuario_imagen ui ON i.id_imagen = ui.id_imagen
    WHERE ui.id_usuario = p_id_usuario
    ORDER BY ui.fecha_registro DESC
    LIMIT 1;
    
    RETURN v_url;
END;
$$;


ALTER FUNCTION usuarios.fn_obtener_url_imagen(p_id_usuario bigint) OWNER TO "adminAzure";

--
-- Name: fn_obtener_usuarios_historico(); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_obtener_usuarios_historico() RETURNS TABLE(ano_mes text, cantidad bigint)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select to_char(fecha_registro, 'yyyy-mm') as ano_mes, count(*) as cantidad 
    from usuarios.usuario 
    where fecha_registro >= '2026-01-01'::date 
    group by to_char(fecha_registro, 'yyyy-mm') 
    order by ano_mes asc;
end;
$$;


ALTER FUNCTION usuarios.fn_obtener_usuarios_historico() OWNER TO "adminAzure";

--
-- Name: fn_obtener_usuarios_tabla(json); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_obtener_usuarios_tabla(p_json json) RETURNS TABLE(id_usuario bigint, nombre character varying, correo character varying, telefono character varying, estado_validacion character varying, nombre_ciudad character varying, nombre_rol character varying, url_imagen text)
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Variables para extraer posibles filtros del JSON (opcionales)
    v_estado character varying;
    v_busqueda character varying;
BEGIN
    -- Extraemos los valores del JSON (Si el JSON viene vacío '{}', estas variables serán NULL)
    v_estado := p_json->>'estado';
    v_busqueda := p_json->>'busqueda';

    RETURN QUERY
    SELECT 
        u.id_usuario,
        u.nombre,
        u.correo,
        u.telefono,
        u.estado_validacion,
        c.nombre_ciudad,
        r.nombre_rol,
        (
            SELECT i.url_imagen 
            FROM usuarios.usuario_imagen ui 
            INNER JOIN catalogos.imagen i ON ui.id_imagen = i.id_imagen 
            WHERE ui.id_usuario = u.id_usuario 
            ORDER BY ui.fecha_registro DESC 
            LIMIT 1
        ) AS url_imagen
    FROM usuarios.usuario u
    LEFT JOIN catalogos.ciudad c ON u.id_ciudad = c.id_ciudad
    LEFT JOIN usuarios.roles r ON u.id_rol = r.id_rol
    WHERE 
        -- Si v_estado es nulo, trae todos. Si tiene un valor, filtra por ese estado.
        (v_estado IS NULL OR u.estado_validacion = v_estado)
        AND 
        -- Si v_busqueda es nulo, trae todos. Si tiene un valor, busca coincidencias.
        (v_busqueda IS NULL OR u.nombre ILIKE '%' || v_busqueda || '%' OR u.correo ILIKE '%' || v_busqueda || '%')
    ORDER BY u.id_usuario DESC;
END;
$$;


ALTER FUNCTION usuarios.fn_obtener_usuarios_tabla(p_json json) OWNER TO "adminAzure";

--
-- Name: fn_obtener_usuarios_ultimos_7_dias(); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_obtener_usuarios_ultimos_7_dias() RETURNS TABLE(fecha date, cantidad bigint)
    LANGUAGE plpgsql
    AS $$
begin
    return query
    select cast(fecha_registro as date) as fecha, count(*) as cantidad 
    from usuarios.usuario 
    where fecha_registro >= current_date - interval '7 days' 
    group by cast(fecha_registro as date) 
    order by fecha asc;
end;
$$;


ALTER FUNCTION usuarios.fn_obtener_usuarios_ultimos_7_dias() OWNER TO "adminAzure";

--
-- Name: fn_registrar_item_perfil(bigint, character varying, jsonb, character varying); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_registrar_item_perfil(p_id_usuario bigint, p_tipo_item character varying, p_datos jsonb, p_archivo character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
    v_id_generado integer;
    v_cargo_id jsonb;
begin

    if p_tipo_item = 'experiencia' then
        insert into usuarios.exp_laboral (
            id_usuario, id_empresa_catalogo, fecha_inicio, fecha_fin, 
            descripcion, id_ciudad, archivo_comprobante
        )
        values (
            p_id_usuario, 
            (p_datos->>'id_empresa_catalogo')::integer, 
            (p_datos->>'fecha_inicio')::date, 
            nullif(p_datos->>'fecha_fin', '')::date, 
            p_datos->>'descripcion', 
            (p_datos->>'id_ciudad')::integer, 
            p_archivo
        ) returning id_exp_laboral into v_id_generado; 
        
   
        for v_cargo_id in select * from jsonb_array_elements(p_datos->'cargos_ids')
        loop
            insert into usuarios.exp_laboral_cargo (id_exp_laboral, id_cargo)
            values (v_id_generado, (v_cargo_id#>>'{}')::integer);
        end loop;
        
    elsif p_tipo_item = 'curso' then
        insert into usuarios.cursos (id_usuario, nombre_curso, institucion, horas_duracion, archivo_certificado)
        values (
            p_id_usuario, 
            p_datos->>'nombre_curso', 
            p_datos->>'institucion', 
            (p_datos->>'horas_duracion')::integer, 
            p_archivo
        );
        
    elsif p_tipo_item = 'idioma' then
        insert into usuarios.usuario_idioma (id_usuario, id_idioma, nivel, archivo_certificado, codigo_certificado)
        values (
            p_id_usuario, 
            (p_datos->>'id_idioma')::integer, 
            p_datos->>'nivel', 
            p_archivo,
            p_datos->>'codigo_certificado'
        );
        
    elsif p_tipo_item = 'academico' then
        insert into usuarios.perfil_academico (id_usuario, id_carrera, fecha_graduacion, numero_registro_senescyt)
        values (
            p_id_usuario, 
            (p_datos->>'id_carrera')::integer, 
            (p_datos->>'fecha_graduacion')::date, 
            p_datos->>'registro_senescyt'
        ) returning id_perfil_academico into v_id_generado;

        if p_archivo is not null and p_archivo <> '' then
            insert into usuarios.documentacion_academica (id_perfil_academico, archivo_titulo, fecha_registro)
            values (v_id_generado, p_archivo, current_date);
        end if;

    end if;
end;
$$;


ALTER FUNCTION usuarios.fn_registrar_item_perfil(p_id_usuario bigint, p_tipo_item character varying, p_datos jsonb, p_archivo character varying) OWNER TO "adminAzure";

--
-- Name: fn_ultima_imagen_empresa(bigint); Type: FUNCTION; Schema: usuarios; Owner: adminAzure
--

CREATE FUNCTION usuarios.fn_ultima_imagen_empresa(p_id_empresa bigint) RETURNS text
    LANGUAGE sql STABLE
    AS $$
    SELECT ci.url_imagen
    FROM   empresas.usuario_empresa  ue
    JOIN   usuarios.usuario_imagen   ui  ON ui.id_usuario = ue.id_usuario
    JOIN   catalogos.imagen          ci  ON ci.id_imagen  = ui.id_imagen
    WHERE  ue.id_empresa = p_id_empresa
      AND  ci.url_imagen NOT LIKE '/assets/%'
      AND  ci.url_imagen NOT LIKE '%.pdf'
    ORDER  BY ui.fecha_registro DESC
    LIMIT  1;
$$;


ALTER FUNCTION usuarios.fn_ultima_imagen_empresa(p_id_empresa bigint) OWNER TO "adminAzure";

--
-- Name: sp_actualizar_curso(integer, character varying, character varying, integer, character varying); Type: PROCEDURE; Schema: usuarios; Owner: adminAzure
--

CREATE PROCEDURE usuarios.sp_actualizar_curso(IN p_id_curso integer, IN p_nombre_curso character varying, IN p_institucion character varying, IN p_horas_duracion integer, IN p_archivo character varying)
    LANGUAGE plpgsql
    AS $$
begin
    update usuarios.cursos
    set 
        nombre_curso = p_nombre_curso,
        institucion = p_institucion,
        horas_duracion = p_horas_duracion,
        archivo_certificado = coalesce(nullif(p_archivo, ''), archivo_certificado)
    where id_curso = p_id_curso;
end;
$$;


ALTER PROCEDURE usuarios.sp_actualizar_curso(IN p_id_curso integer, IN p_nombre_curso character varying, IN p_institucion character varying, IN p_horas_duracion integer, IN p_archivo character varying) OWNER TO "adminAzure";

--
-- Name: sp_actualizar_datos_personales(bigint, character varying, character varying, date, character varying, character varying, integer); Type: PROCEDURE; Schema: usuarios; Owner: adminAzure
--

CREATE PROCEDURE usuarios.sp_actualizar_datos_personales(IN p_id_usuario bigint, IN p_nombre character varying, IN p_apellido character varying, IN p_fecha_nacimiento date, IN p_genero character varying, IN p_telefono character varying, IN p_id_ciudad integer)
    LANGUAGE plpgsql
    AS $$
begin
    update usuarios.usuario
    set 
        nombre = p_nombre,
        apellido = p_apellido,
        fecha_nacimiento = p_fecha_nacimiento,
        genero = p_genero,
        telefono = p_telefono,
        id_ciudad = p_id_ciudad
    where id_usuario = p_id_usuario;
end;
$$;


ALTER PROCEDURE usuarios.sp_actualizar_datos_personales(IN p_id_usuario bigint, IN p_nombre character varying, IN p_apellido character varying, IN p_fecha_nacimiento date, IN p_genero character varying, IN p_telefono character varying, IN p_id_ciudad integer) OWNER TO "adminAzure";

--
-- Name: sp_actualizar_experiencia(integer, integer, date, date, text, integer, character varying, text); Type: PROCEDURE; Schema: usuarios; Owner: adminAzure
--

CREATE PROCEDURE usuarios.sp_actualizar_experiencia(IN p_id_exp_laboral integer, IN p_id_empresa_catalogo integer, IN p_fecha_inicio date, IN p_fecha_fin date, IN p_descripcion text, IN p_id_ciudad integer, IN p_archivo character varying, IN p_cargos_ids text)
    LANGUAGE plpgsql
    AS $$
declare
    v_cargo_id jsonb;
begin
    update usuarios.exp_laboral
    set 
        id_empresa_catalogo = p_id_empresa_catalogo,
        fecha_inicio = p_fecha_inicio,
        fecha_fin = p_fecha_fin,
        descripcion = p_descripcion,
        id_ciudad = p_id_ciudad,
        archivo_comprobante = coalesce(nullif(p_archivo, ''), archivo_comprobante)
    where id_exp_laboral = p_id_exp_laboral;

    delete from usuarios.exp_laboral_cargo
    where id_exp_laboral = p_id_exp_laboral;

    if p_cargos_ids is not null and p_cargos_ids <> '' then

        for v_cargo_id in select * from jsonb_array_elements(p_cargos_ids::jsonb)
        loop
            insert into usuarios.exp_laboral_cargo (id_exp_laboral, id_cargo)
            values (p_id_exp_laboral, (v_cargo_id#>>'{}')::integer);
        end loop;
    end if;
end;
$$;


ALTER PROCEDURE usuarios.sp_actualizar_experiencia(IN p_id_exp_laboral integer, IN p_id_empresa_catalogo integer, IN p_fecha_inicio date, IN p_fecha_fin date, IN p_descripcion text, IN p_id_ciudad integer, IN p_archivo character varying, IN p_cargos_ids text) OWNER TO "adminAzure";

--
-- Name: sp_actualizar_formacion_academica(integer, integer, text, character varying, character varying); Type: PROCEDURE; Schema: usuarios; Owner: adminAzure
--

CREATE PROCEDURE usuarios.sp_actualizar_formacion_academica(IN p_id_academico integer, IN p_id_carrera integer, IN p_fecha_graduacion text, IN p_registro_senescyt character varying, IN p_archivo character varying)
    LANGUAGE plpgsql
    AS $$
begin

    update usuarios.perfil_academico
    set 
        id_carrera = p_id_carrera,
        fecha_graduacion = p_fecha_graduacion::date, 
        numero_registro_senescyt = p_registro_senescyt
    where id_perfil_academico = p_id_academico;

    if p_archivo is not null and p_archivo <> '' then
        update usuarios.documentacion_academica
        set archivo_titulo = p_archivo,
            fecha_registro = current_date
        where id_perfil_academico = p_id_academico;
    end if;
end;
$$;


ALTER PROCEDURE usuarios.sp_actualizar_formacion_academica(IN p_id_academico integer, IN p_id_carrera integer, IN p_fecha_graduacion text, IN p_registro_senescyt character varying, IN p_archivo character varying) OWNER TO "adminAzure";

--
-- Name: sp_actualizar_idioma(integer, integer, character varying, character varying); Type: PROCEDURE; Schema: usuarios; Owner: adminAzure
--

CREATE PROCEDURE usuarios.sp_actualizar_idioma(IN p_id_usuario_idioma integer, IN p_id_idioma integer, IN p_nivel character varying, IN p_archivo character varying)
    LANGUAGE plpgsql
    AS $$
begin
    update usuarios.usuario_idioma
    set 
        id_idioma = p_id_idioma,
        nivel = p_nivel,
        archivo_certificado = coalesce(nullif(p_archivo, ''), archivo_certificado)
    where id_usuario_idioma = p_id_usuario_idioma;
end;
$$;


ALTER PROCEDURE usuarios.sp_actualizar_idioma(IN p_id_usuario_idioma integer, IN p_id_idioma integer, IN p_nivel character varying, IN p_archivo character varying) OWNER TO "adminAzure";

--
-- Name: sp_actualizar_perfil_usuario(bigint, jsonb); Type: PROCEDURE; Schema: usuarios; Owner: adminAzure
--

CREATE PROCEDURE usuarios.sp_actualizar_perfil_usuario(IN p_id_usuario bigint, IN p_datos jsonb)
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE usuarios.usuario
    SET nombre           = COALESCE(p_datos->>'nombre',           nombre),
        apellido         = COALESCE(p_datos->>'apellido',         apellido),
        telefono         = COALESCE(p_datos->>'telefono',         telefono),
        genero           = COALESCE(p_datos->>'genero',           genero),
        fecha_nacimiento = COALESCE(
                             (p_datos->>'fecha_nacimiento')::date,
                             fecha_nacimiento
                           )
    WHERE id_usuario = p_id_usuario;
END;
$$;


ALTER PROCEDURE usuarios.sp_actualizar_perfil_usuario(IN p_id_usuario bigint, IN p_datos jsonb) OWNER TO "adminAzure";

--
-- Name: sp_guardar_url_imagen(bigint, text); Type: PROCEDURE; Schema: usuarios; Owner: adminAzure
--

CREATE PROCEDURE usuarios.sp_guardar_url_imagen(IN p_id_usuario bigint, IN p_url_imagen text)
    LANGUAGE plpgsql
    AS $$
DECLARE 
    v_id_imagen int;
BEGIN
    -- Insertamos en la tabla imagen (Esquema: catalogos)
    INSERT INTO catalogos.imagen (url_imagen) 
    VALUES (p_url_imagen)
    RETURNING id_imagen INTO v_id_imagen; 

    -- Insertamos en la tabla relación (Esquema: usuarios)
    INSERT INTO usuarios.usuario_imagen (id_imagen, id_usuario, fecha_registro)
    VALUES (v_id_imagen, p_id_usuario, now());
	
END;
$$;


ALTER PROCEDURE usuarios.sp_guardar_url_imagen(IN p_id_usuario bigint, IN p_url_imagen text) OWNER TO "adminAzure";

--
-- Name: sp_insertar_perfil_academico(bigint, integer, date, character varying, date); Type: PROCEDURE; Schema: usuarios; Owner: adminAzure
--

CREATE PROCEDURE usuarios.sp_insertar_perfil_academico(IN p_id_usuario bigint, IN p_id_carrera integer, IN p_fecha_graduacion date, IN p_numero_registro_senescyt character varying, IN p_fecha_registro date)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Insertamos los datos en la tabla perfil_academico (Esquema: usuarios)
    INSERT INTO usuarios.perfil_academico (
        id_usuario,
        id_carrera,
        fecha_graduacion,
        numero_registro_senescyt,
        fecha_registro
    ) VALUES (
        p_id_usuario,
        p_id_carrera,
        p_fecha_graduacion,
        p_numero_registro_senescyt,
        p_fecha_registro
    );
END;
$$;


ALTER PROCEDURE usuarios.sp_insertar_perfil_academico(IN p_id_usuario bigint, IN p_id_carrera integer, IN p_fecha_graduacion date, IN p_numero_registro_senescyt character varying, IN p_fecha_registro date) OWNER TO "adminAzure";

--
-- Name: sp_marcar_todas_leidas(bigint); Type: PROCEDURE; Schema: usuarios; Owner: adminAzure
--

CREATE PROCEDURE usuarios.sp_marcar_todas_leidas(IN p_id_usuario bigint)
    LANGUAGE sql
    AS $$
    UPDATE usuarios.notificacion
    SET leida = true
    WHERE id_usuario = p_id_usuario
      AND leida = false;
$$;


ALTER PROCEDURE usuarios.sp_marcar_todas_leidas(IN p_id_usuario bigint) OWNER TO "adminAzure";

--
-- Name: sp_registrar_exp_laboral(bigint, integer, integer, date, date, text, character varying, character varying); Type: PROCEDURE; Schema: usuarios; Owner: adminAzure
--

CREATE PROCEDURE usuarios.sp_registrar_exp_laboral(IN p_id_usuario bigint, IN p_id_cargo integer, IN p_id_empresa_catalogo integer, IN p_fecha_inicio date, IN p_fecha_fin date, IN p_descripcion text, IN p_ubicacion character varying, IN p_url_comprobante character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO usuarios.exp_laboral (
        id_usuario, id_cargo, id_empresa_catalogo,
        fecha_inicio, fecha_fin, descripcion,
        ubicacion, archivo_comprobante, fecha_registro
    ) VALUES (
        p_id_usuario, p_id_cargo, p_id_empresa_catalogo,
        p_fecha_inicio, p_fecha_fin, p_descripcion,
        p_ubicacion, p_url_comprobante, NOW()
    );
END;
$$;


ALTER PROCEDURE usuarios.sp_registrar_exp_laboral(IN p_id_usuario bigint, IN p_id_cargo integer, IN p_id_empresa_catalogo integer, IN p_fecha_inicio date, IN p_fecha_fin date, IN p_descripcion text, IN p_ubicacion character varying, IN p_url_comprobante character varying) OWNER TO "adminAzure";

--
-- Name: sp_registrar_idioma_usuario(bigint, integer, character varying, character varying, character varying); Type: PROCEDURE; Schema: usuarios; Owner: adminAzure
--

CREATE PROCEDURE usuarios.sp_registrar_idioma_usuario(IN p_id_usuario bigint, IN p_id_idioma integer, IN p_nivel character varying, IN p_url_certificado character varying, IN p_codigo_certificado character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- CORRECCIÓN: usuario_idioma (minúsculas, sin comillas)
    INSERT INTO usuarios.usuario_idioma (
        id_usuario,
        id_idioma,
        nivel,
        archivo_certificado,
        codigo_certificado
    )
    VALUES (
        p_id_usuario,
        p_id_idioma,
        p_nivel,
        p_url_certificado,
        p_codigo_certificado
    );
END;
$$;


ALTER PROCEDURE usuarios.sp_registrar_idioma_usuario(IN p_id_usuario bigint, IN p_id_idioma integer, IN p_nivel character varying, IN p_url_certificado character varying, IN p_codigo_certificado character varying) OWNER TO "adminAzure";

--
-- Name: sp_registrar_perfil_academico(bigint, integer, date, character varying, character varying); Type: PROCEDURE; Schema: usuarios; Owner: adminAzure
--

CREATE PROCEDURE usuarios.sp_registrar_perfil_academico(IN p_id_usuario bigint, IN p_id_carrera integer, IN p_fecha_graduacion date, IN p_numero_senescyt character varying, IN p_url_archivo character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_perfil INTEGER;
BEGIN
    -- 1. Insertar en perfil_academico
    INSERT INTO usuarios.perfil_academico (
        id_usuario,
        id_carrera,
        fecha_graduacion,
        numero_registro_senescyt,
        fecha_registro
    )
    VALUES (
        p_id_usuario,
        p_id_carrera,
        p_fecha_graduacion,
        p_numero_senescyt,
        CURRENT_TIMESTAMP
    )
    RETURNING id_perfil_academico INTO v_id_perfil;

    -- 2. Insertar en documentacion_academica con la URL de Cloudinary
    INSERT INTO usuarios.documentacion_academica (
        archivo_titulo,
        fecha_registro,
        id_perfil_academico
    )
    VALUES (
        p_url_archivo,    -- 👈 Guarda la URL directamente
        CURRENT_DATE,
        v_id_perfil
    );
END;
$$;


ALTER PROCEDURE usuarios.sp_registrar_perfil_academico(IN p_id_usuario bigint, IN p_id_carrera integer, IN p_fecha_graduacion date, IN p_numero_senescyt character varying, IN p_url_archivo character varying) OWNER TO "adminAzure";

--
-- Name: sp_registrar_postulante(character varying, character varying, character varying, character varying, date, character varying, character varying, integer, integer); Type: PROCEDURE; Schema: usuarios; Owner: postgres
--

CREATE PROCEDURE usuarios.sp_registrar_postulante(IN p_nombre character varying, IN p_apellido character varying, IN p_contrasena character varying, IN p_correo character varying, IN p_fecha_nacimiento date, IN p_genero character varying, IN p_telefono character varying, IN p_id_ciudad integer, IN p_id_rol integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
d_id_usuario INTEGER;
BEGIN

    INSERT INTO usuarios.usuario (
        nombre, 
        apellido, 
        contrasena, 
        correo, 
        fecha_nacimiento, 
        genero, 
        telefono, 
        id_ciudad, 
        id_rol,
		estado_validacion
    ) VALUES (
        p_nombre, 
        p_apellido, 
        p_contrasena, 
        p_correo, 
        p_fecha_nacimiento, 
        p_genero, 
        p_telefono, 
        p_id_ciudad, 
        p_id_rol,
		'aprobado'
    )RETURNING id_usuario into d_id_usuario;

	insert into usuarios.usuario_imagen (
	id_usuario,
	id_imagen,
	fecha_registro)
	values( 
	d_id_usuario,
	3,
	CURRENT_TIMESTAMP
	);
	
	
END;
$$;


ALTER PROCEDURE usuarios.sp_registrar_postulante(IN p_nombre character varying, IN p_apellido character varying, IN p_contrasena character varying, IN p_correo character varying, IN p_fecha_nacimiento date, IN p_genero character varying, IN p_telefono character varying, IN p_id_ciudad integer, IN p_id_rol integer) OWNER TO postgres;

--
-- Name: cargo_id_cargo_seq; Type: SEQUENCE; Schema: catalogos; Owner: adminAzure
--

CREATE SEQUENCE catalogos.cargo_id_cargo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE catalogos.cargo_id_cargo_seq OWNER TO "adminAzure";

--
-- Name: cargo_id_cargo_seq; Type: SEQUENCE OWNED BY; Schema: catalogos; Owner: adminAzure
--

ALTER SEQUENCE catalogos.cargo_id_cargo_seq OWNED BY catalogos.cargo.id_cargo;


--
-- Name: carrera; Type: TABLE; Schema: catalogos; Owner: adminAzure
--

CREATE TABLE catalogos.carrera (
    id_carrera integer NOT NULL,
    id_facultad integer NOT NULL,
    nombre_carrera character varying(150) NOT NULL
);


ALTER TABLE catalogos.carrera OWNER TO "adminAzure";

--
-- Name: carrera_id_carrera_seq; Type: SEQUENCE; Schema: catalogos; Owner: adminAzure
--

CREATE SEQUENCE catalogos.carrera_id_carrera_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE catalogos.carrera_id_carrera_seq OWNER TO "adminAzure";

--
-- Name: carrera_id_carrera_seq; Type: SEQUENCE OWNED BY; Schema: catalogos; Owner: adminAzure
--

ALTER SEQUENCE catalogos.carrera_id_carrera_seq OWNED BY catalogos.carrera.id_carrera;


--
-- Name: catalogo_habilidad; Type: TABLE; Schema: catalogos; Owner: adminAzure
--

CREATE TABLE catalogos.catalogo_habilidad (
    id_habilidad integer NOT NULL,
    id_tipo_habilidad integer NOT NULL,
    nombre_habilidad character varying(30) NOT NULL
);


ALTER TABLE catalogos.catalogo_habilidad OWNER TO "adminAzure";

--
-- Name: catalogo_habilidad_id_habilidad_seq; Type: SEQUENCE; Schema: catalogos; Owner: adminAzure
--

CREATE SEQUENCE catalogos.catalogo_habilidad_id_habilidad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE catalogos.catalogo_habilidad_id_habilidad_seq OWNER TO "adminAzure";

--
-- Name: catalogo_habilidad_id_habilidad_seq; Type: SEQUENCE OWNED BY; Schema: catalogos; Owner: adminAzure
--

ALTER SEQUENCE catalogos.catalogo_habilidad_id_habilidad_seq OWNED BY catalogos.catalogo_habilidad.id_habilidad;


--
-- Name: categoria_oferta; Type: TABLE; Schema: catalogos; Owner: adminAzure
--

CREATE TABLE catalogos.categoria_oferta (
    id_categoria integer NOT NULL,
    nombre_categoria character varying(40) NOT NULL
);


ALTER TABLE catalogos.categoria_oferta OWNER TO "adminAzure";

--
-- Name: categoria_oferta_id_categoria_seq; Type: SEQUENCE; Schema: catalogos; Owner: adminAzure
--

CREATE SEQUENCE catalogos.categoria_oferta_id_categoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE catalogos.categoria_oferta_id_categoria_seq OWNER TO "adminAzure";

--
-- Name: categoria_oferta_id_categoria_seq; Type: SEQUENCE OWNED BY; Schema: catalogos; Owner: adminAzure
--

ALTER SEQUENCE catalogos.categoria_oferta_id_categoria_seq OWNED BY catalogos.categoria_oferta.id_categoria;


--
-- Name: ciudad; Type: TABLE; Schema: catalogos; Owner: adminAzure
--

CREATE TABLE catalogos.ciudad (
    id_ciudad integer NOT NULL,
    id_provincia integer,
    nombre_ciudad character varying(100) NOT NULL
);


ALTER TABLE catalogos.ciudad OWNER TO "adminAzure";

--
-- Name: ciudad_id_ciudad_seq; Type: SEQUENCE; Schema: catalogos; Owner: adminAzure
--

CREATE SEQUENCE catalogos.ciudad_id_ciudad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE catalogos.ciudad_id_ciudad_seq OWNER TO "adminAzure";

--
-- Name: ciudad_id_ciudad_seq; Type: SEQUENCE OWNED BY; Schema: catalogos; Owner: adminAzure
--

ALTER SEQUENCE catalogos.ciudad_id_ciudad_seq OWNED BY catalogos.ciudad.id_ciudad;


--
-- Name: facultad; Type: TABLE; Schema: catalogos; Owner: adminAzure
--

CREATE TABLE catalogos.facultad (
    id_facultad integer NOT NULL,
    nombre_facultad character varying(150) NOT NULL
);


ALTER TABLE catalogos.facultad OWNER TO "adminAzure";

--
-- Name: facultad_id_facultad_seq; Type: SEQUENCE; Schema: catalogos; Owner: adminAzure
--

CREATE SEQUENCE catalogos.facultad_id_facultad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE catalogos.facultad_id_facultad_seq OWNER TO "adminAzure";

--
-- Name: facultad_id_facultad_seq; Type: SEQUENCE OWNED BY; Schema: catalogos; Owner: adminAzure
--

ALTER SEQUENCE catalogos.facultad_id_facultad_seq OWNED BY catalogos.facultad.id_facultad;


--
-- Name: idioma; Type: TABLE; Schema: catalogos; Owner: adminAzure
--

CREATE TABLE catalogos.idioma (
    id_idioma integer NOT NULL,
    nombre_idioma character varying(15) NOT NULL
);


ALTER TABLE catalogos.idioma OWNER TO "adminAzure";

--
-- Name: idioma_id_idioma_seq; Type: SEQUENCE; Schema: catalogos; Owner: adminAzure
--

CREATE SEQUENCE catalogos.idioma_id_idioma_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE catalogos.idioma_id_idioma_seq OWNER TO "adminAzure";

--
-- Name: idioma_id_idioma_seq; Type: SEQUENCE OWNED BY; Schema: catalogos; Owner: adminAzure
--

ALTER SEQUENCE catalogos.idioma_id_idioma_seq OWNED BY catalogos.idioma.id_idioma;


--
-- Name: imagen; Type: TABLE; Schema: catalogos; Owner: adminAzure
--

CREATE TABLE catalogos.imagen (
    id_imagen integer NOT NULL,
    url_imagen text NOT NULL
);


ALTER TABLE catalogos.imagen OWNER TO "adminAzure";

--
-- Name: imagen_id_imagen_seq; Type: SEQUENCE; Schema: catalogos; Owner: adminAzure
--

CREATE SEQUENCE catalogos.imagen_id_imagen_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE catalogos.imagen_id_imagen_seq OWNER TO "adminAzure";

--
-- Name: imagen_id_imagen_seq; Type: SEQUENCE OWNED BY; Schema: catalogos; Owner: adminAzure
--

ALTER SEQUENCE catalogos.imagen_id_imagen_seq OWNED BY catalogos.imagen.id_imagen;


--
-- Name: jornada_oferta; Type: TABLE; Schema: catalogos; Owner: adminAzure
--

CREATE TABLE catalogos.jornada_oferta (
    id_jornada integer NOT NULL,
    nombre_jornada character varying(30) NOT NULL
);


ALTER TABLE catalogos.jornada_oferta OWNER TO "adminAzure";

--
-- Name: jornada_oferta_id_jornada_seq; Type: SEQUENCE; Schema: catalogos; Owner: adminAzure
--

CREATE SEQUENCE catalogos.jornada_oferta_id_jornada_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE catalogos.jornada_oferta_id_jornada_seq OWNER TO "adminAzure";

--
-- Name: jornada_oferta_id_jornada_seq; Type: SEQUENCE OWNED BY; Schema: catalogos; Owner: adminAzure
--

ALTER SEQUENCE catalogos.jornada_oferta_id_jornada_seq OWNED BY catalogos.jornada_oferta.id_jornada;


--
-- Name: modalidad_oferta; Type: TABLE; Schema: catalogos; Owner: adminAzure
--

CREATE TABLE catalogos.modalidad_oferta (
    id_modalidad integer NOT NULL,
    nombre_modalidad character varying(10) NOT NULL
);


ALTER TABLE catalogos.modalidad_oferta OWNER TO "adminAzure";

--
-- Name: modalidad_oferta_id_modalidad_seq; Type: SEQUENCE; Schema: catalogos; Owner: adminAzure
--

CREATE SEQUENCE catalogos.modalidad_oferta_id_modalidad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE catalogos.modalidad_oferta_id_modalidad_seq OWNER TO "adminAzure";

--
-- Name: modalidad_oferta_id_modalidad_seq; Type: SEQUENCE OWNED BY; Schema: catalogos; Owner: adminAzure
--

ALTER SEQUENCE catalogos.modalidad_oferta_id_modalidad_seq OWNED BY catalogos.modalidad_oferta.id_modalidad;


--
-- Name: plantilla_notificacion; Type: TABLE; Schema: catalogos; Owner: adminAzure
--

CREATE TABLE catalogos.plantilla_notificacion (
    id_plantilla integer NOT NULL,
    activo boolean NOT NULL,
    contenido text NOT NULL,
    fecha_creacion timestamp(6) without time zone NOT NULL,
    fecha_modificacion timestamp(6) without time zone,
    tipo character varying(50) NOT NULL,
    titulo character varying(200) NOT NULL,
    id_usuario_modificado bigint
);


ALTER TABLE catalogos.plantilla_notificacion OWNER TO "adminAzure";

--
-- Name: plantilla_notificacion_id_plantilla_seq; Type: SEQUENCE; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE catalogos.plantilla_notificacion ALTER COLUMN id_plantilla ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME catalogos.plantilla_notificacion_id_plantilla_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: provincia; Type: TABLE; Schema: catalogos; Owner: adminAzure
--

CREATE TABLE catalogos.provincia (
    id_provincia integer NOT NULL,
    nombre_provincia character varying(100) NOT NULL
);


ALTER TABLE catalogos.provincia OWNER TO "adminAzure";

--
-- Name: provincia_id_provincia_seq; Type: SEQUENCE; Schema: catalogos; Owner: adminAzure
--

CREATE SEQUENCE catalogos.provincia_id_provincia_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE catalogos.provincia_id_provincia_seq OWNER TO "adminAzure";

--
-- Name: provincia_id_provincia_seq; Type: SEQUENCE OWNED BY; Schema: catalogos; Owner: adminAzure
--

ALTER SEQUENCE catalogos.provincia_id_provincia_seq OWNED BY catalogos.provincia.id_provincia;


--
-- Name: tipo_habilidad; Type: TABLE; Schema: catalogos; Owner: adminAzure
--

CREATE TABLE catalogos.tipo_habilidad (
    id_tipo_habilidad integer NOT NULL,
    nombre_tipo character varying(50) NOT NULL,
    descripcion character varying(255)
);


ALTER TABLE catalogos.tipo_habilidad OWNER TO "adminAzure";

--
-- Name: tipo_habilidad_id_tipo_habilidad_seq; Type: SEQUENCE; Schema: catalogos; Owner: adminAzure
--

CREATE SEQUENCE catalogos.tipo_habilidad_id_tipo_habilidad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE catalogos.tipo_habilidad_id_tipo_habilidad_seq OWNER TO "adminAzure";

--
-- Name: tipo_habilidad_id_tipo_habilidad_seq; Type: SEQUENCE OWNED BY; Schema: catalogos; Owner: adminAzure
--

ALTER SEQUENCE catalogos.tipo_habilidad_id_tipo_habilidad_seq OWNED BY catalogos.tipo_habilidad.id_tipo_habilidad;


--
-- Name: catalogo_empresa; Type: TABLE; Schema: empresas; Owner: adminAzure
--

CREATE TABLE empresas.catalogo_empresa (
    id_empresa_catalogo integer NOT NULL,
    nombre_empresa character varying(150) NOT NULL,
    ruc character varying(50) NOT NULL,
    es_verificada boolean DEFAULT false,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_categoria integer
);


ALTER TABLE empresas.catalogo_empresa OWNER TO "adminAzure";

--
-- Name: catalogo_empresa_id_empresa_catalogo_seq; Type: SEQUENCE; Schema: empresas; Owner: adminAzure
--

CREATE SEQUENCE empresas.catalogo_empresa_id_empresa_catalogo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE empresas.catalogo_empresa_id_empresa_catalogo_seq OWNER TO "adminAzure";

--
-- Name: catalogo_empresa_id_empresa_catalogo_seq; Type: SEQUENCE OWNED BY; Schema: empresas; Owner: adminAzure
--

ALTER SEQUENCE empresas.catalogo_empresa_id_empresa_catalogo_seq OWNED BY empresas.catalogo_empresa.id_empresa_catalogo;


--
-- Name: usuario_empresa; Type: TABLE; Schema: empresas; Owner: adminAzure
--

CREATE TABLE empresas.usuario_empresa (
    id_empresa bigint NOT NULL,
    id_usuario bigint,
    descripcion text,
    ruc character varying(20),
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    sitioweb character varying(100)
);


ALTER TABLE empresas.usuario_empresa OWNER TO "adminAzure";

--
-- Name: usuario_empresa_id_empresa_seq; Type: SEQUENCE; Schema: empresas; Owner: adminAzure
--

CREATE SEQUENCE empresas.usuario_empresa_id_empresa_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE empresas.usuario_empresa_id_empresa_seq OWNER TO "adminAzure";

--
-- Name: usuario_empresa_id_empresa_seq; Type: SEQUENCE OWNED BY; Schema: empresas; Owner: adminAzure
--

ALTER SEQUENCE empresas.usuario_empresa_id_empresa_seq OWNED BY empresas.usuario_empresa.id_empresa;


--
-- Name: roles; Type: TABLE; Schema: usuarios; Owner: adminAzure
--

CREATE TABLE usuarios.roles (
    id_rol integer NOT NULL,
    nombre_rol character varying(50) NOT NULL,
    permisos_ui character varying(500),
    id_rol_bd character varying(100)
);


ALTER TABLE usuarios.roles OWNER TO "adminAzure";

--
-- Name: usuario; Type: TABLE; Schema: usuarios; Owner: adminAzure
--

CREATE TABLE usuarios.usuario (
    id_usuario bigint NOT NULL,
    id_ciudad integer,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    telefono character varying(20),
    correo character varying(150) NOT NULL,
    contrasena character varying(255) NOT NULL,
    genero character varying(20),
    fecha_nacimiento date,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_rol integer,
    permisos_ui character varying(500),
    estado_validacion character varying(255)
);


ALTER TABLE usuarios.usuario OWNER TO "adminAzure";

--
-- Name: v_empresas_admin; Type: VIEW; Schema: empresas; Owner: adminAzure
--

CREATE VIEW empresas.v_empresas_admin AS
 SELECT u.id_usuario,
    u.nombre AS nombre_empresa,
    ue.ruc,
    u.correo,
    u.estado_validacion AS estado,
    ue.sitioweb AS sitio_web,
    ue.descripcion,
    ue.fecha_registro,
    c.nombre_ciudad
   FROM ((usuarios.usuario u
     JOIN empresas.usuario_empresa ue ON ((u.id_usuario = ue.id_usuario)))
     LEFT JOIN catalogos.ciudad c ON ((u.id_ciudad = c.id_ciudad)))
  WHERE (u.id_rol = ( SELECT r.id_rol
           FROM usuarios.roles r
          WHERE ((r.nombre_rol)::text = 'Empresa'::text)));


ALTER VIEW empresas.v_empresas_admin OWNER TO "adminAzure";

--
-- Name: historial_oferta; Type: TABLE; Schema: ofertas; Owner: adminAzure
--

CREATE TABLE ofertas.historial_oferta (
    id_historial bigint NOT NULL,
    id_oferta bigint NOT NULL,
    id_seguridad integer,
    accion character varying(50) NOT NULL,
    fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    valores_anteriores jsonb,
    valores_nuevos jsonb,
    campo_modificado text
);


ALTER TABLE ofertas.historial_oferta OWNER TO "adminAzure";

--
-- Name: historial_oferta_id_historial_seq; Type: SEQUENCE; Schema: ofertas; Owner: adminAzure
--

CREATE SEQUENCE ofertas.historial_oferta_id_historial_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ofertas.historial_oferta_id_historial_seq OWNER TO "adminAzure";

--
-- Name: historial_oferta_id_historial_seq; Type: SEQUENCE OWNED BY; Schema: ofertas; Owner: adminAzure
--

ALTER SEQUENCE ofertas.historial_oferta_id_historial_seq OWNED BY ofertas.historial_oferta.id_historial;


--
-- Name: oferta_externa_guardada; Type: TABLE; Schema: ofertas; Owner: adminAzure
--

CREATE TABLE ofertas.oferta_externa_guardada (
    id_oferta_externa integer NOT NULL,
    ciudad character varying(120),
    descripcion text,
    es_remoto boolean,
    estado character varying(120),
    id_oferta_externa_origen character varying(200) NOT NULL,
    fecha_publicacion character varying(80),
    fecha_registro timestamp(6) without time zone,
    nombre_empresa character varying(200),
    pais character varying(120),
    tipo_empleo character varying(80),
    titulo character varying(300),
    url_aplicar text,
    url_google text
);


ALTER TABLE ofertas.oferta_externa_guardada OWNER TO "adminAzure";

--
-- Name: oferta_externa_guardada_id_oferta_externa_seq; Type: SEQUENCE; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ofertas.oferta_externa_guardada ALTER COLUMN id_oferta_externa ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME ofertas.oferta_externa_guardada_id_oferta_externa_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: oferta_habilidad_seleccionada; Type: TABLE; Schema: ofertas; Owner: adminAzure
--

CREATE TABLE ofertas.oferta_habilidad_seleccionada (
    id_oferta_habilidad integer NOT NULL,
    id_oferta integer NOT NULL,
    id_habilidad integer NOT NULL,
    nivel_requerido character varying(50),
    es_obligatorio boolean DEFAULT true
);


ALTER TABLE ofertas.oferta_habilidad_seleccionada OWNER TO "adminAzure";

--
-- Name: oferta_habilidad_seleccionada_id_oferta_habilidad_seq; Type: SEQUENCE; Schema: ofertas; Owner: adminAzure
--

CREATE SEQUENCE ofertas.oferta_habilidad_seleccionada_id_oferta_habilidad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ofertas.oferta_habilidad_seleccionada_id_oferta_habilidad_seq OWNER TO "adminAzure";

--
-- Name: oferta_habilidad_seleccionada_id_oferta_habilidad_seq; Type: SEQUENCE OWNED BY; Schema: ofertas; Owner: adminAzure
--

ALTER SEQUENCE ofertas.oferta_habilidad_seleccionada_id_oferta_habilidad_seq OWNED BY ofertas.oferta_habilidad_seleccionada.id_oferta_habilidad;


--
-- Name: oferta_laboral; Type: TABLE; Schema: ofertas; Owner: adminAzure
--

CREATE TABLE ofertas.oferta_laboral (
    id_oferta bigint NOT NULL,
    id_empresa bigint,
    id_modalidad integer,
    id_categoria integer,
    id_jornada integer,
    titulo character varying(150) NOT NULL,
    descripcion text NOT NULL,
    fecha_inicio date,
    fecha_cierre date,
    estado_oferta character varying(20) DEFAULT 'Activa'::character varying,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_ciudad integer,
    salario_min numeric(38,2),
    salario_max numeric(38,2),
    cantidad_vacantes integer DEFAULT 1,
    experiencia_minima integer DEFAULT 0,
    salario_promedio numeric(10,2),
    es_fisica boolean DEFAULT false,
    url_documento_fisico character varying(255)
);


ALTER TABLE ofertas.oferta_laboral OWNER TO "adminAzure";

--
-- Name: oferta_laboral_id_oferta_seq; Type: SEQUENCE; Schema: ofertas; Owner: adminAzure
--

CREATE SEQUENCE ofertas.oferta_laboral_id_oferta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ofertas.oferta_laboral_id_oferta_seq OWNER TO "adminAzure";

--
-- Name: oferta_laboral_id_oferta_seq; Type: SEQUENCE OWNED BY; Schema: ofertas; Owner: adminAzure
--

ALTER SEQUENCE ofertas.oferta_laboral_id_oferta_seq OWNED BY ofertas.oferta_laboral.id_oferta;


--
-- Name: ofertas_favoritas; Type: TABLE; Schema: ofertas; Owner: adminAzure
--

CREATE TABLE ofertas.ofertas_favoritas (
    id_favorita integer NOT NULL,
    id_usuario bigint,
    id_oferta integer,
    fecha_agregado timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_favoritas integer NOT NULL,
    estado_fav character varying(20),
    origen_oferta character varying(20)
);


ALTER TABLE ofertas.ofertas_favoritas OWNER TO "adminAzure";

--
-- Name: ofertas_favoritas_id_favorita_seq; Type: SEQUENCE; Schema: ofertas; Owner: adminAzure
--

CREATE SEQUENCE ofertas.ofertas_favoritas_id_favorita_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ofertas.ofertas_favoritas_id_favorita_seq OWNER TO "adminAzure";

--
-- Name: ofertas_favoritas_id_favorita_seq; Type: SEQUENCE OWNED BY; Schema: ofertas; Owner: adminAzure
--

ALTER SEQUENCE ofertas.ofertas_favoritas_id_favorita_seq OWNED BY ofertas.ofertas_favoritas.id_favorita;


--
-- Name: ofertas_favoritas_id_favoritas_seq; Type: SEQUENCE; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ofertas.ofertas_favoritas ALTER COLUMN id_favoritas ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME ofertas.ofertas_favoritas_id_favoritas_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: requisito_manual; Type: TABLE; Schema: ofertas; Owner: adminAzure
--

CREATE TABLE ofertas.requisito_manual (
    id_requisito_manual integer NOT NULL,
    id_oferta integer NOT NULL,
    descripcion text NOT NULL,
    es_obligatorio boolean DEFAULT true,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE ofertas.requisito_manual OWNER TO "adminAzure";

--
-- Name: requisito_manual_id_requisito_manual_seq; Type: SEQUENCE; Schema: ofertas; Owner: adminAzure
--

CREATE SEQUENCE ofertas.requisito_manual_id_requisito_manual_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ofertas.requisito_manual_id_requisito_manual_seq OWNER TO "adminAzure";

--
-- Name: requisito_manual_id_requisito_manual_seq; Type: SEQUENCE OWNED BY; Schema: ofertas; Owner: adminAzure
--

ALTER SEQUENCE ofertas.requisito_manual_id_requisito_manual_seq OWNED BY ofertas.requisito_manual.id_requisito_manual;


--
-- Name: postulacion; Type: TABLE; Schema: postulaciones; Owner: adminAzure
--

CREATE TABLE postulaciones.postulacion (
    id_postulacion bigint NOT NULL,
    id_usuario bigint NOT NULL,
    id_oferta bigint NOT NULL,
    archivo_cv character varying(500),
    fecha_postulacion timestamp without time zone DEFAULT now(),
    estado_validacion character varying(20) DEFAULT 'Pendiente'::character varying,
    observaciones text,
    porcentaje_match integer DEFAULT 0,
    analisis_ia jsonb
);


ALTER TABLE postulaciones.postulacion OWNER TO "adminAzure";

--
-- Name: TABLE postulacion; Type: COMMENT; Schema: postulaciones; Owner: adminAzure
--

COMMENT ON TABLE postulaciones.postulacion IS 'Registro de postulaciones de usuarios a ofertas laborales';


--
-- Name: COLUMN postulacion.id_postulacion; Type: COMMENT; Schema: postulaciones; Owner: adminAzure
--

COMMENT ON COLUMN postulaciones.postulacion.id_postulacion IS 'ID único de la postulación';


--
-- Name: COLUMN postulacion.id_usuario; Type: COMMENT; Schema: postulaciones; Owner: adminAzure
--

COMMENT ON COLUMN postulaciones.postulacion.id_usuario IS 'Usuario que postula';


--
-- Name: COLUMN postulacion.id_oferta; Type: COMMENT; Schema: postulaciones; Owner: adminAzure
--

COMMENT ON COLUMN postulaciones.postulacion.id_oferta IS 'Oferta a la que postula';


--
-- Name: COLUMN postulacion.archivo_cv; Type: COMMENT; Schema: postulaciones; Owner: adminAzure
--

COMMENT ON COLUMN postulaciones.postulacion.archivo_cv IS 'URL del CV en Cloudinary';


--
-- Name: COLUMN postulacion.fecha_postulacion; Type: COMMENT; Schema: postulaciones; Owner: adminAzure
--

COMMENT ON COLUMN postulaciones.postulacion.fecha_postulacion IS 'Fecha y hora de la postulación';


--
-- Name: COLUMN postulacion.estado_validacion; Type: COMMENT; Schema: postulaciones; Owner: adminAzure
--

COMMENT ON COLUMN postulaciones.postulacion.estado_validacion IS 'Estado: Pendiente, Aprobada, Rechazada, Cancelada';


--
-- Name: COLUMN postulacion.observaciones; Type: COMMENT; Schema: postulaciones; Owner: adminAzure
--

COMMENT ON COLUMN postulaciones.postulacion.observaciones IS 'Notas del reclutador';


--
-- Name: postulacion_id_postulacion_seq; Type: SEQUENCE; Schema: postulaciones; Owner: adminAzure
--

CREATE SEQUENCE postulaciones.postulacion_id_postulacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE postulaciones.postulacion_id_postulacion_seq OWNER TO "adminAzure";

--
-- Name: postulacion_id_postulacion_seq; Type: SEQUENCE OWNED BY; Schema: postulaciones; Owner: adminAzure
--

ALTER SEQUENCE postulaciones.postulacion_id_postulacion_seq OWNED BY postulaciones.postulacion.id_postulacion;


--
-- Name: validacion_curso; Type: TABLE; Schema: postulaciones; Owner: adminAzure
--

CREATE TABLE postulaciones.validacion_curso (
    id_validacion_curso integer NOT NULL,
    id_curso integer,
    estado_validacion character varying(20),
    observaciones text,
    fecha_revision timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_postulacion integer
);


ALTER TABLE postulaciones.validacion_curso OWNER TO "adminAzure";

--
-- Name: validacion_curso_id_validacion_curso_seq; Type: SEQUENCE; Schema: postulaciones; Owner: adminAzure
--

CREATE SEQUENCE postulaciones.validacion_curso_id_validacion_curso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE postulaciones.validacion_curso_id_validacion_curso_seq OWNER TO "adminAzure";

--
-- Name: validacion_curso_id_validacion_curso_seq; Type: SEQUENCE OWNED BY; Schema: postulaciones; Owner: adminAzure
--

ALTER SEQUENCE postulaciones.validacion_curso_id_validacion_curso_seq OWNED BY postulaciones.validacion_curso.id_validacion_curso;


--
-- Name: validacion_documentacion; Type: TABLE; Schema: postulaciones; Owner: adminAzure
--

CREATE TABLE postulaciones.validacion_documentacion (
    id_validacion_doc integer NOT NULL,
    id_documentacion integer,
    estado_validacion character varying(20),
    observaciones text,
    fecha_revision timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_postulacion integer
);


ALTER TABLE postulaciones.validacion_documentacion OWNER TO "adminAzure";

--
-- Name: validacion_documentacion_id_validacion_doc_seq; Type: SEQUENCE; Schema: postulaciones; Owner: adminAzure
--

CREATE SEQUENCE postulaciones.validacion_documentacion_id_validacion_doc_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE postulaciones.validacion_documentacion_id_validacion_doc_seq OWNER TO "adminAzure";

--
-- Name: validacion_documentacion_id_validacion_doc_seq; Type: SEQUENCE OWNED BY; Schema: postulaciones; Owner: adminAzure
--

ALTER SEQUENCE postulaciones.validacion_documentacion_id_validacion_doc_seq OWNED BY postulaciones.validacion_documentacion.id_validacion_doc;


--
-- Name: validacion_exp_laboral; Type: TABLE; Schema: postulaciones; Owner: adminAzure
--

CREATE TABLE postulaciones.validacion_exp_laboral (
    id_validacion_exp integer NOT NULL,
    estado_validacion character varying(30) DEFAULT 'Pendiente'::character varying NOT NULL,
    fecha_revision date DEFAULT CURRENT_DATE,
    observaciones text,
    id_exp_laboral integer NOT NULL,
    id_postulacion integer NOT NULL
);


ALTER TABLE postulaciones.validacion_exp_laboral OWNER TO "adminAzure";

--
-- Name: validacion_exp_laboral_id_validacion_exp_seq; Type: SEQUENCE; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE postulaciones.validacion_exp_laboral ALTER COLUMN id_validacion_exp ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME postulaciones.validacion_exp_laboral_id_validacion_exp_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: validacion_idioma; Type: TABLE; Schema: postulaciones; Owner: adminAzure
--

CREATE TABLE postulaciones.validacion_idioma (
    id_validacion_idioma integer NOT NULL,
    id_usuario_idioma integer,
    estado_validacion character varying(20),
    observaciones text,
    fecha_revision timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_postulacion integer
);


ALTER TABLE postulaciones.validacion_idioma OWNER TO "adminAzure";

--
-- Name: validacion_idioma_id_validacion_idioma_seq; Type: SEQUENCE; Schema: postulaciones; Owner: adminAzure
--

CREATE SEQUENCE postulaciones.validacion_idioma_id_validacion_idioma_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE postulaciones.validacion_idioma_id_validacion_idioma_seq OWNER TO "adminAzure";

--
-- Name: validacion_idioma_id_validacion_idioma_seq; Type: SEQUENCE OWNED BY; Schema: postulaciones; Owner: adminAzure
--

ALTER SEQUENCE postulaciones.validacion_idioma_id_validacion_idioma_seq OWNED BY postulaciones.validacion_idioma.id_validacion_idioma;


--
-- Name: validacion_oferta; Type: TABLE; Schema: postulaciones; Owner: adminAzure
--

CREATE TABLE postulaciones.validacion_oferta (
    id_validacion_oferta integer NOT NULL,
    id_oferta integer,
    estado_validacion character varying(20),
    observaciones text,
    fecha_revision timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_usuario bigint
);


ALTER TABLE postulaciones.validacion_oferta OWNER TO "adminAzure";

--
-- Name: validacion_oferta_id_validacion_oferta_seq; Type: SEQUENCE; Schema: postulaciones; Owner: adminAzure
--

CREATE SEQUENCE postulaciones.validacion_oferta_id_validacion_oferta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE postulaciones.validacion_oferta_id_validacion_oferta_seq OWNER TO "adminAzure";

--
-- Name: validacion_oferta_id_validacion_oferta_seq; Type: SEQUENCE OWNED BY; Schema: postulaciones; Owner: adminAzure
--

ALTER SEQUENCE postulaciones.validacion_oferta_id_validacion_oferta_seq OWNED BY postulaciones.validacion_oferta.id_validacion_oferta;


--
-- Name: auditoria; Type: TABLE; Schema: seguridad; Owner: adminAzure
--

CREATE TABLE seguridad.auditoria (
    id_auditoria integer NOT NULL,
    id_seguridad integer,
    usuario_db character varying(100) DEFAULT CURRENT_USER,
    fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    accion character varying(50),
    tabla_afectada character varying(50),
    id_registro_afectado integer,
    datos_anteriores jsonb,
    datos_nuevos jsonb,
    campos_modificados jsonb
);


ALTER TABLE seguridad.auditoria OWNER TO "adminAzure";

--
-- Name: auditoria_id_auditoria_seq; Type: SEQUENCE; Schema: seguridad; Owner: adminAzure
--

CREATE SEQUENCE seguridad.auditoria_id_auditoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE seguridad.auditoria_id_auditoria_seq OWNER TO "adminAzure";

--
-- Name: auditoria_id_auditoria_seq; Type: SEQUENCE OWNED BY; Schema: seguridad; Owner: adminAzure
--

ALTER SEQUENCE seguridad.auditoria_id_auditoria_seq OWNED BY seguridad.auditoria.id_auditoria;


--
-- Name: configuracion_backup; Type: TABLE; Schema: seguridad; Owner: adminAzure
--

CREATE TABLE seguridad.configuracion_backup (
    id_config bigint NOT NULL,
    habilitado boolean DEFAULT false,
    hora_ejecucion time without time zone,
    dias_semana character varying(255),
    tipo_frecuencia character varying(255) DEFAULT 'SEMANAL'::character varying,
    intervalo integer DEFAULT 0
);


ALTER TABLE seguridad.configuracion_backup OWNER TO "adminAzure";

--
-- Name: configuracion_backup_id_config_seq; Type: SEQUENCE; Schema: seguridad; Owner: adminAzure
--

CREATE SEQUENCE seguridad.configuracion_backup_id_config_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE seguridad.configuracion_backup_id_config_seq OWNER TO "adminAzure";

--
-- Name: configuracion_backup_id_config_seq; Type: SEQUENCE OWNED BY; Schema: seguridad; Owner: adminAzure
--

ALTER SEQUENCE seguridad.configuracion_backup_id_config_seq OWNED BY seguridad.configuracion_backup.id_config;


--
-- Name: historial_backups; Type: TABLE; Schema: seguridad; Owner: adminAzure
--

CREATE TABLE seguridad.historial_backups (
    id_backup bigint NOT NULL,
    fecha_ejecucion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tipo character varying(255),
    estado character varying(255),
    tamano_bytes bigint,
    url_azure character varying(255),
    mensaje_error character varying(255),
    id_config integer,
    id_usuario_ejecutor integer
);


ALTER TABLE seguridad.historial_backups OWNER TO "adminAzure";

--
-- Name: historial_backups_id_backup_seq; Type: SEQUENCE; Schema: seguridad; Owner: adminAzure
--

CREATE SEQUENCE seguridad.historial_backups_id_backup_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE seguridad.historial_backups_id_backup_seq OWNER TO "adminAzure";

--
-- Name: historial_backups_id_backup_seq; Type: SEQUENCE OWNED BY; Schema: seguridad; Owner: adminAzure
--

ALTER SEQUENCE seguridad.historial_backups_id_backup_seq OWNED BY seguridad.historial_backups.id_backup;


--
-- Name: seguridad; Type: TABLE; Schema: seguridad; Owner: adminAzure
--

CREATE TABLE seguridad.seguridad (
    id_seguridad integer NOT NULL,
    id_usuario bigint,
    login_name character varying(100),
    clave_name character varying(150),
    ultimo_acceso timestamp without time zone
);


ALTER TABLE seguridad.seguridad OWNER TO "adminAzure";

--
-- Name: seguridad_id_seguridad_seq; Type: SEQUENCE; Schema: seguridad; Owner: adminAzure
--

CREATE SEQUENCE seguridad.seguridad_id_seguridad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE seguridad.seguridad_id_seguridad_seq OWNER TO "adminAzure";

--
-- Name: seguridad_id_seguridad_seq; Type: SEQUENCE OWNED BY; Schema: seguridad; Owner: adminAzure
--

ALTER SEQUENCE seguridad.seguridad_id_seguridad_seq OWNED BY seguridad.seguridad.id_seguridad;


--
-- Name: sesiones; Type: TABLE; Schema: seguridad; Owner: adminAzure
--

CREATE TABLE seguridad.sesiones (
    id_sesion bigint NOT NULL,
    id_seguridad integer NOT NULL,
    fecha_inicio timestamp without time zone DEFAULT now(),
    fecha_cierre timestamp without time zone,
    ip_address character varying(45),
    navegador character varying(255),
    dispositivo character varying(100),
    accion character varying(20) DEFAULT 'INACTIVA'::character varying
);


ALTER TABLE seguridad.sesiones OWNER TO "adminAzure";

--
-- Name: sesiones_id_sesion_seq; Type: SEQUENCE; Schema: seguridad; Owner: adminAzure
--

CREATE SEQUENCE seguridad.sesiones_id_sesion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE seguridad.sesiones_id_sesion_seq OWNER TO "adminAzure";

--
-- Name: sesiones_id_sesion_seq; Type: SEQUENCE OWNED BY; Schema: seguridad; Owner: adminAzure
--

ALTER SEQUENCE seguridad.sesiones_id_sesion_seq OWNED BY seguridad.sesiones.id_sesion;


--
-- Name: sistema_empresa; Type: TABLE; Schema: seguridad; Owner: adminAzure
--

CREATE TABLE seguridad.sistema_empresa (
    id_config integer DEFAULT 1 NOT NULL,
    nombre_aplicativo character varying(150) NOT NULL,
    descripcion text,
    logo_url text,
    correo_soporte character varying(150),
    telefono_contacto character varying(20),
    direccion_institucion character varying(255),
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT sistema_empresa_id_config_check CHECK ((id_config = 1))
);


ALTER TABLE seguridad.sistema_empresa OWNER TO "adminAzure";

--
-- Name: configuracion_correo; Type: TABLE; Schema: usuarios; Owner: adminAzure
--

CREATE TABLE usuarios.configuracion_correo (
    id_configuracion integer NOT NULL,
    activo boolean NOT NULL,
    fecha_creacion timestamp(6) without time zone,
    fecha_modificacion timestamp(6) without time zone,
    password character varying(255),
    tipo character varying(50) NOT NULL,
    valor character varying(255) NOT NULL,
    id_usuario_modificado bigint
);


ALTER TABLE usuarios.configuracion_correo OWNER TO "adminAzure";

--
-- Name: configuracion_correo_id_configuracion_seq; Type: SEQUENCE; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE usuarios.configuracion_correo ALTER COLUMN id_configuracion ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME usuarios.configuracion_correo_id_configuracion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: cursos; Type: TABLE; Schema: usuarios; Owner: adminAzure
--

CREATE TABLE usuarios.cursos (
    id_curso integer NOT NULL,
    id_usuario bigint,
    nombre_curso character varying(100),
    institucion character varying(100),
    horas_duracion integer,
    fecha_finalizacion date,
    archivo_certificado text,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    hora_duracion character varying(5),
    estado_registro character varying(255) DEFAULT 'activo'::character varying
);


ALTER TABLE usuarios.cursos OWNER TO "adminAzure";

--
-- Name: cursos_id_curso_seq; Type: SEQUENCE; Schema: usuarios; Owner: adminAzure
--

CREATE SEQUENCE usuarios.cursos_id_curso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE usuarios.cursos_id_curso_seq OWNER TO "adminAzure";

--
-- Name: cursos_id_curso_seq; Type: SEQUENCE OWNED BY; Schema: usuarios; Owner: adminAzure
--

ALTER SEQUENCE usuarios.cursos_id_curso_seq OWNED BY usuarios.cursos.id_curso;


--
-- Name: documentacion_academica; Type: TABLE; Schema: usuarios; Owner: adminAzure
--

CREATE TABLE usuarios.documentacion_academica (
    id_documentacion integer NOT NULL,
    archivo_titulo character varying(500),
    fecha_registro date,
    id_perfil_academico integer NOT NULL,
    ruta_archivo character varying(255),
    estado_registro character varying(255) DEFAULT 'activo'::character varying
);


ALTER TABLE usuarios.documentacion_academica OWNER TO "adminAzure";

--
-- Name: documentacion_academica_id_documentacion_seq; Type: SEQUENCE; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE usuarios.documentacion_academica ALTER COLUMN id_documentacion ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME usuarios.documentacion_academica_id_documentacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: exp_laboral; Type: TABLE; Schema: usuarios; Owner: adminAzure
--

CREATE TABLE usuarios.exp_laboral (
    id_exp_laboral integer NOT NULL,
    archivo_comprobante text,
    descripcion text NOT NULL,
    fecha_fin date,
    fecha_inicio date NOT NULL,
    fecha_registro timestamp(6) without time zone,
    id_empresa_catalogo integer NOT NULL,
    id_usuario bigint NOT NULL,
    id_ciudad integer,
    estado_registro character varying(255) DEFAULT 'activo'::character varying
);


ALTER TABLE usuarios.exp_laboral OWNER TO "adminAzure";

--
-- Name: exp_laboral_cargo; Type: TABLE; Schema: usuarios; Owner: adminAzure
--

CREATE TABLE usuarios.exp_laboral_cargo (
    id_exp_cargo integer NOT NULL,
    id_exp_laboral integer NOT NULL,
    id_cargo integer NOT NULL,
    estado_registro character varying(255) DEFAULT 'activo'::character varying
);


ALTER TABLE usuarios.exp_laboral_cargo OWNER TO "adminAzure";

--
-- Name: exp_laboral_cargo_id_exp_cargo_seq; Type: SEQUENCE; Schema: usuarios; Owner: adminAzure
--

CREATE SEQUENCE usuarios.exp_laboral_cargo_id_exp_cargo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE usuarios.exp_laboral_cargo_id_exp_cargo_seq OWNER TO "adminAzure";

--
-- Name: exp_laboral_cargo_id_exp_cargo_seq; Type: SEQUENCE OWNED BY; Schema: usuarios; Owner: adminAzure
--

ALTER SEQUENCE usuarios.exp_laboral_cargo_id_exp_cargo_seq OWNED BY usuarios.exp_laboral_cargo.id_exp_cargo;


--
-- Name: exp_laboral_id_exp_laboral_seq; Type: SEQUENCE; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE usuarios.exp_laboral ALTER COLUMN id_exp_laboral ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME usuarios.exp_laboral_id_exp_laboral_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: historial_postulante; Type: TABLE; Schema: usuarios; Owner: adminAzure
--

CREATE TABLE usuarios.historial_postulante (
    id_historial bigint NOT NULL,
    id_perfil_academico integer NOT NULL,
    id_seguridad integer,
    seccion character varying(50) NOT NULL,
    accion character varying(50) NOT NULL,
    fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    campos_modificados text,
    valores_anteriores jsonb,
    valores_nuevos jsonb
);


ALTER TABLE usuarios.historial_postulante OWNER TO "adminAzure";

--
-- Name: historial_postulante_id_historial_seq; Type: SEQUENCE; Schema: usuarios; Owner: adminAzure
--

CREATE SEQUENCE usuarios.historial_postulante_id_historial_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE usuarios.historial_postulante_id_historial_seq OWNER TO "adminAzure";

--
-- Name: historial_postulante_id_historial_seq; Type: SEQUENCE OWNED BY; Schema: usuarios; Owner: adminAzure
--

ALTER SEQUENCE usuarios.historial_postulante_id_historial_seq OWNED BY usuarios.historial_postulante.id_historial;


--
-- Name: notificacion; Type: TABLE; Schema: usuarios; Owner: adminAzure
--

CREATE TABLE usuarios.notificacion (
    id_notificacion integer NOT NULL,
    datos jsonb,
    enlace character varying(255),
    fecha_creacion timestamp(6) without time zone,
    icono character varying(30),
    leida boolean NOT NULL,
    mensaje text NOT NULL,
    tipo character varying(50) NOT NULL,
    titulo character varying(100) NOT NULL,
    id_usuario bigint NOT NULL
);


ALTER TABLE usuarios.notificacion OWNER TO "adminAzure";

--
-- Name: notificacion_id_notificacion_seq; Type: SEQUENCE; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE usuarios.notificacion ALTER COLUMN id_notificacion ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME usuarios.notificacion_id_notificacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: oferta_laboral; Type: TABLE; Schema: usuarios; Owner: adminAzure
--

CREATE TABLE usuarios.oferta_laboral (
    id_oferta bigint NOT NULL
);


ALTER TABLE usuarios.oferta_laboral OWNER TO "adminAzure";

--
-- Name: perfil_academico; Type: TABLE; Schema: usuarios; Owner: adminAzure
--

CREATE TABLE usuarios.perfil_academico (
    id_perfil_academico integer NOT NULL,
    id_usuario bigint NOT NULL,
    id_carrera integer NOT NULL,
    fecha_graduacion date,
    numero_registro_senescyt character varying(50),
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado_registro character varying(255) DEFAULT 'activo'::character varying
);


ALTER TABLE usuarios.perfil_academico OWNER TO "adminAzure";

--
-- Name: perfil_academico_id_perfil_academico_seq; Type: SEQUENCE; Schema: usuarios; Owner: adminAzure
--

CREATE SEQUENCE usuarios.perfil_academico_id_perfil_academico_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE usuarios.perfil_academico_id_perfil_academico_seq OWNER TO "adminAzure";

--
-- Name: perfil_academico_id_perfil_academico_seq; Type: SEQUENCE OWNED BY; Schema: usuarios; Owner: adminAzure
--

ALTER SEQUENCE usuarios.perfil_academico_id_perfil_academico_seq OWNED BY usuarios.perfil_academico.id_perfil_academico;


--
-- Name: postulacion; Type: TABLE; Schema: usuarios; Owner: adminAzure
--

CREATE TABLE usuarios.postulacion (
    id_postulacion bigint NOT NULL,
    estado_validacion character varying(255),
    fecha_postulacion timestamp(6) without time zone,
    id_oferta bigint,
    id_usuario bigint
);


ALTER TABLE usuarios.postulacion OWNER TO "adminAzure";

--
-- Name: roles_id_rol_seq; Type: SEQUENCE; Schema: usuarios; Owner: adminAzure
--

CREATE SEQUENCE usuarios.roles_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE usuarios.roles_id_rol_seq OWNER TO "adminAzure";

--
-- Name: roles_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: usuarios; Owner: adminAzure
--

ALTER SEQUENCE usuarios.roles_id_rol_seq OWNED BY usuarios.roles.id_rol;


--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: usuarios; Owner: adminAzure
--

CREATE SEQUENCE usuarios.usuario_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE usuarios.usuario_id_usuario_seq OWNER TO "adminAzure";

--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: usuarios; Owner: adminAzure
--

ALTER SEQUENCE usuarios.usuario_id_usuario_seq OWNED BY usuarios.usuario.id_usuario;


--
-- Name: usuario_idioma; Type: TABLE; Schema: usuarios; Owner: adminAzure
--

CREATE TABLE usuarios.usuario_idioma (
    id_usuario_idioma integer NOT NULL,
    id_usuario bigint,
    id_idioma integer,
    nivel character varying(30),
    archivo_certificado character varying(500),
    codigo_certificado character varying(50),
    estado_registro character varying(255) DEFAULT 'activo'::character varying
);


ALTER TABLE usuarios.usuario_idioma OWNER TO "adminAzure";

--
-- Name: usuario_idioma_id_usuario_idioma_seq; Type: SEQUENCE; Schema: usuarios; Owner: adminAzure
--

CREATE SEQUENCE usuarios.usuario_idioma_id_usuario_idioma_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE usuarios.usuario_idioma_id_usuario_idioma_seq OWNER TO "adminAzure";

--
-- Name: usuario_idioma_id_usuario_idioma_seq; Type: SEQUENCE OWNED BY; Schema: usuarios; Owner: adminAzure
--

ALTER SEQUENCE usuarios.usuario_idioma_id_usuario_idioma_seq OWNED BY usuarios.usuario_idioma.id_usuario_idioma;


--
-- Name: usuario_imagen; Type: TABLE; Schema: usuarios; Owner: adminAzure
--

CREATE TABLE usuarios.usuario_imagen (
    id_usuario_imagen integer NOT NULL,
    id_usuario bigint,
    id_imagen integer,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE usuarios.usuario_imagen OWNER TO "adminAzure";

--
-- Name: usuario_imagen_id_usuario_imagen_seq; Type: SEQUENCE; Schema: usuarios; Owner: adminAzure
--

CREATE SEQUENCE usuarios.usuario_imagen_id_usuario_imagen_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE usuarios.usuario_imagen_id_usuario_imagen_seq OWNER TO "adminAzure";

--
-- Name: usuario_imagen_id_usuario_imagen_seq; Type: SEQUENCE OWNED BY; Schema: usuarios; Owner: adminAzure
--

ALTER SEQUENCE usuarios.usuario_imagen_id_usuario_imagen_seq OWNED BY usuarios.usuario_imagen.id_usuario_imagen;


--
-- Name: cargo id_cargo; Type: DEFAULT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.cargo ALTER COLUMN id_cargo SET DEFAULT nextval('catalogos.cargo_id_cargo_seq'::regclass);


--
-- Name: carrera id_carrera; Type: DEFAULT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.carrera ALTER COLUMN id_carrera SET DEFAULT nextval('catalogos.carrera_id_carrera_seq'::regclass);


--
-- Name: catalogo_habilidad id_habilidad; Type: DEFAULT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.catalogo_habilidad ALTER COLUMN id_habilidad SET DEFAULT nextval('catalogos.catalogo_habilidad_id_habilidad_seq'::regclass);


--
-- Name: categoria_oferta id_categoria; Type: DEFAULT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.categoria_oferta ALTER COLUMN id_categoria SET DEFAULT nextval('catalogos.categoria_oferta_id_categoria_seq'::regclass);


--
-- Name: ciudad id_ciudad; Type: DEFAULT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.ciudad ALTER COLUMN id_ciudad SET DEFAULT nextval('catalogos.ciudad_id_ciudad_seq'::regclass);


--
-- Name: facultad id_facultad; Type: DEFAULT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.facultad ALTER COLUMN id_facultad SET DEFAULT nextval('catalogos.facultad_id_facultad_seq'::regclass);


--
-- Name: idioma id_idioma; Type: DEFAULT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.idioma ALTER COLUMN id_idioma SET DEFAULT nextval('catalogos.idioma_id_idioma_seq'::regclass);


--
-- Name: imagen id_imagen; Type: DEFAULT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.imagen ALTER COLUMN id_imagen SET DEFAULT nextval('catalogos.imagen_id_imagen_seq'::regclass);


--
-- Name: jornada_oferta id_jornada; Type: DEFAULT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.jornada_oferta ALTER COLUMN id_jornada SET DEFAULT nextval('catalogos.jornada_oferta_id_jornada_seq'::regclass);


--
-- Name: modalidad_oferta id_modalidad; Type: DEFAULT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.modalidad_oferta ALTER COLUMN id_modalidad SET DEFAULT nextval('catalogos.modalidad_oferta_id_modalidad_seq'::regclass);


--
-- Name: provincia id_provincia; Type: DEFAULT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.provincia ALTER COLUMN id_provincia SET DEFAULT nextval('catalogos.provincia_id_provincia_seq'::regclass);


--
-- Name: tipo_habilidad id_tipo_habilidad; Type: DEFAULT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.tipo_habilidad ALTER COLUMN id_tipo_habilidad SET DEFAULT nextval('catalogos.tipo_habilidad_id_tipo_habilidad_seq'::regclass);


--
-- Name: catalogo_empresa id_empresa_catalogo; Type: DEFAULT; Schema: empresas; Owner: adminAzure
--

ALTER TABLE ONLY empresas.catalogo_empresa ALTER COLUMN id_empresa_catalogo SET DEFAULT nextval('empresas.catalogo_empresa_id_empresa_catalogo_seq'::regclass);


--
-- Name: usuario_empresa id_empresa; Type: DEFAULT; Schema: empresas; Owner: adminAzure
--

ALTER TABLE ONLY empresas.usuario_empresa ALTER COLUMN id_empresa SET DEFAULT nextval('empresas.usuario_empresa_id_empresa_seq'::regclass);


--
-- Name: historial_oferta id_historial; Type: DEFAULT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.historial_oferta ALTER COLUMN id_historial SET DEFAULT nextval('ofertas.historial_oferta_id_historial_seq'::regclass);


--
-- Name: oferta_habilidad_seleccionada id_oferta_habilidad; Type: DEFAULT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.oferta_habilidad_seleccionada ALTER COLUMN id_oferta_habilidad SET DEFAULT nextval('ofertas.oferta_habilidad_seleccionada_id_oferta_habilidad_seq'::regclass);


--
-- Name: oferta_laboral id_oferta; Type: DEFAULT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.oferta_laboral ALTER COLUMN id_oferta SET DEFAULT nextval('ofertas.oferta_laboral_id_oferta_seq'::regclass);


--
-- Name: ofertas_favoritas id_favorita; Type: DEFAULT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.ofertas_favoritas ALTER COLUMN id_favorita SET DEFAULT nextval('ofertas.ofertas_favoritas_id_favorita_seq'::regclass);


--
-- Name: requisito_manual id_requisito_manual; Type: DEFAULT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.requisito_manual ALTER COLUMN id_requisito_manual SET DEFAULT nextval('ofertas.requisito_manual_id_requisito_manual_seq'::regclass);


--
-- Name: postulacion id_postulacion; Type: DEFAULT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.postulacion ALTER COLUMN id_postulacion SET DEFAULT nextval('postulaciones.postulacion_id_postulacion_seq'::regclass);


--
-- Name: validacion_curso id_validacion_curso; Type: DEFAULT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.validacion_curso ALTER COLUMN id_validacion_curso SET DEFAULT nextval('postulaciones.validacion_curso_id_validacion_curso_seq'::regclass);


--
-- Name: validacion_documentacion id_validacion_doc; Type: DEFAULT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.validacion_documentacion ALTER COLUMN id_validacion_doc SET DEFAULT nextval('postulaciones.validacion_documentacion_id_validacion_doc_seq'::regclass);


--
-- Name: validacion_idioma id_validacion_idioma; Type: DEFAULT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.validacion_idioma ALTER COLUMN id_validacion_idioma SET DEFAULT nextval('postulaciones.validacion_idioma_id_validacion_idioma_seq'::regclass);


--
-- Name: validacion_oferta id_validacion_oferta; Type: DEFAULT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.validacion_oferta ALTER COLUMN id_validacion_oferta SET DEFAULT nextval('postulaciones.validacion_oferta_id_validacion_oferta_seq'::regclass);


--
-- Name: auditoria id_auditoria; Type: DEFAULT; Schema: seguridad; Owner: adminAzure
--

ALTER TABLE ONLY seguridad.auditoria ALTER COLUMN id_auditoria SET DEFAULT nextval('seguridad.auditoria_id_auditoria_seq'::regclass);


--
-- Name: configuracion_backup id_config; Type: DEFAULT; Schema: seguridad; Owner: adminAzure
--

ALTER TABLE ONLY seguridad.configuracion_backup ALTER COLUMN id_config SET DEFAULT nextval('seguridad.configuracion_backup_id_config_seq'::regclass);


--
-- Name: historial_backups id_backup; Type: DEFAULT; Schema: seguridad; Owner: adminAzure
--

ALTER TABLE ONLY seguridad.historial_backups ALTER COLUMN id_backup SET DEFAULT nextval('seguridad.historial_backups_id_backup_seq'::regclass);


--
-- Name: seguridad id_seguridad; Type: DEFAULT; Schema: seguridad; Owner: adminAzure
--

ALTER TABLE ONLY seguridad.seguridad ALTER COLUMN id_seguridad SET DEFAULT nextval('seguridad.seguridad_id_seguridad_seq'::regclass);


--
-- Name: sesiones id_sesion; Type: DEFAULT; Schema: seguridad; Owner: adminAzure
--

ALTER TABLE ONLY seguridad.sesiones ALTER COLUMN id_sesion SET DEFAULT nextval('seguridad.sesiones_id_sesion_seq'::regclass);


--
-- Name: cursos id_curso; Type: DEFAULT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.cursos ALTER COLUMN id_curso SET DEFAULT nextval('usuarios.cursos_id_curso_seq'::regclass);


--
-- Name: exp_laboral_cargo id_exp_cargo; Type: DEFAULT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.exp_laboral_cargo ALTER COLUMN id_exp_cargo SET DEFAULT nextval('usuarios.exp_laboral_cargo_id_exp_cargo_seq'::regclass);


--
-- Name: historial_postulante id_historial; Type: DEFAULT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.historial_postulante ALTER COLUMN id_historial SET DEFAULT nextval('usuarios.historial_postulante_id_historial_seq'::regclass);


--
-- Name: perfil_academico id_perfil_academico; Type: DEFAULT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.perfil_academico ALTER COLUMN id_perfil_academico SET DEFAULT nextval('usuarios.perfil_academico_id_perfil_academico_seq'::regclass);


--
-- Name: roles id_rol; Type: DEFAULT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.roles ALTER COLUMN id_rol SET DEFAULT nextval('usuarios.roles_id_rol_seq'::regclass);


--
-- Name: usuario id_usuario; Type: DEFAULT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.usuario ALTER COLUMN id_usuario SET DEFAULT nextval('usuarios.usuario_id_usuario_seq'::regclass);


--
-- Name: usuario_idioma id_usuario_idioma; Type: DEFAULT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.usuario_idioma ALTER COLUMN id_usuario_idioma SET DEFAULT nextval('usuarios.usuario_idioma_id_usuario_idioma_seq'::regclass);


--
-- Name: usuario_imagen id_usuario_imagen; Type: DEFAULT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.usuario_imagen ALTER COLUMN id_usuario_imagen SET DEFAULT nextval('usuarios.usuario_imagen_id_usuario_imagen_seq'::regclass);


--
-- Name: cargo cargo_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.cargo
    ADD CONSTRAINT cargo_pkey PRIMARY KEY (id_cargo);


--
-- Name: carrera carrera_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.carrera
    ADD CONSTRAINT carrera_pkey PRIMARY KEY (id_carrera);


--
-- Name: catalogo_habilidad catalogo_habilidad_nombre_key; Type: CONSTRAINT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.catalogo_habilidad
    ADD CONSTRAINT catalogo_habilidad_nombre_key UNIQUE (nombre_habilidad);


--
-- Name: catalogo_habilidad catalogo_habilidad_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.catalogo_habilidad
    ADD CONSTRAINT catalogo_habilidad_pkey PRIMARY KEY (id_habilidad);


--
-- Name: categoria_oferta categoria_oferta_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.categoria_oferta
    ADD CONSTRAINT categoria_oferta_pkey PRIMARY KEY (id_categoria);


--
-- Name: ciudad ciudad_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.ciudad
    ADD CONSTRAINT ciudad_pkey PRIMARY KEY (id_ciudad);


--
-- Name: facultad facultad_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.facultad
    ADD CONSTRAINT facultad_pkey PRIMARY KEY (id_facultad);


--
-- Name: idioma idioma_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.idioma
    ADD CONSTRAINT idioma_pkey PRIMARY KEY (id_idioma);


--
-- Name: imagen imagen_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.imagen
    ADD CONSTRAINT imagen_pkey PRIMARY KEY (id_imagen);


--
-- Name: jornada_oferta jornada_oferta_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.jornada_oferta
    ADD CONSTRAINT jornada_oferta_pkey PRIMARY KEY (id_jornada);


--
-- Name: modalidad_oferta modalidad_oferta_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.modalidad_oferta
    ADD CONSTRAINT modalidad_oferta_pkey PRIMARY KEY (id_modalidad);


--
-- Name: plantilla_notificacion plantilla_notificacion_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.plantilla_notificacion
    ADD CONSTRAINT plantilla_notificacion_pkey PRIMARY KEY (id_plantilla);


--
-- Name: provincia provincia_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.provincia
    ADD CONSTRAINT provincia_pkey PRIMARY KEY (id_provincia);


--
-- Name: tipo_habilidad tipo_habilidad_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.tipo_habilidad
    ADD CONSTRAINT tipo_habilidad_pkey PRIMARY KEY (id_tipo_habilidad);


--
-- Name: catalogo_empresa catalogo_empresa_nombre_key; Type: CONSTRAINT; Schema: empresas; Owner: adminAzure
--

ALTER TABLE ONLY empresas.catalogo_empresa
    ADD CONSTRAINT catalogo_empresa_nombre_key UNIQUE (nombre_empresa);


--
-- Name: catalogo_empresa catalogo_empresa_pkey; Type: CONSTRAINT; Schema: empresas; Owner: adminAzure
--

ALTER TABLE ONLY empresas.catalogo_empresa
    ADD CONSTRAINT catalogo_empresa_pkey PRIMARY KEY (id_empresa_catalogo);


--
-- Name: catalogo_empresa catalogo_empresa_ruc_key; Type: CONSTRAINT; Schema: empresas; Owner: adminAzure
--

ALTER TABLE ONLY empresas.catalogo_empresa
    ADD CONSTRAINT catalogo_empresa_ruc_key UNIQUE (ruc);


--
-- Name: usuario_empresa usuario_empresa_pkey; Type: CONSTRAINT; Schema: empresas; Owner: adminAzure
--

ALTER TABLE ONLY empresas.usuario_empresa
    ADD CONSTRAINT usuario_empresa_pkey PRIMARY KEY (id_empresa);


--
-- Name: usuario_empresa usuario_empresa_ruc_key; Type: CONSTRAINT; Schema: empresas; Owner: adminAzure
--

ALTER TABLE ONLY empresas.usuario_empresa
    ADD CONSTRAINT usuario_empresa_ruc_key UNIQUE (ruc);


--
-- Name: historial_oferta historial_oferta_pkey; Type: CONSTRAINT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.historial_oferta
    ADD CONSTRAINT historial_oferta_pkey PRIMARY KEY (id_historial);


--
-- Name: oferta_externa_guardada oferta_externa_guardada_pkey; Type: CONSTRAINT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.oferta_externa_guardada
    ADD CONSTRAINT oferta_externa_guardada_pkey PRIMARY KEY (id_oferta_externa);


--
-- Name: oferta_habilidad_seleccionada oferta_habilidad_sel_pkey; Type: CONSTRAINT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.oferta_habilidad_seleccionada
    ADD CONSTRAINT oferta_habilidad_sel_pkey PRIMARY KEY (id_oferta_habilidad);


--
-- Name: oferta_laboral oferta_laboral_pkey; Type: CONSTRAINT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.oferta_laboral
    ADD CONSTRAINT oferta_laboral_pkey PRIMARY KEY (id_oferta);


--
-- Name: ofertas_favoritas ofertas_favoritas_pkey; Type: CONSTRAINT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.ofertas_favoritas
    ADD CONSTRAINT ofertas_favoritas_pkey PRIMARY KEY (id_favorita);


--
-- Name: requisito_manual requisito_manual_pkey; Type: CONSTRAINT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.requisito_manual
    ADD CONSTRAINT requisito_manual_pkey PRIMARY KEY (id_requisito_manual);


--
-- Name: oferta_habilidad_seleccionada unica_habilidad_por_oferta; Type: CONSTRAINT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.oferta_habilidad_seleccionada
    ADD CONSTRAINT unica_habilidad_por_oferta UNIQUE (id_oferta, id_habilidad);


--
-- Name: postulacion postulacion_pkey; Type: CONSTRAINT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.postulacion
    ADD CONSTRAINT postulacion_pkey PRIMARY KEY (id_postulacion);


--
-- Name: validacion_curso validacion_curso_pkey; Type: CONSTRAINT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.validacion_curso
    ADD CONSTRAINT validacion_curso_pkey PRIMARY KEY (id_validacion_curso);


--
-- Name: validacion_documentacion validacion_documentacion_pkey; Type: CONSTRAINT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.validacion_documentacion
    ADD CONSTRAINT validacion_documentacion_pkey PRIMARY KEY (id_validacion_doc);


--
-- Name: validacion_exp_laboral validacion_exp_laboral_pkey; Type: CONSTRAINT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.validacion_exp_laboral
    ADD CONSTRAINT validacion_exp_laboral_pkey PRIMARY KEY (id_validacion_exp);


--
-- Name: validacion_idioma validacion_idioma_pkey; Type: CONSTRAINT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.validacion_idioma
    ADD CONSTRAINT validacion_idioma_pkey PRIMARY KEY (id_validacion_idioma);


--
-- Name: validacion_oferta validacion_oferta_pkey; Type: CONSTRAINT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.validacion_oferta
    ADD CONSTRAINT validacion_oferta_pkey PRIMARY KEY (id_validacion_oferta);


--
-- Name: auditoria auditoria_pkey; Type: CONSTRAINT; Schema: seguridad; Owner: adminAzure
--

ALTER TABLE ONLY seguridad.auditoria
    ADD CONSTRAINT auditoria_pkey PRIMARY KEY (id_auditoria);


--
-- Name: configuracion_backup configuracion_backup_pkey; Type: CONSTRAINT; Schema: seguridad; Owner: adminAzure
--

ALTER TABLE ONLY seguridad.configuracion_backup
    ADD CONSTRAINT configuracion_backup_pkey PRIMARY KEY (id_config);


--
-- Name: sistema_empresa configuracion_sistema_pkey; Type: CONSTRAINT; Schema: seguridad; Owner: adminAzure
--

ALTER TABLE ONLY seguridad.sistema_empresa
    ADD CONSTRAINT configuracion_sistema_pkey PRIMARY KEY (id_config);


--
-- Name: historial_backups historial_backups_pkey; Type: CONSTRAINT; Schema: seguridad; Owner: adminAzure
--

ALTER TABLE ONLY seguridad.historial_backups
    ADD CONSTRAINT historial_backups_pkey PRIMARY KEY (id_backup);


--
-- Name: seguridad seguridad_pkey; Type: CONSTRAINT; Schema: seguridad; Owner: adminAzure
--

ALTER TABLE ONLY seguridad.seguridad
    ADD CONSTRAINT seguridad_pkey PRIMARY KEY (id_seguridad);


--
-- Name: sesiones sesiones_pkey; Type: CONSTRAINT; Schema: seguridad; Owner: adminAzure
--

ALTER TABLE ONLY seguridad.sesiones
    ADD CONSTRAINT sesiones_pkey PRIMARY KEY (id_sesion);


--
-- Name: configuracion_correo configuracion_correo_pkey; Type: CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.configuracion_correo
    ADD CONSTRAINT configuracion_correo_pkey PRIMARY KEY (id_configuracion);


--
-- Name: cursos cursos_pkey; Type: CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.cursos
    ADD CONSTRAINT cursos_pkey PRIMARY KEY (id_curso);


--
-- Name: documentacion_academica documentacion_academica_pkey; Type: CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.documentacion_academica
    ADD CONSTRAINT documentacion_academica_pkey PRIMARY KEY (id_documentacion);


--
-- Name: exp_laboral_cargo exp_laboral_cargo_pkey; Type: CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.exp_laboral_cargo
    ADD CONSTRAINT exp_laboral_cargo_pkey PRIMARY KEY (id_exp_cargo);


--
-- Name: exp_laboral exp_laboral_pkey; Type: CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.exp_laboral
    ADD CONSTRAINT exp_laboral_pkey PRIMARY KEY (id_exp_laboral);


--
-- Name: historial_postulante historial_postulante_pkey; Type: CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.historial_postulante
    ADD CONSTRAINT historial_postulante_pkey PRIMARY KEY (id_historial);


--
-- Name: notificacion notificacion_pkey; Type: CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.notificacion
    ADD CONSTRAINT notificacion_pkey PRIMARY KEY (id_notificacion);


--
-- Name: oferta_laboral oferta_laboral_pkey; Type: CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.oferta_laboral
    ADD CONSTRAINT oferta_laboral_pkey PRIMARY KEY (id_oferta);


--
-- Name: perfil_academico perfil_academico_pkey; Type: CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.perfil_academico
    ADD CONSTRAINT perfil_academico_pkey PRIMARY KEY (id_perfil_academico);


--
-- Name: postulacion postulacion_pkey; Type: CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.postulacion
    ADD CONSTRAINT postulacion_pkey PRIMARY KEY (id_postulacion);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id_rol);


--
-- Name: usuario usuario_correo_key; Type: CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.usuario
    ADD CONSTRAINT usuario_correo_key UNIQUE (correo);


--
-- Name: usuario_idioma usuario_idioma_pkey; Type: CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.usuario_idioma
    ADD CONSTRAINT usuario_idioma_pkey PRIMARY KEY (id_usuario_idioma);


--
-- Name: usuario_imagen usuario_imagen_pkey; Type: CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.usuario_imagen
    ADD CONSTRAINT usuario_imagen_pkey PRIMARY KEY (id_usuario_imagen);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario);


--
-- Name: idx_favoritas_usuario_origen_estado; Type: INDEX; Schema: ofertas; Owner: adminAzure
--

CREATE INDEX idx_favoritas_usuario_origen_estado ON ofertas.ofertas_favoritas USING btree (id_usuario, origen_oferta, estado_fav);


--
-- Name: idx_historial_oferta_id; Type: INDEX; Schema: ofertas; Owner: adminAzure
--

CREATE INDEX idx_historial_oferta_id ON ofertas.historial_oferta USING btree (id_oferta);


--
-- Name: ux_oferta_externa_origen; Type: INDEX; Schema: ofertas; Owner: adminAzure
--

CREATE UNIQUE INDEX ux_oferta_externa_origen ON ofertas.oferta_externa_guardada USING btree (id_oferta_externa_origen);


--
-- Name: idx_postulacion_estado; Type: INDEX; Schema: postulaciones; Owner: adminAzure
--

CREATE INDEX idx_postulacion_estado ON postulaciones.postulacion USING btree (estado_validacion);


--
-- Name: idx_postulacion_oferta; Type: INDEX; Schema: postulaciones; Owner: adminAzure
--

CREATE INDEX idx_postulacion_oferta ON postulaciones.postulacion USING btree (id_oferta);


--
-- Name: idx_postulacion_usuario; Type: INDEX; Schema: postulaciones; Owner: adminAzure
--

CREATE INDEX idx_postulacion_usuario ON postulaciones.postulacion USING btree (id_usuario);


--
-- Name: cargo tr_auditoria_cargo; Type: TRIGGER; Schema: catalogos; Owner: adminAzure
--

CREATE TRIGGER tr_auditoria_cargo AFTER INSERT OR DELETE OR UPDATE ON catalogos.cargo FOR EACH ROW EXECUTE FUNCTION seguridad.fn_auditoria_catalogos();


--
-- Name: carrera tr_auditoria_carrera; Type: TRIGGER; Schema: catalogos; Owner: adminAzure
--

CREATE TRIGGER tr_auditoria_carrera AFTER INSERT OR DELETE OR UPDATE ON catalogos.carrera FOR EACH ROW EXECUTE FUNCTION seguridad.fn_auditoria_catalogos();


--
-- Name: catalogo_habilidad tr_auditoria_catalogo_habilidad; Type: TRIGGER; Schema: catalogos; Owner: adminAzure
--

CREATE TRIGGER tr_auditoria_catalogo_habilidad AFTER INSERT OR DELETE OR UPDATE ON catalogos.catalogo_habilidad FOR EACH ROW EXECUTE FUNCTION seguridad.fn_auditoria_catalogos();


--
-- Name: categoria_oferta tr_auditoria_categoria_oferta; Type: TRIGGER; Schema: catalogos; Owner: adminAzure
--

CREATE TRIGGER tr_auditoria_categoria_oferta AFTER INSERT OR DELETE OR UPDATE ON catalogos.categoria_oferta FOR EACH ROW EXECUTE FUNCTION seguridad.fn_auditoria_catalogos();


--
-- Name: ciudad tr_auditoria_ciudad; Type: TRIGGER; Schema: catalogos; Owner: adminAzure
--

CREATE TRIGGER tr_auditoria_ciudad AFTER INSERT OR DELETE OR UPDATE ON catalogos.ciudad FOR EACH ROW EXECUTE FUNCTION seguridad.fn_auditoria_catalogos();


--
-- Name: facultad tr_auditoria_facultad; Type: TRIGGER; Schema: catalogos; Owner: adminAzure
--

CREATE TRIGGER tr_auditoria_facultad AFTER INSERT OR DELETE OR UPDATE ON catalogos.facultad FOR EACH ROW EXECUTE FUNCTION seguridad.fn_auditoria_catalogos();


--
-- Name: idioma tr_auditoria_idioma; Type: TRIGGER; Schema: catalogos; Owner: adminAzure
--

CREATE TRIGGER tr_auditoria_idioma AFTER INSERT OR DELETE OR UPDATE ON catalogos.idioma FOR EACH ROW EXECUTE FUNCTION seguridad.fn_auditoria_catalogos();


--
-- Name: imagen tr_auditoria_imagen; Type: TRIGGER; Schema: catalogos; Owner: adminAzure
--

CREATE TRIGGER tr_auditoria_imagen AFTER INSERT OR DELETE OR UPDATE ON catalogos.imagen FOR EACH ROW EXECUTE FUNCTION seguridad.fn_auditoria_catalogos();


--
-- Name: jornada_oferta tr_auditoria_jornada_oferta; Type: TRIGGER; Schema: catalogos; Owner: adminAzure
--

CREATE TRIGGER tr_auditoria_jornada_oferta AFTER INSERT OR DELETE OR UPDATE ON catalogos.jornada_oferta FOR EACH ROW EXECUTE FUNCTION seguridad.fn_auditoria_catalogos();


--
-- Name: modalidad_oferta tr_auditoria_modalidad_oferta; Type: TRIGGER; Schema: catalogos; Owner: adminAzure
--

CREATE TRIGGER tr_auditoria_modalidad_oferta AFTER INSERT OR DELETE OR UPDATE ON catalogos.modalidad_oferta FOR EACH ROW EXECUTE FUNCTION seguridad.fn_auditoria_catalogos();


--
-- Name: provincia tr_auditoria_provincia; Type: TRIGGER; Schema: catalogos; Owner: adminAzure
--

CREATE TRIGGER tr_auditoria_provincia AFTER INSERT OR DELETE OR UPDATE ON catalogos.provincia FOR EACH ROW EXECUTE FUNCTION seguridad.fn_auditoria_catalogos();


--
-- Name: tipo_habilidad tr_auditoria_tipo_habilidad; Type: TRIGGER; Schema: catalogos; Owner: adminAzure
--

CREATE TRIGGER tr_auditoria_tipo_habilidad AFTER INSERT OR DELETE OR UPDATE ON catalogos.tipo_habilidad FOR EACH ROW EXECUTE FUNCTION seguridad.fn_auditoria_catalogos();


--
-- Name: plantilla_notificacion trg_auditar_plantilla; Type: TRIGGER; Schema: catalogos; Owner: adminAzure
--

CREATE TRIGGER trg_auditar_plantilla AFTER INSERT OR DELETE OR UPDATE ON catalogos.plantilla_notificacion FOR EACH ROW EXECUTE FUNCTION seguridad.fn_auditoria_plantilla_notificacion();


--
-- Name: catalogo_empresa tr_auditoria_catalogo_empresa; Type: TRIGGER; Schema: empresas; Owner: adminAzure
--

CREATE TRIGGER tr_auditoria_catalogo_empresa AFTER INSERT OR DELETE OR UPDATE ON empresas.catalogo_empresa FOR EACH ROW EXECUTE FUNCTION seguridad.fn_auditoria_catalogos();


--
-- Name: usuario_empresa tr_auditoria_empresa; Type: TRIGGER; Schema: empresas; Owner: adminAzure
--

CREATE TRIGGER tr_auditoria_empresa AFTER INSERT OR DELETE OR UPDATE ON empresas.usuario_empresa FOR EACH ROW EXECUTE FUNCTION seguridad.fn_auditoria_general();


--
-- Name: oferta_habilidad_seleccionada tr_auditoria_oferta_habilidad_seleccionada; Type: TRIGGER; Schema: ofertas; Owner: adminAzure
--

CREATE TRIGGER tr_auditoria_oferta_habilidad_seleccionada AFTER INSERT OR DELETE OR UPDATE ON ofertas.oferta_habilidad_seleccionada FOR EACH ROW EXECUTE FUNCTION seguridad.fn_auditoria_ofertas();


--
-- Name: oferta_laboral tr_auditoria_oferta_laboral; Type: TRIGGER; Schema: ofertas; Owner: adminAzure
--

CREATE TRIGGER tr_auditoria_oferta_laboral AFTER INSERT OR DELETE OR UPDATE ON ofertas.oferta_laboral FOR EACH ROW EXECUTE FUNCTION seguridad.fn_auditoria_ofertas();


--
-- Name: ofertas_favoritas tr_auditoria_ofertas_favoritas; Type: TRIGGER; Schema: ofertas; Owner: adminAzure
--

CREATE TRIGGER tr_auditoria_ofertas_favoritas AFTER INSERT OR DELETE OR UPDATE ON ofertas.ofertas_favoritas FOR EACH ROW EXECUTE FUNCTION seguridad.fn_auditoria_ofertas();


--
-- Name: requisito_manual tr_auditoria_requisito_manual; Type: TRIGGER; Schema: ofertas; Owner: adminAzure
--

CREATE TRIGGER tr_auditoria_requisito_manual AFTER INSERT OR DELETE OR UPDATE ON ofertas.requisito_manual FOR EACH ROW EXECUTE FUNCTION seguridad.fn_auditoria_ofertas();


--
-- Name: oferta_laboral trg_historial_oferta_laboral; Type: TRIGGER; Schema: ofertas; Owner: adminAzure
--

CREATE TRIGGER trg_historial_oferta_laboral AFTER INSERT OR DELETE OR UPDATE ON ofertas.oferta_laboral FOR EACH ROW EXECUTE FUNCTION ofertas.fn_auditar_historial_oferta();


--
-- Name: postulacion trg_historial_postulacion; Type: TRIGGER; Schema: postulaciones; Owner: adminAzure
--

CREATE TRIGGER trg_historial_postulacion AFTER INSERT OR DELETE OR UPDATE ON postulaciones.postulacion FOR EACH ROW EXECUTE FUNCTION ofertas.fn_auditar_historial_oferta();


--
-- Name: validacion_oferta trg_historial_validacion; Type: TRIGGER; Schema: postulaciones; Owner: adminAzure
--

CREATE TRIGGER trg_historial_validacion AFTER INSERT OR DELETE OR UPDATE ON postulaciones.validacion_oferta FOR EACH ROW EXECUTE FUNCTION ofertas.fn_auditar_historial_oferta();


--
-- Name: cursos tr_auditar_cursos; Type: TRIGGER; Schema: usuarios; Owner: adminAzure
--

CREATE TRIGGER tr_auditar_cursos AFTER INSERT OR DELETE OR UPDATE ON usuarios.cursos FOR EACH ROW EXECUTE FUNCTION usuarios.fn_auditar_perfil_postulante();


--
-- Name: documentacion_academica tr_auditar_documentacion_academica; Type: TRIGGER; Schema: usuarios; Owner: adminAzure
--

CREATE TRIGGER tr_auditar_documentacion_academica AFTER INSERT OR DELETE OR UPDATE ON usuarios.documentacion_academica FOR EACH ROW EXECUTE FUNCTION usuarios.fn_auditar_perfil_postulante();


--
-- Name: exp_laboral tr_auditar_exp_laboral; Type: TRIGGER; Schema: usuarios; Owner: adminAzure
--

CREATE TRIGGER tr_auditar_exp_laboral AFTER INSERT OR DELETE OR UPDATE ON usuarios.exp_laboral FOR EACH ROW EXECUTE FUNCTION usuarios.fn_auditar_perfil_postulante();


--
-- Name: exp_laboral_cargo tr_auditar_exp_laboral_cargo; Type: TRIGGER; Schema: usuarios; Owner: adminAzure
--

CREATE TRIGGER tr_auditar_exp_laboral_cargo AFTER INSERT OR DELETE OR UPDATE ON usuarios.exp_laboral_cargo FOR EACH ROW EXECUTE FUNCTION usuarios.fn_auditar_perfil_postulante();


--
-- Name: perfil_academico tr_auditar_perfil_academico; Type: TRIGGER; Schema: usuarios; Owner: adminAzure
--

CREATE TRIGGER tr_auditar_perfil_academico AFTER INSERT OR DELETE OR UPDATE ON usuarios.perfil_academico FOR EACH ROW EXECUTE FUNCTION usuarios.fn_auditar_perfil_postulante();


--
-- Name: usuario_idioma tr_auditar_usuario_idioma; Type: TRIGGER; Schema: usuarios; Owner: adminAzure
--

CREATE TRIGGER tr_auditar_usuario_idioma AFTER INSERT OR DELETE OR UPDATE ON usuarios.usuario_idioma FOR EACH ROW EXECUTE FUNCTION usuarios.fn_auditar_perfil_postulante();


--
-- Name: roles tr_auditoria_roles; Type: TRIGGER; Schema: usuarios; Owner: adminAzure
--

CREATE TRIGGER tr_auditoria_roles AFTER INSERT OR DELETE OR UPDATE ON usuarios.roles FOR EACH ROW EXECUTE FUNCTION seguridad.fn_auditoria_catalogos();


--
-- Name: usuario tr_auditoria_usuarios; Type: TRIGGER; Schema: usuarios; Owner: adminAzure
--

CREATE TRIGGER tr_auditoria_usuarios AFTER INSERT OR DELETE OR UPDATE ON usuarios.usuario FOR EACH ROW EXECUTE FUNCTION seguridad.fn_auditoria_general();


--
-- Name: carrera carrera_id_facultad_fkey; Type: FK CONSTRAINT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.carrera
    ADD CONSTRAINT carrera_id_facultad_fkey FOREIGN KEY (id_facultad) REFERENCES catalogos.facultad(id_facultad);


--
-- Name: ciudad ciudad_id_provincia_fkey; Type: FK CONSTRAINT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.ciudad
    ADD CONSTRAINT ciudad_id_provincia_fkey FOREIGN KEY (id_provincia) REFERENCES catalogos.provincia(id_provincia);


--
-- Name: catalogo_habilidad fk_catalogo_tipo; Type: FK CONSTRAINT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.catalogo_habilidad
    ADD CONSTRAINT fk_catalogo_tipo FOREIGN KEY (id_tipo_habilidad) REFERENCES catalogos.tipo_habilidad(id_tipo_habilidad);


--
-- Name: plantilla_notificacion fktjc3cwjvxpvgbgqi9pvp4epe0; Type: FK CONSTRAINT; Schema: catalogos; Owner: adminAzure
--

ALTER TABLE ONLY catalogos.plantilla_notificacion
    ADD CONSTRAINT fktjc3cwjvxpvgbgqi9pvp4epe0 FOREIGN KEY (id_usuario_modificado) REFERENCES usuarios.usuario(id_usuario);


--
-- Name: catalogo_empresa fk_empresa_categoria; Type: FK CONSTRAINT; Schema: empresas; Owner: adminAzure
--

ALTER TABLE ONLY empresas.catalogo_empresa
    ADD CONSTRAINT fk_empresa_categoria FOREIGN KEY (id_categoria) REFERENCES catalogos.categoria_oferta(id_categoria);


--
-- Name: usuario_empresa usuario_empresa_id_usuario_fkey; Type: FK CONSTRAINT; Schema: empresas; Owner: adminAzure
--

ALTER TABLE ONLY empresas.usuario_empresa
    ADD CONSTRAINT usuario_empresa_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuarios.usuario(id_usuario);


--
-- Name: oferta_laboral fk_ciudad_oferta_laboral; Type: FK CONSTRAINT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.oferta_laboral
    ADD CONSTRAINT fk_ciudad_oferta_laboral FOREIGN KEY (id_ciudad) REFERENCES catalogos.ciudad(id_ciudad);


--
-- Name: historial_oferta fk_historial_oferta; Type: FK CONSTRAINT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.historial_oferta
    ADD CONSTRAINT fk_historial_oferta FOREIGN KEY (id_oferta) REFERENCES ofertas.oferta_laboral(id_oferta) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: historial_oferta fk_historial_seguridad; Type: FK CONSTRAINT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.historial_oferta
    ADD CONSTRAINT fk_historial_seguridad FOREIGN KEY (id_seguridad) REFERENCES seguridad.seguridad(id_seguridad);


--
-- Name: requisito_manual fk_manual_oferta; Type: FK CONSTRAINT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.requisito_manual
    ADD CONSTRAINT fk_manual_oferta FOREIGN KEY (id_oferta) REFERENCES ofertas.oferta_laboral(id_oferta) ON DELETE CASCADE;


--
-- Name: oferta_habilidad_seleccionada fk_seleccion_catalogo; Type: FK CONSTRAINT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.oferta_habilidad_seleccionada
    ADD CONSTRAINT fk_seleccion_catalogo FOREIGN KEY (id_habilidad) REFERENCES catalogos.catalogo_habilidad(id_habilidad) ON DELETE RESTRICT;


--
-- Name: oferta_habilidad_seleccionada fk_seleccion_oferta; Type: FK CONSTRAINT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.oferta_habilidad_seleccionada
    ADD CONSTRAINT fk_seleccion_oferta FOREIGN KEY (id_oferta) REFERENCES ofertas.oferta_laboral(id_oferta) ON DELETE CASCADE;


--
-- Name: oferta_laboral oferta_laboral_id_categoria_fkey; Type: FK CONSTRAINT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.oferta_laboral
    ADD CONSTRAINT oferta_laboral_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES catalogos.categoria_oferta(id_categoria);


--
-- Name: oferta_laboral oferta_laboral_id_empresa_fkey; Type: FK CONSTRAINT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.oferta_laboral
    ADD CONSTRAINT oferta_laboral_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES empresas.usuario_empresa(id_empresa);


--
-- Name: oferta_laboral oferta_laboral_id_jornada_fkey; Type: FK CONSTRAINT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.oferta_laboral
    ADD CONSTRAINT oferta_laboral_id_jornada_fkey FOREIGN KEY (id_jornada) REFERENCES catalogos.jornada_oferta(id_jornada);


--
-- Name: oferta_laboral oferta_laboral_id_modalidad_fkey; Type: FK CONSTRAINT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.oferta_laboral
    ADD CONSTRAINT oferta_laboral_id_modalidad_fkey FOREIGN KEY (id_modalidad) REFERENCES catalogos.modalidad_oferta(id_modalidad);


--
-- Name: ofertas_favoritas ofertas_favoritas_id_oferta_fkey; Type: FK CONSTRAINT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.ofertas_favoritas
    ADD CONSTRAINT ofertas_favoritas_id_oferta_fkey FOREIGN KEY (id_oferta) REFERENCES ofertas.oferta_laboral(id_oferta);


--
-- Name: ofertas_favoritas ofertas_favoritas_id_usuario_fkey; Type: FK CONSTRAINT; Schema: ofertas; Owner: adminAzure
--

ALTER TABLE ONLY ofertas.ofertas_favoritas
    ADD CONSTRAINT ofertas_favoritas_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuarios.usuario(id_usuario);


--
-- Name: validacion_idioma fk5lq9hy0fcjea4mljuyam8mydq; Type: FK CONSTRAINT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.validacion_idioma
    ADD CONSTRAINT fk5lq9hy0fcjea4mljuyam8mydq FOREIGN KEY (id_postulacion) REFERENCES postulaciones.postulacion(id_postulacion);


--
-- Name: postulacion fk_postulacion_oferta; Type: FK CONSTRAINT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.postulacion
    ADD CONSTRAINT fk_postulacion_oferta FOREIGN KEY (id_oferta) REFERENCES ofertas.oferta_laboral(id_oferta) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: postulacion fk_postulacion_usuario; Type: FK CONSTRAINT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.postulacion
    ADD CONSTRAINT fk_postulacion_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios.usuario(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: validacion_oferta fk_usuario_validacion_oferta; Type: FK CONSTRAINT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.validacion_oferta
    ADD CONSTRAINT fk_usuario_validacion_oferta FOREIGN KEY (id_usuario) REFERENCES usuarios.usuario(id_usuario);


--
-- Name: validacion_curso fkcb2sn1183ecya7ocij5ulw2dv; Type: FK CONSTRAINT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.validacion_curso
    ADD CONSTRAINT fkcb2sn1183ecya7ocij5ulw2dv FOREIGN KEY (id_postulacion) REFERENCES postulaciones.postulacion(id_postulacion);


--
-- Name: validacion_documentacion fkcjd46bvlpotg7i6ks4s1yvy6; Type: FK CONSTRAINT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.validacion_documentacion
    ADD CONSTRAINT fkcjd46bvlpotg7i6ks4s1yvy6 FOREIGN KEY (id_documentacion) REFERENCES usuarios.documentacion_academica(id_documentacion);


--
-- Name: validacion_documentacion fkeo2ckf1fqbh3qha44tomce4sb; Type: FK CONSTRAINT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.validacion_documentacion
    ADD CONSTRAINT fkeo2ckf1fqbh3qha44tomce4sb FOREIGN KEY (id_postulacion) REFERENCES postulaciones.postulacion(id_postulacion);


--
-- Name: validacion_exp_laboral fkmd7mox5kxs30x454wpdfnp1y4; Type: FK CONSTRAINT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.validacion_exp_laboral
    ADD CONSTRAINT fkmd7mox5kxs30x454wpdfnp1y4 FOREIGN KEY (id_exp_laboral) REFERENCES usuarios.exp_laboral(id_exp_laboral);


--
-- Name: validacion_exp_laboral fkrogrwh660alt1s25119oe9rpq; Type: FK CONSTRAINT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.validacion_exp_laboral
    ADD CONSTRAINT fkrogrwh660alt1s25119oe9rpq FOREIGN KEY (id_postulacion) REFERENCES postulaciones.postulacion(id_postulacion);


--
-- Name: validacion_curso validacion_curso_id_curso_fkey; Type: FK CONSTRAINT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.validacion_curso
    ADD CONSTRAINT validacion_curso_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES usuarios.cursos(id_curso);


--
-- Name: validacion_idioma validacion_idioma_id_usuario_idioma_fkey; Type: FK CONSTRAINT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.validacion_idioma
    ADD CONSTRAINT validacion_idioma_id_usuario_idioma_fkey FOREIGN KEY (id_usuario_idioma) REFERENCES usuarios.usuario_idioma(id_usuario_idioma);


--
-- Name: validacion_oferta validacion_oferta_id_oferta_fkey; Type: FK CONSTRAINT; Schema: postulaciones; Owner: adminAzure
--

ALTER TABLE ONLY postulaciones.validacion_oferta
    ADD CONSTRAINT validacion_oferta_id_oferta_fkey FOREIGN KEY (id_oferta) REFERENCES ofertas.oferta_laboral(id_oferta);


--
-- Name: auditoria fk_auditoria_seguridad; Type: FK CONSTRAINT; Schema: seguridad; Owner: adminAzure
--

ALTER TABLE ONLY seguridad.auditoria
    ADD CONSTRAINT fk_auditoria_seguridad FOREIGN KEY (id_seguridad) REFERENCES seguridad.seguridad(id_seguridad);


--
-- Name: historial_backups fk_historial_config; Type: FK CONSTRAINT; Schema: seguridad; Owner: adminAzure
--

ALTER TABLE ONLY seguridad.historial_backups
    ADD CONSTRAINT fk_historial_config FOREIGN KEY (id_config) REFERENCES seguridad.configuracion_backup(id_config) ON DELETE SET NULL;


--
-- Name: historial_backups fk_historial_usuario; Type: FK CONSTRAINT; Schema: seguridad; Owner: adminAzure
--

ALTER TABLE ONLY seguridad.historial_backups
    ADD CONSTRAINT fk_historial_usuario FOREIGN KEY (id_usuario_ejecutor) REFERENCES usuarios.usuario(id_usuario) ON DELETE SET NULL;


--
-- Name: sesiones fk_sesion_seguridad; Type: FK CONSTRAINT; Schema: seguridad; Owner: adminAzure
--

ALTER TABLE ONLY seguridad.sesiones
    ADD CONSTRAINT fk_sesion_seguridad FOREIGN KEY (id_seguridad) REFERENCES seguridad.seguridad(id_seguridad) ON DELETE CASCADE;


--
-- Name: seguridad seguridad_id_usuario_fkey; Type: FK CONSTRAINT; Schema: seguridad; Owner: adminAzure
--

ALTER TABLE ONLY seguridad.seguridad
    ADD CONSTRAINT seguridad_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuarios.usuario(id_usuario);


--
-- Name: cursos cursos_id_usuario_fkey; Type: FK CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.cursos
    ADD CONSTRAINT cursos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuarios.usuario(id_usuario);


--
-- Name: configuracion_correo fk1r5lknseh9ieogl7g4d20tuc2; Type: FK CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.configuracion_correo
    ADD CONSTRAINT fk1r5lknseh9ieogl7g4d20tuc2 FOREIGN KEY (id_usuario_modificado) REFERENCES usuarios.usuario(id_usuario);


--
-- Name: documentacion_academica fk3ectqwldso9x7cjjhyxflp2wa; Type: FK CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.documentacion_academica
    ADD CONSTRAINT fk3ectqwldso9x7cjjhyxflp2wa FOREIGN KEY (id_perfil_academico) REFERENCES usuarios.perfil_academico(id_perfil_academico);


--
-- Name: exp_laboral fk6kha4v9qvajste52dsj6piiab; Type: FK CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.exp_laboral
    ADD CONSTRAINT fk6kha4v9qvajste52dsj6piiab FOREIGN KEY (id_ciudad) REFERENCES catalogos.ciudad(id_ciudad);


--
-- Name: exp_laboral fk9sv4c6bqjaxq4kv2kwxq09u0b; Type: FK CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.exp_laboral
    ADD CONSTRAINT fk9sv4c6bqjaxq4kv2kwxq09u0b FOREIGN KEY (id_usuario) REFERENCES usuarios.usuario(id_usuario);


--
-- Name: exp_laboral_cargo fk_elc_cargo; Type: FK CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.exp_laboral_cargo
    ADD CONSTRAINT fk_elc_cargo FOREIGN KEY (id_cargo) REFERENCES catalogos.cargo(id_cargo) ON DELETE CASCADE;


--
-- Name: exp_laboral_cargo fk_elc_exp; Type: FK CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.exp_laboral_cargo
    ADD CONSTRAINT fk_elc_exp FOREIGN KEY (id_exp_laboral) REFERENCES usuarios.exp_laboral(id_exp_laboral) ON DELETE CASCADE;


--
-- Name: historial_postulante fk_historial_perfil; Type: FK CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.historial_postulante
    ADD CONSTRAINT fk_historial_perfil FOREIGN KEY (id_perfil_academico) REFERENCES usuarios.perfil_academico(id_perfil_academico) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: historial_postulante fk_historial_seguridad; Type: FK CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.historial_postulante
    ADD CONSTRAINT fk_historial_seguridad FOREIGN KEY (id_seguridad) REFERENCES seguridad.seguridad(id_seguridad) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: usuario fk_usuario_rol; Type: FK CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.usuario
    ADD CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES usuarios.roles(id_rol);


--
-- Name: notificacion fkcl7wnfwly3cree0u7ghsy10tu; Type: FK CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.notificacion
    ADD CONSTRAINT fkcl7wnfwly3cree0u7ghsy10tu FOREIGN KEY (id_usuario) REFERENCES usuarios.usuario(id_usuario);


--
-- Name: exp_laboral fkk8tuv140tjsr24fpya26tde53; Type: FK CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.exp_laboral
    ADD CONSTRAINT fkk8tuv140tjsr24fpya26tde53 FOREIGN KEY (id_empresa_catalogo) REFERENCES empresas.catalogo_empresa(id_empresa_catalogo);


--
-- Name: perfil_academico perfil_academico_id_carrera_fkey; Type: FK CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.perfil_academico
    ADD CONSTRAINT perfil_academico_id_carrera_fkey FOREIGN KEY (id_carrera) REFERENCES catalogos.carrera(id_carrera);


--
-- Name: perfil_academico perfil_academico_id_usuario_fkey; Type: FK CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.perfil_academico
    ADD CONSTRAINT perfil_academico_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuarios.usuario(id_usuario);


--
-- Name: usuario usuario_id_ciudad_fkey; Type: FK CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.usuario
    ADD CONSTRAINT usuario_id_ciudad_fkey FOREIGN KEY (id_ciudad) REFERENCES catalogos.ciudad(id_ciudad);


--
-- Name: usuario_idioma usuario_idioma_id_idioma_fkey; Type: FK CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.usuario_idioma
    ADD CONSTRAINT usuario_idioma_id_idioma_fkey FOREIGN KEY (id_idioma) REFERENCES catalogos.idioma(id_idioma);


--
-- Name: usuario_idioma usuario_idioma_id_usuario_fkey; Type: FK CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.usuario_idioma
    ADD CONSTRAINT usuario_idioma_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuarios.usuario(id_usuario);


--
-- Name: usuario_imagen usuario_imagen_id_imagen_fkey; Type: FK CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.usuario_imagen
    ADD CONSTRAINT usuario_imagen_id_imagen_fkey FOREIGN KEY (id_imagen) REFERENCES catalogos.imagen(id_imagen);


--
-- Name: usuario_imagen usuario_imagen_id_usuario_fkey; Type: FK CONSTRAINT; Schema: usuarios; Owner: adminAzure
--

ALTER TABLE ONLY usuarios.usuario_imagen
    ADD CONSTRAINT usuario_imagen_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES usuarios.usuario(id_usuario);


--
-- Name: SCHEMA catalogos; Type: ACL; Schema: -; Owner: adminAzure
--

GRANT USAGE ON SCHEMA catalogos TO grupo_administrador;
GRANT USAGE ON SCHEMA catalogos TO grupo_postulante;
GRANT USAGE ON SCHEMA catalogos TO grupo_empresa;
GRANT USAGE ON SCHEMA catalogos TO grupo_supervisor;
GRANT USAGE ON SCHEMA catalogos TO grupo_gerente;
GRANT ALL ON SCHEMA catalogos TO "c.ramirez@empresa.com";
GRANT USAGE ON SCHEMA catalogos TO "Miniadmin";
GRANT USAGE ON SCHEMA catalogos TO "Prueba_011";
GRANT USAGE ON SCHEMA catalogos TO "AdminSupervisor";


--
-- Name: SCHEMA empresas; Type: ACL; Schema: -; Owner: adminAzure
--

GRANT USAGE ON SCHEMA empresas TO grupo_administrador;
GRANT USAGE ON SCHEMA empresas TO grupo_gerente;
GRANT USAGE ON SCHEMA empresas TO grupo_empresa;
GRANT ALL ON SCHEMA empresas TO "c.ramirez@empresa.com";
GRANT USAGE ON SCHEMA empresas TO grupo_supervisor;
GRANT USAGE ON SCHEMA empresas TO grupo_postulante;
GRANT USAGE ON SCHEMA empresas TO "Miniadmin";
GRANT USAGE ON SCHEMA empresas TO "Prueba_011";
GRANT USAGE ON SCHEMA empresas TO "AdminSupervisor";


--
-- Name: SCHEMA ofertas; Type: ACL; Schema: -; Owner: adminAzure
--

GRANT USAGE ON SCHEMA ofertas TO grupo_administrador;
GRANT USAGE ON SCHEMA ofertas TO grupo_postulante;
GRANT USAGE ON SCHEMA ofertas TO grupo_empresa;
GRANT USAGE ON SCHEMA ofertas TO grupo_supervisor;
GRANT USAGE ON SCHEMA ofertas TO grupo_gerente;
GRANT ALL ON SCHEMA ofertas TO "c.ramirez@empresa.com";
GRANT USAGE ON SCHEMA ofertas TO "Miniadmin";
GRANT USAGE ON SCHEMA ofertas TO "Prueba_011";
GRANT USAGE ON SCHEMA ofertas TO "AdminSupervisor";


--
-- Name: SCHEMA postulaciones; Type: ACL; Schema: -; Owner: adminAzure
--

GRANT USAGE ON SCHEMA postulaciones TO grupo_administrador;
GRANT USAGE ON SCHEMA postulaciones TO grupo_postulante;
GRANT USAGE ON SCHEMA postulaciones TO grupo_empresa;
GRANT USAGE ON SCHEMA postulaciones TO grupo_supervisor;
GRANT USAGE ON SCHEMA postulaciones TO grupo_gerente;
GRANT ALL ON SCHEMA postulaciones TO "c.ramirez@empresa.com";
GRANT USAGE ON SCHEMA postulaciones TO "Miniadmin";
GRANT USAGE ON SCHEMA postulaciones TO "Prueba_011";
GRANT USAGE ON SCHEMA postulaciones TO "AdminSupervisor";


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: azure_pg_admin
--

GRANT USAGE ON SCHEMA public TO grupo_administrador;
GRANT USAGE ON SCHEMA public TO grupo_gerente;
GRANT USAGE ON SCHEMA public TO grupo_supervisor;
GRANT USAGE ON SCHEMA public TO grupo_empresa;
GRANT USAGE ON SCHEMA public TO grupo_postulante;
GRANT USAGE ON SCHEMA public TO "adminAzure";


--
-- Name: SCHEMA seguridad; Type: ACL; Schema: -; Owner: adminAzure
--

GRANT USAGE ON SCHEMA seguridad TO grupo_administrador;
GRANT USAGE ON SCHEMA seguridad TO grupo_gerente;
GRANT USAGE ON SCHEMA seguridad TO grupo_supervisor;
GRANT USAGE ON SCHEMA seguridad TO grupo_empresa;
GRANT USAGE ON SCHEMA seguridad TO grupo_postulante;
GRANT ALL ON SCHEMA seguridad TO "c.ramirez@empresa.com";
GRANT USAGE ON SCHEMA seguridad TO "Miniadmin";
GRANT USAGE ON SCHEMA seguridad TO "Prueba_011";
GRANT USAGE ON SCHEMA seguridad TO "AdminSupervisor";


--
-- Name: SCHEMA usuarios; Type: ACL; Schema: -; Owner: adminAzure
--

GRANT USAGE ON SCHEMA usuarios TO grupo_administrador;
GRANT USAGE ON SCHEMA usuarios TO grupo_postulante;
GRANT USAGE ON SCHEMA usuarios TO grupo_empresa;
GRANT USAGE ON SCHEMA usuarios TO grupo_supervisor;
GRANT USAGE ON SCHEMA usuarios TO grupo_gerente;
GRANT ALL ON SCHEMA usuarios TO "c.ramirez@empresa.com";
GRANT USAGE ON SCHEMA usuarios TO "Miniadmin";
GRANT USAGE ON SCHEMA usuarios TO "Prueba_011";
GRANT USAGE ON SCHEMA usuarios TO "AdminSupervisor";


--
-- Name: TABLE cargo; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON TABLE catalogos.cargo TO grupo_administrador;
GRANT SELECT ON TABLE catalogos.cargo TO grupo_gerente;
GRANT SELECT ON TABLE catalogos.cargo TO grupo_supervisor;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.cargo TO grupo_postulante;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.cargo TO grupo_empresa;
GRANT ALL ON TABLE catalogos.cargo TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.cargo TO "SUPE";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.cargo TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.cargo TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.cargo TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.cargo TO "RolZasque";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.cargo TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.cargo TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.cargo TO "AdminSupervisor";


--
-- Name: FUNCTION fn_buscar_cargos(p_termino character varying); Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON FUNCTION catalogos.fn_buscar_cargos(p_termino character varying) TO "Miniadmin";
GRANT ALL ON FUNCTION catalogos.fn_buscar_cargos(p_termino character varying) TO "Prueba_011";
GRANT ALL ON FUNCTION catalogos.fn_buscar_cargos(p_termino character varying) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_crear_cargo(p_nombre_cargo character varying); Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON FUNCTION catalogos.fn_crear_cargo(p_nombre_cargo character varying) TO "Miniadmin";
GRANT ALL ON FUNCTION catalogos.fn_crear_cargo(p_nombre_cargo character varying) TO grupo_postulante;
GRANT ALL ON FUNCTION catalogos.fn_crear_cargo(p_nombre_cargo character varying) TO grupo_empresa;
GRANT ALL ON FUNCTION catalogos.fn_crear_cargo(p_nombre_cargo character varying) TO "Prueba_011";
GRANT ALL ON FUNCTION catalogos.fn_crear_cargo(p_nombre_cargo character varying) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_buscar_empresas(p_termino character varying); Type: ACL; Schema: empresas; Owner: adminAzure
--

GRANT ALL ON FUNCTION empresas.fn_buscar_empresas(p_termino character varying) TO "Miniadmin";
GRANT ALL ON FUNCTION empresas.fn_buscar_empresas(p_termino character varying) TO "Prueba_011";
GRANT ALL ON FUNCTION empresas.fn_buscar_empresas(p_termino character varying) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_buscar_empresascatalogo(p_termino character varying); Type: ACL; Schema: empresas; Owner: adminAzure
--

GRANT ALL ON FUNCTION empresas.fn_buscar_empresascatalogo(p_termino character varying) TO "Miniadmin";
GRANT ALL ON FUNCTION empresas.fn_buscar_empresascatalogo(p_termino character varying) TO "Prueba_011";
GRANT ALL ON FUNCTION empresas.fn_buscar_empresascatalogo(p_termino character varying) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_contar_empresas_hoy(); Type: ACL; Schema: empresas; Owner: adminAzure
--

GRANT ALL ON FUNCTION empresas.fn_contar_empresas_hoy() TO "Miniadmin";
GRANT ALL ON FUNCTION empresas.fn_contar_empresas_hoy() TO "Prueba_011";
GRANT ALL ON FUNCTION empresas.fn_contar_empresas_hoy() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_contar_empresas_total(); Type: ACL; Schema: empresas; Owner: adminAzure
--

GRANT ALL ON FUNCTION empresas.fn_contar_empresas_total() TO "Miniadmin";
GRANT ALL ON FUNCTION empresas.fn_contar_empresas_total() TO "Prueba_011";
GRANT ALL ON FUNCTION empresas.fn_contar_empresas_total() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_crear_catalogo_empresa(p_nombre_empresa character varying, p_ruc character varying, p_id_categoria integer); Type: ACL; Schema: empresas; Owner: adminAzure
--

GRANT ALL ON FUNCTION empresas.fn_crear_catalogo_empresa(p_nombre_empresa character varying, p_ruc character varying, p_id_categoria integer) TO "Miniadmin";
GRANT ALL ON FUNCTION empresas.fn_crear_catalogo_empresa(p_nombre_empresa character varying, p_ruc character varying, p_id_categoria integer) TO "Prueba_011";
GRANT ALL ON FUNCTION empresas.fn_crear_catalogo_empresa(p_nombre_empresa character varying, p_ruc character varying, p_id_categoria integer) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_crear_empresa(p_nombre_empresa character varying, p_ruc character varying, p_id_categoria integer); Type: ACL; Schema: empresas; Owner: adminAzure
--

GRANT ALL ON FUNCTION empresas.fn_crear_empresa(p_nombre_empresa character varying, p_ruc character varying, p_id_categoria integer) TO "Miniadmin";
GRANT ALL ON FUNCTION empresas.fn_crear_empresa(p_nombre_empresa character varying, p_ruc character varying, p_id_categoria integer) TO "Prueba_011";
GRANT ALL ON FUNCTION empresas.fn_crear_empresa(p_nombre_empresa character varying, p_ruc character varying, p_id_categoria integer) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_empresas_historico(); Type: ACL; Schema: empresas; Owner: adminAzure
--

GRANT ALL ON FUNCTION empresas.fn_obtener_empresas_historico() TO "Miniadmin";
GRANT ALL ON FUNCTION empresas.fn_obtener_empresas_historico() TO "Prueba_011";
GRANT ALL ON FUNCTION empresas.fn_obtener_empresas_historico() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_empresas_ultimos_7_dias(); Type: ACL; Schema: empresas; Owner: adminAzure
--

GRANT ALL ON FUNCTION empresas.fn_obtener_empresas_ultimos_7_dias() TO "Miniadmin";
GRANT ALL ON FUNCTION empresas.fn_obtener_empresas_ultimos_7_dias() TO "Prueba_011";
GRANT ALL ON FUNCTION empresas.fn_obtener_empresas_ultimos_7_dias() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_reporte_ofertas_empresa(p_id_empresa bigint, p_top integer, p_id_ciudad integer, p_id_categoria integer, p_id_modalidad integer, p_id_jornada integer, p_fecha_inicio date, p_fecha_fin date, p_salario_min numeric, p_salario_max numeric, p_estado_oferta character varying); Type: ACL; Schema: empresas; Owner: adminAzure
--

GRANT ALL ON FUNCTION empresas.fn_reporte_ofertas_empresa(p_id_empresa bigint, p_top integer, p_id_ciudad integer, p_id_categoria integer, p_id_modalidad integer, p_id_jornada integer, p_fecha_inicio date, p_fecha_fin date, p_salario_min numeric, p_salario_max numeric, p_estado_oferta character varying) TO "Miniadmin";
GRANT ALL ON FUNCTION empresas.fn_reporte_ofertas_empresa(p_id_empresa bigint, p_top integer, p_id_ciudad integer, p_id_categoria integer, p_id_modalidad integer, p_id_jornada integer, p_fecha_inicio date, p_fecha_fin date, p_salario_min numeric, p_salario_max numeric, p_estado_oferta character varying) TO "Prueba_011";
GRANT ALL ON FUNCTION empresas.fn_reporte_ofertas_empresa(p_id_empresa bigint, p_top integer, p_id_ciudad integer, p_id_categoria integer, p_id_modalidad integer, p_id_jornada integer, p_fecha_inicio date, p_fecha_fin date, p_salario_min numeric, p_salario_max numeric, p_estado_oferta character varying) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_modificarperfilempresa(IN p_idempresa bigint, IN p_nombreempresa character varying, IN p_sitioweb character varying, IN p_descripcion character varying); Type: ACL; Schema: empresas; Owner: adminAzure
--

GRANT ALL ON PROCEDURE empresas.sp_modificarperfilempresa(IN p_idempresa bigint, IN p_nombreempresa character varying, IN p_sitioweb character varying, IN p_descripcion character varying) TO "Miniadmin";
GRANT ALL ON PROCEDURE empresas.sp_modificarperfilempresa(IN p_idempresa bigint, IN p_nombreempresa character varying, IN p_sitioweb character varying, IN p_descripcion character varying) TO "Prueba_011";
GRANT ALL ON PROCEDURE empresas.sp_modificarperfilempresa(IN p_idempresa bigint, IN p_nombreempresa character varying, IN p_sitioweb character varying, IN p_descripcion character varying) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_registrar_empresa_completa(IN p_correo character varying, IN p_contrasena character varying, IN p_id_ciudad integer, IN p_nombre character varying, IN p_descripcion character varying, IN p_ruc character varying, IN p_sitioweb character varying); Type: ACL; Schema: empresas; Owner: adminAzure
--

GRANT ALL ON PROCEDURE empresas.sp_registrar_empresa_completa(IN p_correo character varying, IN p_contrasena character varying, IN p_id_ciudad integer, IN p_nombre character varying, IN p_descripcion character varying, IN p_ruc character varying, IN p_sitioweb character varying) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_auditar_historial_oferta(); Type: ACL; Schema: ofertas; Owner: postgres
--

GRANT ALL ON FUNCTION ofertas.fn_auditar_historial_oferta() TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_auditar_historial_oferta() TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_auditar_historial_oferta() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_consultar_ofertas_empresa_provincia(p_id_empresa bigint, p_nombre_provincia character varying); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_consultar_ofertas_empresa_provincia(p_id_empresa bigint, p_nombre_provincia character varying) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_consultar_ofertas_empresa_provincia(p_id_empresa bigint, p_nombre_provincia character varying) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_consultar_ofertas_empresa_provincia(p_id_empresa bigint, p_nombre_provincia character varying) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_contar_favoritas_usuario(p_id_usuario bigint); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_contar_favoritas_usuario(p_id_usuario bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_contar_favoritas_usuario(p_id_usuario bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_contar_favoritas_usuario(p_id_usuario bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_contar_favoritas_usuario_hoy(p_id_usuario bigint); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_contar_favoritas_usuario_hoy(p_id_usuario bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_contar_favoritas_usuario_hoy(p_id_usuario bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_contar_favoritas_usuario_hoy(p_id_usuario bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_contar_ofertas_empresa_estado(p_id_empresa bigint, p_estado character varying); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_contar_ofertas_empresa_estado(p_id_empresa bigint, p_estado character varying) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_contar_ofertas_empresa_estado(p_id_empresa bigint, p_estado character varying) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_contar_ofertas_empresa_estado(p_id_empresa bigint, p_estado character varying) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_contar_ofertas_empresa_estado_hoy(p_id_empresa bigint, p_estado character varying); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_contar_ofertas_empresa_estado_hoy(p_id_empresa bigint, p_estado character varying) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_contar_ofertas_empresa_estado_hoy(p_id_empresa bigint, p_estado character varying) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_contar_ofertas_empresa_estado_hoy(p_id_empresa bigint, p_estado character varying) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_contar_ofertas_por_estado(p_estado character varying); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_contar_ofertas_por_estado(p_estado character varying) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_contar_ofertas_por_estado(p_estado character varying) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_contar_ofertas_por_estado(p_estado character varying) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_contar_ofertas_por_estado_hoy(p_estado character varying); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_contar_ofertas_por_estado_hoy(p_estado character varying) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_contar_ofertas_por_estado_hoy(p_estado character varying) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_contar_ofertas_por_estado_hoy(p_estado character varying) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_datos_ubicacion_oferta(p_id_oferta integer); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_datos_ubicacion_oferta(p_id_oferta integer) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_datos_ubicacion_oferta(p_id_oferta integer) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_datos_ubicacion_oferta(p_id_oferta integer) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_listar_ofertas_completo(p_id_usuario bigint); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_listar_ofertas_completo(p_id_usuario bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_listar_ofertas_completo(p_id_usuario bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_listar_ofertas_completo(p_id_usuario bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_listar_ofertas_fisicas(); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_listar_ofertas_fisicas() TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_listar_ofertas_fisicas() TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_listar_ofertas_fisicas() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_mostrar_postulantes_oferta(p_idoferta bigint); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_mostrar_postulantes_oferta(p_idoferta bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_mostrar_postulantes_oferta(p_idoferta bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_mostrar_postulantes_oferta(p_idoferta bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_mostrarofertasempresa(p_id_empresa bigint); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_mostrarofertasempresa(p_id_empresa bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_mostrarofertasempresa(p_id_empresa bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_mostrarofertasempresa(p_id_empresa bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_datos_oferta_ia(p_id_oferta bigint); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_obtener_datos_oferta_ia(p_id_oferta bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_obtener_datos_oferta_ia(p_id_oferta bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_obtener_datos_oferta_ia(p_id_oferta bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_extra_oferta(p_idoferta integer); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_obtener_extra_oferta(p_idoferta integer) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_obtener_extra_oferta(p_idoferta integer) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_obtener_extra_oferta(p_idoferta integer) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_favoritas_usuario_historico(p_id_usuario bigint); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_obtener_favoritas_usuario_historico(p_id_usuario bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_obtener_favoritas_usuario_historico(p_id_usuario bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_obtener_favoritas_usuario_historico(p_id_usuario bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_favoritas_usuario_mixtas(p_id_usuario bigint); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_obtener_favoritas_usuario_mixtas(p_id_usuario bigint) TO grupo_postulante;
GRANT ALL ON FUNCTION ofertas.fn_obtener_favoritas_usuario_mixtas(p_id_usuario bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_favoritas_usuario_ultimos_7_dias(p_id_usuario bigint); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_obtener_favoritas_usuario_ultimos_7_dias(p_id_usuario bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_obtener_favoritas_usuario_ultimos_7_dias(p_id_usuario bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_obtener_favoritas_usuario_ultimos_7_dias(p_id_usuario bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_ofertas_empresa_estado_historico(p_id_empresa bigint, p_estado character varying); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_obtener_ofertas_empresa_estado_historico(p_id_empresa bigint, p_estado character varying) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_obtener_ofertas_empresa_estado_historico(p_id_empresa bigint, p_estado character varying) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_obtener_ofertas_empresa_estado_historico(p_id_empresa bigint, p_estado character varying) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_ofertas_empresa_estado_ultimos_7_dias(p_id_empresa bigint, p_estado character varying); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_obtener_ofertas_empresa_estado_ultimos_7_dias(p_id_empresa bigint, p_estado character varying) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_obtener_ofertas_empresa_estado_ultimos_7_dias(p_id_empresa bigint, p_estado character varying) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_obtener_ofertas_empresa_estado_ultimos_7_dias(p_id_empresa bigint, p_estado character varying) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_ofertas_estado_historico(p_estado character varying); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_obtener_ofertas_estado_historico(p_estado character varying) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_obtener_ofertas_estado_historico(p_estado character varying) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_obtener_ofertas_estado_historico(p_estado character varying) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_ofertas_estado_ultimos_7_dias(p_estado character varying); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_obtener_ofertas_estado_ultimos_7_dias(p_estado character varying) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_obtener_ofertas_estado_ultimos_7_dias(p_estado character varying) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_obtener_ofertas_estado_ultimos_7_dias(p_estado character varying) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_ofertas_sin_postular(p_id_usuario bigint); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_obtener_ofertas_sin_postular(p_id_usuario bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_ofertas_unicas_historial(p_json json); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_obtener_ofertas_unicas_historial(p_json json) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_trazabilidad_oferta(p_json json); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_obtener_trazabilidad_oferta(p_json json) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_obtener_trazabilidad_oferta(p_json json) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_obtener_trazabilidad_oferta(p_json json) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_reporte_ofertas_laborales(p_id_ciudad integer, p_id_categoria integer, p_id_modalidad integer, p_id_jornada integer, p_fecha_inicio date, p_fecha_fin date, p_salario_min numeric, p_salario_max numeric, p_estado_oferta character varying); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.fn_reporte_ofertas_laborales(p_id_ciudad integer, p_id_categoria integer, p_id_modalidad integer, p_id_jornada integer, p_fecha_inicio date, p_fecha_fin date, p_salario_min numeric, p_salario_max numeric, p_estado_oferta character varying) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.fn_reporte_ofertas_laborales(p_id_ciudad integer, p_id_categoria integer, p_id_modalidad integer, p_id_jornada integer, p_fecha_inicio date, p_fecha_fin date, p_salario_min numeric, p_salario_max numeric, p_estado_oferta character varying) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.fn_reporte_ofertas_laborales(p_id_ciudad integer, p_id_categoria integer, p_id_modalidad integer, p_id_jornada integer, p_fecha_inicio date, p_fecha_fin date, p_salario_min numeric, p_salario_max numeric, p_estado_oferta character varying) TO "AdminSupervisor";


--
-- Name: FUNCTION listar_ofertas_por_estado(p_estado character varying); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.listar_ofertas_por_estado(p_estado character varying) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.listar_ofertas_por_estado(p_estado character varying) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.listar_ofertas_por_estado(p_estado character varying) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_actualizar_oferta_fisica(IN p_idoferta bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion text, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_estado_oferta character varying, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb, IN p_url_documento text); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON PROCEDURE ofertas.sp_actualizar_oferta_fisica(IN p_idoferta bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion text, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_estado_oferta character varying, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb, IN p_url_documento text) TO "Miniadmin";
GRANT ALL ON PROCEDURE ofertas.sp_actualizar_oferta_fisica(IN p_idoferta bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion text, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_estado_oferta character varying, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb, IN p_url_documento text) TO "Prueba_011";
GRANT ALL ON PROCEDURE ofertas.sp_actualizar_oferta_fisica(IN p_idoferta bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion text, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_estado_oferta character varying, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb, IN p_url_documento text) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_actualizaroferta(IN p_idoferta bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion character varying, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_estado_oferta character varying, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON PROCEDURE ofertas.sp_actualizaroferta(IN p_idoferta bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion character varying, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_estado_oferta character varying, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb) TO "Miniadmin";
GRANT ALL ON PROCEDURE ofertas.sp_actualizaroferta(IN p_idoferta bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion character varying, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_estado_oferta character varying, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb) TO "Prueba_011";
GRANT ALL ON PROCEDURE ofertas.sp_actualizaroferta(IN p_idoferta bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion character varying, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_estado_oferta character varying, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_crear_oferta_fisica(IN p_idempresa bigint, IN p_idadmin bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion text, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_fecha_inicio date, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb, IN p_url_documento text); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON PROCEDURE ofertas.sp_crear_oferta_fisica(IN p_idempresa bigint, IN p_idadmin bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion text, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_fecha_inicio date, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb, IN p_url_documento text) TO "Miniadmin";
GRANT ALL ON PROCEDURE ofertas.sp_crear_oferta_fisica(IN p_idempresa bigint, IN p_idadmin bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion text, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_fecha_inicio date, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb, IN p_url_documento text) TO "Prueba_011";
GRANT ALL ON PROCEDURE ofertas.sp_crear_oferta_fisica(IN p_idempresa bigint, IN p_idadmin bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion text, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_fecha_inicio date, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb, IN p_url_documento text) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_crearoferta(IN p_idempresa bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion character varying, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_fecha_inicio date, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb); Type: ACL; Schema: ofertas; Owner: postgres
--

GRANT ALL ON PROCEDURE ofertas.sp_crearoferta(IN p_idempresa bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion character varying, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_fecha_inicio date, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb) TO "Miniadmin";
GRANT ALL ON PROCEDURE ofertas.sp_crearoferta(IN p_idempresa bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion character varying, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_fecha_inicio date, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb) TO "Prueba_011";
GRANT ALL ON PROCEDURE ofertas.sp_crearoferta(IN p_idempresa bigint, IN p_idmodalidad integer, IN p_idcategoria integer, IN p_idjornada integer, IN p_idciudad integer, IN p_titulo character varying, IN p_descripcion character varying, IN p_salario_min numeric, IN p_salario_max numeric, IN p_cantidad_vacantes integer, IN p_experiencia_minima integer, IN p_fecha_inicio date, IN p_fecha_cierre date, IN p_habilidades jsonb, IN p_requisitos_manuales jsonb) TO "AdminSupervisor";


--
-- Name: FUNCTION sp_toggle_favorita_confirmacion(p_id_oferta integer, p_id_usuario bigint); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.sp_toggle_favorita_confirmacion(p_id_oferta integer, p_id_usuario bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION ofertas.sp_toggle_favorita_confirmacion(p_id_oferta integer, p_id_usuario bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION ofertas.sp_toggle_favorita_confirmacion(p_id_oferta integer, p_id_usuario bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION sp_toggle_favorita_externa_json(p_id_usuario bigint, p_oferta jsonb); Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON FUNCTION ofertas.sp_toggle_favorita_externa_json(p_id_usuario bigint, p_oferta jsonb) TO grupo_postulante;
GRANT ALL ON FUNCTION ofertas.sp_toggle_favorita_externa_json(p_id_usuario bigint, p_oferta jsonb) TO "AdminSupervisor";


--
-- Name: FUNCTION pg_replication_origin_advance(text, pg_lsn); Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_advance(text, pg_lsn) TO azure_pg_admin;


--
-- Name: FUNCTION pg_replication_origin_create(text); Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_create(text) TO azure_pg_admin;


--
-- Name: FUNCTION pg_replication_origin_drop(text); Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_drop(text) TO azure_pg_admin;


--
-- Name: FUNCTION pg_replication_origin_oid(text); Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_oid(text) TO azure_pg_admin;


--
-- Name: FUNCTION pg_replication_origin_progress(text, boolean); Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_progress(text, boolean) TO azure_pg_admin;


--
-- Name: FUNCTION pg_replication_origin_session_is_setup(); Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_session_is_setup() TO azure_pg_admin;


--
-- Name: FUNCTION pg_replication_origin_session_progress(boolean); Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_session_progress(boolean) TO azure_pg_admin;


--
-- Name: FUNCTION pg_replication_origin_session_reset(); Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_session_reset() TO azure_pg_admin;


--
-- Name: FUNCTION pg_replication_origin_session_setup(text); Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_session_setup(text) TO azure_pg_admin;


--
-- Name: FUNCTION pg_replication_origin_xact_reset(); Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_xact_reset() TO azure_pg_admin;


--
-- Name: FUNCTION pg_replication_origin_xact_setup(pg_lsn, timestamp with time zone); Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_xact_setup(pg_lsn, timestamp with time zone) TO azure_pg_admin;


--
-- Name: FUNCTION pg_show_replication_origin_status(OUT local_id oid, OUT external_id text, OUT remote_lsn pg_lsn, OUT local_lsn pg_lsn); Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT ALL ON FUNCTION pg_catalog.pg_show_replication_origin_status(OUT local_id oid, OUT external_id text, OUT remote_lsn pg_lsn, OUT local_lsn pg_lsn) TO azure_pg_admin;


--
-- Name: FUNCTION pg_stat_reset(); Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT ALL ON FUNCTION pg_catalog.pg_stat_reset() TO azure_pg_admin;


--
-- Name: FUNCTION pg_stat_reset_shared(target text); Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT ALL ON FUNCTION pg_catalog.pg_stat_reset_shared(target text) TO azure_pg_admin;


--
-- Name: FUNCTION pg_stat_reset_single_function_counters(oid); Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT ALL ON FUNCTION pg_catalog.pg_stat_reset_single_function_counters(oid) TO azure_pg_admin;


--
-- Name: FUNCTION pg_stat_reset_single_table_counters(oid); Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT ALL ON FUNCTION pg_catalog.pg_stat_reset_single_table_counters(oid) TO azure_pg_admin;


--
-- Name: FUNCTION fn_contar_postulantes_por_ofertas(p_ids integer[]); Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON FUNCTION postulaciones.fn_contar_postulantes_por_ofertas(p_ids integer[]) TO "Miniadmin";
GRANT ALL ON FUNCTION postulaciones.fn_contar_postulantes_por_ofertas(p_ids integer[]) TO "Prueba_011";
GRANT ALL ON FUNCTION postulaciones.fn_contar_postulantes_por_ofertas(p_ids integer[]) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_datos_notificacion_postulacion(p_id_postulacion integer); Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON FUNCTION postulaciones.fn_datos_notificacion_postulacion(p_id_postulacion integer) TO "Miniadmin";
GRANT ALL ON FUNCTION postulaciones.fn_datos_notificacion_postulacion(p_id_postulacion integer) TO "Prueba_011";
GRANT ALL ON FUNCTION postulaciones.fn_datos_notificacion_postulacion(p_id_postulacion integer) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_evaluar_postulacion_general(p_id_postulacion bigint, p_estado character varying, p_mensaje text); Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON FUNCTION postulaciones.fn_evaluar_postulacion_general(p_id_postulacion bigint, p_estado character varying, p_mensaje text) TO "Miniadmin";
GRANT ALL ON FUNCTION postulaciones.fn_evaluar_postulacion_general(p_id_postulacion bigint, p_estado character varying, p_mensaje text) TO "Prueba_011";
GRANT ALL ON FUNCTION postulaciones.fn_evaluar_postulacion_general(p_id_postulacion bigint, p_estado character varying, p_mensaje text) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_listar_mis_postulaciones(p_id_usuario bigint); Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON FUNCTION postulaciones.fn_listar_mis_postulaciones(p_id_usuario bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION postulaciones.fn_listar_mis_postulaciones(p_id_usuario bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION postulaciones.fn_listar_mis_postulaciones(p_id_usuario bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_categorias_empresa(p_id_empresa bigint); Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON FUNCTION postulaciones.fn_obtener_categorias_empresa(p_id_empresa bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION postulaciones.fn_obtener_categorias_empresa(p_id_empresa bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION postulaciones.fn_obtener_categorias_empresa(p_id_empresa bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_perfil_postulante(p_id_postulacion bigint); Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON FUNCTION postulaciones.fn_obtener_perfil_postulante(p_id_postulacion bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION postulaciones.fn_obtener_perfil_postulante(p_id_postulacion bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION postulaciones.fn_obtener_perfil_postulante(p_id_postulacion bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_postulantes_por_oferta(p_id_oferta bigint); Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON FUNCTION postulaciones.fn_obtener_postulantes_por_oferta(p_id_oferta bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION postulaciones.fn_obtener_postulantes_por_oferta(p_id_oferta bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION postulaciones.fn_obtener_postulantes_por_oferta(p_id_oferta bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_url_cv(p_id_postulacion bigint); Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON FUNCTION postulaciones.fn_obtener_url_cv(p_id_postulacion bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION postulaciones.fn_obtener_url_cv(p_id_postulacion bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION postulaciones.fn_obtener_url_cv(p_id_postulacion bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_reporte_postulaciones(p_estado_validacion character varying, p_fecha_inicio date, p_fecha_fin date, p_id_ciudad integer, p_id_categoria integer, p_id_modalidad integer); Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON FUNCTION postulaciones.fn_reporte_postulaciones(p_estado_validacion character varying, p_fecha_inicio date, p_fecha_fin date, p_id_ciudad integer, p_id_categoria integer, p_id_modalidad integer) TO "Miniadmin";
GRANT ALL ON FUNCTION postulaciones.fn_reporte_postulaciones(p_estado_validacion character varying, p_fecha_inicio date, p_fecha_fin date, p_id_ciudad integer, p_id_categoria integer, p_id_modalidad integer) TO "Prueba_011";
GRANT ALL ON FUNCTION postulaciones.fn_reporte_postulaciones(p_estado_validacion character varying, p_fecha_inicio date, p_fecha_fin date, p_id_ciudad integer, p_id_categoria integer, p_id_modalidad integer) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_resumen_cursos(p_id_postulacion bigint); Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON FUNCTION postulaciones.fn_resumen_cursos(p_id_postulacion bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION postulaciones.fn_resumen_cursos(p_id_postulacion bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION postulaciones.fn_resumen_cursos(p_id_postulacion bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_resumen_experiencia(p_id_postulacion bigint); Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON FUNCTION postulaciones.fn_resumen_experiencia(p_id_postulacion bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION postulaciones.fn_resumen_experiencia(p_id_postulacion bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION postulaciones.fn_resumen_experiencia(p_id_postulacion bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_resumen_formacion(p_id_postulacion bigint); Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON FUNCTION postulaciones.fn_resumen_formacion(p_id_postulacion bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION postulaciones.fn_resumen_formacion(p_id_postulacion bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION postulaciones.fn_resumen_formacion(p_id_postulacion bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_resumen_idiomas(p_id_postulacion bigint); Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON FUNCTION postulaciones.fn_resumen_idiomas(p_id_postulacion bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION postulaciones.fn_resumen_idiomas(p_id_postulacion bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION postulaciones.fn_resumen_idiomas(p_id_postulacion bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_resumen_perfil_base(p_id_postulacion bigint); Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON FUNCTION postulaciones.fn_resumen_perfil_base(p_id_postulacion bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION postulaciones.fn_resumen_perfil_base(p_id_postulacion bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION postulaciones.fn_resumen_perfil_base(p_id_postulacion bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_validar_item_individual(p_id_postulacion bigint, p_tipo_item character varying, p_id_item integer, p_estado character varying, p_observacion text); Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON FUNCTION postulaciones.fn_validar_item_individual(p_id_postulacion bigint, p_tipo_item character varying, p_id_item integer, p_estado character varying, p_observacion text) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_cancelar_postulacion(IN p_id_postulacion bigint); Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON PROCEDURE postulaciones.sp_cancelar_postulacion(IN p_id_postulacion bigint) TO "Miniadmin";
GRANT ALL ON PROCEDURE postulaciones.sp_cancelar_postulacion(IN p_id_postulacion bigint) TO "Prueba_011";
GRANT ALL ON PROCEDURE postulaciones.sp_cancelar_postulacion(IN p_id_postulacion bigint) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_registrar_postulacion(IN p_id_usuario bigint, IN p_id_oferta bigint, IN p_url_cv character varying, IN p_porcentaje_match integer, IN p_analisis_ia text); Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON PROCEDURE postulaciones.sp_registrar_postulacion(IN p_id_usuario bigint, IN p_id_oferta bigint, IN p_url_cv character varying, IN p_porcentaje_match integer, IN p_analisis_ia text) TO "Miniadmin";
GRANT ALL ON PROCEDURE postulaciones.sp_registrar_postulacion(IN p_id_usuario bigint, IN p_id_oferta bigint, IN p_url_cv character varying, IN p_porcentaje_match integer, IN p_analisis_ia text) TO "Prueba_011";
GRANT ALL ON PROCEDURE postulaciones.sp_registrar_postulacion(IN p_id_usuario bigint, IN p_id_oferta bigint, IN p_url_cv character varying, IN p_porcentaje_match integer, IN p_analisis_ia text) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_auditoria_catalogos(); Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON FUNCTION seguridad.fn_auditoria_catalogos() TO "Miniadmin";
GRANT ALL ON FUNCTION seguridad.fn_auditoria_catalogos() TO "Prueba_011";
GRANT ALL ON FUNCTION seguridad.fn_auditoria_catalogos() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_auditoria_general(); Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON FUNCTION seguridad.fn_auditoria_general() TO "Miniadmin";
GRANT ALL ON FUNCTION seguridad.fn_auditoria_general() TO "Prueba_011";
GRANT ALL ON FUNCTION seguridad.fn_auditoria_general() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_auditoria_ofertas(); Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON FUNCTION seguridad.fn_auditoria_ofertas() TO "Miniadmin";
GRANT ALL ON FUNCTION seguridad.fn_auditoria_ofertas() TO "Prueba_011";
GRANT ALL ON FUNCTION seguridad.fn_auditoria_ofertas() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_auditoria_plantilla_notificacion(); Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON FUNCTION seguridad.fn_auditoria_plantilla_notificacion() TO "Miniadmin";
GRANT ALL ON FUNCTION seguridad.fn_auditoria_plantilla_notificacion() TO "Prueba_011";
GRANT ALL ON FUNCTION seguridad.fn_auditoria_plantilla_notificacion() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_contar_auditorias_hoy(); Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON FUNCTION seguridad.fn_contar_auditorias_hoy() TO "Miniadmin";
GRANT ALL ON FUNCTION seguridad.fn_contar_auditorias_hoy() TO "Prueba_011";
GRANT ALL ON FUNCTION seguridad.fn_contar_auditorias_hoy() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_contar_auditorias_total(); Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON FUNCTION seguridad.fn_contar_auditorias_total() TO "Miniadmin";
GRANT ALL ON FUNCTION seguridad.fn_contar_auditorias_total() TO "Prueba_011";
GRANT ALL ON FUNCTION seguridad.fn_contar_auditorias_total() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_estadisticas_usuarios(); Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON FUNCTION seguridad.fn_estadisticas_usuarios() TO "Miniadmin";
GRANT ALL ON FUNCTION seguridad.fn_estadisticas_usuarios() TO "Prueba_011";
GRANT ALL ON FUNCTION seguridad.fn_estadisticas_usuarios() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_auditorias_historico(); Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON FUNCTION seguridad.fn_obtener_auditorias_historico() TO "Miniadmin";
GRANT ALL ON FUNCTION seguridad.fn_obtener_auditorias_historico() TO "Prueba_011";
GRANT ALL ON FUNCTION seguridad.fn_obtener_auditorias_historico() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_auditorias_top_usuarios_historico(); Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON FUNCTION seguridad.fn_obtener_auditorias_top_usuarios_historico() TO "Miniadmin";
GRANT ALL ON FUNCTION seguridad.fn_obtener_auditorias_top_usuarios_historico() TO "Prueba_011";
GRANT ALL ON FUNCTION seguridad.fn_obtener_auditorias_top_usuarios_historico() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_auditorias_ultimos_7_dias(); Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON FUNCTION seguridad.fn_obtener_auditorias_ultimos_7_dias() TO "Miniadmin";
GRANT ALL ON FUNCTION seguridad.fn_obtener_auditorias_ultimos_7_dias() TO "Prueba_011";
GRANT ALL ON FUNCTION seguridad.fn_obtener_auditorias_ultimos_7_dias() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_config_sistema(); Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON FUNCTION seguridad.fn_obtener_config_sistema() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_sesiones(); Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON FUNCTION seguridad.fn_obtener_sesiones() TO "Miniadmin";
GRANT ALL ON FUNCTION seguridad.fn_obtener_sesiones() TO "Prueba_011";
GRANT ALL ON FUNCTION seguridad.fn_obtener_sesiones() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_todos_usuarios(); Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON FUNCTION seguridad.fn_obtener_todos_usuarios() TO "Miniadmin";
GRANT ALL ON FUNCTION seguridad.fn_obtener_todos_usuarios() TO "Prueba_011";
GRANT ALL ON FUNCTION seguridad.fn_obtener_todos_usuarios() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_registrar_sesion(p_id_seguridad integer, p_ip_address character varying, p_navegador character varying, p_dispositivo character varying, p_accion character varying); Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON FUNCTION seguridad.fn_registrar_sesion(p_id_seguridad integer, p_ip_address character varying, p_navegador character varying, p_dispositivo character varying, p_accion character varying) TO "Miniadmin";
GRANT ALL ON FUNCTION seguridad.fn_registrar_sesion(p_id_seguridad integer, p_ip_address character varying, p_navegador character varying, p_dispositivo character varying, p_accion character varying) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_reporte_auditoria_usuario(p_id_usuario integer); Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON FUNCTION seguridad.fn_reporte_auditoria_usuario(p_id_usuario integer) TO "Miniadmin";
GRANT ALL ON FUNCTION seguridad.fn_reporte_auditoria_usuario(p_id_usuario integer) TO "Prueba_011";
GRANT ALL ON FUNCTION seguridad.fn_reporte_auditoria_usuario(p_id_usuario integer) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_resumen_auditoria_usuario(p_id_usuario integer); Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON FUNCTION seguridad.fn_resumen_auditoria_usuario(p_id_usuario integer) TO "Miniadmin";
GRANT ALL ON FUNCTION seguridad.fn_resumen_auditoria_usuario(p_id_usuario integer) TO "Prueba_011";
GRANT ALL ON FUNCTION seguridad.fn_resumen_auditoria_usuario(p_id_usuario integer) TO "AdminSupervisor";


--
-- Name: PROCEDURE registrousuariologin(IN p_correo text, IN p_id_usuario bigint, IN p_id_rol integer); Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON PROCEDURE seguridad.registrousuariologin(IN p_correo text, IN p_id_usuario bigint, IN p_id_rol integer) TO "Miniadmin";
GRANT ALL ON PROCEDURE seguridad.registrousuariologin(IN p_correo text, IN p_id_usuario bigint, IN p_id_rol integer) TO "Prueba_011";
GRANT ALL ON PROCEDURE seguridad.registrousuariologin(IN p_correo text, IN p_id_usuario bigint, IN p_id_rol integer) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_actualizar_config_sistema(IN p_datos jsonb); Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON PROCEDURE seguridad.sp_actualizar_config_sistema(IN p_datos jsonb) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_actualizar_logo_sistema(IN p_datos jsonb); Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON PROCEDURE seguridad.sp_actualizar_logo_sistema(IN p_datos jsonb) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_registrar_admin_interno(IN p_nombre text, IN p_apellido text, IN p_contrasena text, IN p_correo text, IN p_fecha_nacimiento date, IN p_genero text, IN p_telefono text, IN p_id_ciudad integer, IN p_id_rol integer); Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON PROCEDURE seguridad.sp_registrar_admin_interno(IN p_nombre text, IN p_apellido text, IN p_contrasena text, IN p_correo text, IN p_fecha_nacimiento date, IN p_genero text, IN p_telefono text, IN p_id_ciudad integer, IN p_id_rol integer) TO "Miniadmin";
GRANT ALL ON PROCEDURE seguridad.sp_registrar_admin_interno(IN p_nombre text, IN p_apellido text, IN p_contrasena text, IN p_correo text, IN p_fecha_nacimiento date, IN p_genero text, IN p_telefono text, IN p_id_ciudad integer, IN p_id_rol integer) TO "Prueba_011";
GRANT ALL ON PROCEDURE seguridad.sp_registrar_admin_interno(IN p_nombre text, IN p_apellido text, IN p_contrasena text, IN p_correo text, IN p_fecha_nacimiento date, IN p_genero text, IN p_telefono text, IN p_id_ciudad integer, IN p_id_rol integer) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_auditar_perfil_postulante(); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_auditar_perfil_postulante() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_buscar_empresas(p_termino character varying); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_buscar_empresas(p_termino character varying) TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_buscar_empresas(p_termino character varying) TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_buscar_empresas(p_termino character varying) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_contar_no_leidas(p_id_usuario bigint); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_contar_no_leidas(p_id_usuario bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_contar_no_leidas(p_id_usuario bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_contar_no_leidas(p_id_usuario bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_contar_notificaciones_empresa(p_id_empresa bigint); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_contar_notificaciones_empresa(p_id_empresa bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_contar_notificaciones_empresa(p_id_empresa bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_contar_notificaciones_empresa(p_id_empresa bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_contar_notificaciones_empresa_hoy(p_id_empresa bigint); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_contar_notificaciones_empresa_hoy(p_id_empresa bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_contar_notificaciones_empresa_hoy(p_id_empresa bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_contar_notificaciones_empresa_hoy(p_id_empresa bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_contar_notificaciones_no_leidas(p_id_usuario bigint); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_contar_notificaciones_no_leidas(p_id_usuario bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_contar_notificaciones_no_leidas(p_id_usuario bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_contar_notificaciones_no_leidas(p_id_usuario bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_contar_notificaciones_no_leidas_hoy(p_id_usuario bigint); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_contar_notificaciones_no_leidas_hoy(p_id_usuario bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_contar_notificaciones_no_leidas_hoy(p_id_usuario bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_contar_notificaciones_no_leidas_hoy(p_id_usuario bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_contar_usuarios_hoy(); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_contar_usuarios_hoy() TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_contar_usuarios_hoy() TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_contar_usuarios_hoy() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_eliminar_item_perfil(p_id_usuario bigint, p_tipo_item character varying, p_id_item integer); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_eliminar_item_perfil(p_id_usuario bigint, p_tipo_item character varying, p_id_item integer) TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_eliminar_item_perfil(p_id_usuario bigint, p_tipo_item character varying, p_id_item integer) TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_eliminar_item_perfil(p_id_usuario bigint, p_tipo_item character varying, p_id_item integer) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_enlazar_permisos_rol(p_json_data json); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_enlazar_permisos_rol(p_json_data json) TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_enlazar_permisos_rol(p_json_data json) TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_enlazar_permisos_rol(p_json_data json) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_existe_notificacion_tipo(p_id_usuario bigint, p_tipo character varying); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_existe_notificacion_tipo(p_id_usuario bigint, p_tipo character varying) TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_existe_notificacion_tipo(p_id_usuario bigint, p_tipo character varying) TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_existe_notificacion_tipo(p_id_usuario bigint, p_tipo character varying) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_notificaciones_activas(p_id_usuario bigint); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_obtener_notificaciones_activas(p_id_usuario bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_obtener_notificaciones_activas(p_id_usuario bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_obtener_notificaciones_activas(p_id_usuario bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_notificaciones_empresa_historico(p_id_empresa bigint); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_obtener_notificaciones_empresa_historico(p_id_empresa bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_obtener_notificaciones_empresa_historico(p_id_empresa bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_obtener_notificaciones_empresa_historico(p_id_empresa bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_notificaciones_empresa_ultimos_7_dias(p_id_empresa bigint); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_obtener_notificaciones_empresa_ultimos_7_dias(p_id_empresa bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_obtener_notificaciones_empresa_ultimos_7_dias(p_id_empresa bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_obtener_notificaciones_empresa_ultimos_7_dias(p_id_empresa bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_notificaciones_no_leidas_historico(p_id_usuario bigint); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_obtener_notificaciones_no_leidas_historico(p_id_usuario bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_obtener_notificaciones_no_leidas_historico(p_id_usuario bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_obtener_notificaciones_no_leidas_historico(p_id_usuario bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_notificaciones_no_leidas_ultimos_7_dias(p_id_usuario bigint); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_obtener_notificaciones_no_leidas_ultimos_7_dias(p_id_usuario bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_obtener_notificaciones_no_leidas_ultimos_7_dias(p_id_usuario bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_obtener_notificaciones_no_leidas_ultimos_7_dias(p_id_usuario bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_notificaciones_usuario(p_id_usuario bigint); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_obtener_notificaciones_usuario(p_id_usuario bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_obtener_notificaciones_usuario(p_id_usuario bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_obtener_notificaciones_usuario(p_id_usuario bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_perfil_profesional(p_id_usuario bigint); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_obtener_perfil_profesional(p_id_usuario bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_obtener_perfil_profesional(p_id_usuario bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_obtener_perfil_profesional(p_id_usuario bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_perfil_usuario(p_id_usuario bigint); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_obtener_perfil_usuario(p_id_usuario bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_postulantes_auditoria(p_json json); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_obtener_postulantes_auditoria(p_json json) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_trazabilidad_postulante(p_json json); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_obtener_trazabilidad_postulante(p_json json) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_url_imagen(p_id_usuario bigint); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_obtener_url_imagen(p_id_usuario bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_obtener_url_imagen(p_id_usuario bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_obtener_url_imagen(p_id_usuario bigint) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_usuarios_historico(); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_obtener_usuarios_historico() TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_obtener_usuarios_historico() TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_obtener_usuarios_historico() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_usuarios_tabla(p_json json); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_obtener_usuarios_tabla(p_json json) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_obtener_usuarios_ultimos_7_dias(); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_obtener_usuarios_ultimos_7_dias() TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_obtener_usuarios_ultimos_7_dias() TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_obtener_usuarios_ultimos_7_dias() TO "AdminSupervisor";


--
-- Name: FUNCTION fn_registrar_item_perfil(p_id_usuario bigint, p_tipo_item character varying, p_datos jsonb, p_archivo character varying); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_registrar_item_perfil(p_id_usuario bigint, p_tipo_item character varying, p_datos jsonb, p_archivo character varying) TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_registrar_item_perfil(p_id_usuario bigint, p_tipo_item character varying, p_datos jsonb, p_archivo character varying) TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_registrar_item_perfil(p_id_usuario bigint, p_tipo_item character varying, p_datos jsonb, p_archivo character varying) TO "AdminSupervisor";


--
-- Name: FUNCTION fn_ultima_imagen_empresa(p_id_empresa bigint); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON FUNCTION usuarios.fn_ultima_imagen_empresa(p_id_empresa bigint) TO "Miniadmin";
GRANT ALL ON FUNCTION usuarios.fn_ultima_imagen_empresa(p_id_empresa bigint) TO "Prueba_011";
GRANT ALL ON FUNCTION usuarios.fn_ultima_imagen_empresa(p_id_empresa bigint) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_actualizar_curso(IN p_id_curso integer, IN p_nombre_curso character varying, IN p_institucion character varying, IN p_horas_duracion integer, IN p_archivo character varying); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON PROCEDURE usuarios.sp_actualizar_curso(IN p_id_curso integer, IN p_nombre_curso character varying, IN p_institucion character varying, IN p_horas_duracion integer, IN p_archivo character varying) TO "Miniadmin";
GRANT ALL ON PROCEDURE usuarios.sp_actualizar_curso(IN p_id_curso integer, IN p_nombre_curso character varying, IN p_institucion character varying, IN p_horas_duracion integer, IN p_archivo character varying) TO "Prueba_011";
GRANT ALL ON PROCEDURE usuarios.sp_actualizar_curso(IN p_id_curso integer, IN p_nombre_curso character varying, IN p_institucion character varying, IN p_horas_duracion integer, IN p_archivo character varying) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_actualizar_datos_personales(IN p_id_usuario bigint, IN p_nombre character varying, IN p_apellido character varying, IN p_fecha_nacimiento date, IN p_genero character varying, IN p_telefono character varying, IN p_id_ciudad integer); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON PROCEDURE usuarios.sp_actualizar_datos_personales(IN p_id_usuario bigint, IN p_nombre character varying, IN p_apellido character varying, IN p_fecha_nacimiento date, IN p_genero character varying, IN p_telefono character varying, IN p_id_ciudad integer) TO "Miniadmin";
GRANT ALL ON PROCEDURE usuarios.sp_actualizar_datos_personales(IN p_id_usuario bigint, IN p_nombre character varying, IN p_apellido character varying, IN p_fecha_nacimiento date, IN p_genero character varying, IN p_telefono character varying, IN p_id_ciudad integer) TO "Prueba_011";
GRANT ALL ON PROCEDURE usuarios.sp_actualizar_datos_personales(IN p_id_usuario bigint, IN p_nombre character varying, IN p_apellido character varying, IN p_fecha_nacimiento date, IN p_genero character varying, IN p_telefono character varying, IN p_id_ciudad integer) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_actualizar_experiencia(IN p_id_exp_laboral integer, IN p_id_empresa_catalogo integer, IN p_fecha_inicio date, IN p_fecha_fin date, IN p_descripcion text, IN p_id_ciudad integer, IN p_archivo character varying, IN p_cargos_ids text); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON PROCEDURE usuarios.sp_actualizar_experiencia(IN p_id_exp_laboral integer, IN p_id_empresa_catalogo integer, IN p_fecha_inicio date, IN p_fecha_fin date, IN p_descripcion text, IN p_id_ciudad integer, IN p_archivo character varying, IN p_cargos_ids text) TO "Miniadmin";
GRANT ALL ON PROCEDURE usuarios.sp_actualizar_experiencia(IN p_id_exp_laboral integer, IN p_id_empresa_catalogo integer, IN p_fecha_inicio date, IN p_fecha_fin date, IN p_descripcion text, IN p_id_ciudad integer, IN p_archivo character varying, IN p_cargos_ids text) TO "Prueba_011";
GRANT ALL ON PROCEDURE usuarios.sp_actualizar_experiencia(IN p_id_exp_laboral integer, IN p_id_empresa_catalogo integer, IN p_fecha_inicio date, IN p_fecha_fin date, IN p_descripcion text, IN p_id_ciudad integer, IN p_archivo character varying, IN p_cargos_ids text) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_actualizar_formacion_academica(IN p_id_academico integer, IN p_id_carrera integer, IN p_fecha_graduacion text, IN p_registro_senescyt character varying, IN p_archivo character varying); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON PROCEDURE usuarios.sp_actualizar_formacion_academica(IN p_id_academico integer, IN p_id_carrera integer, IN p_fecha_graduacion text, IN p_registro_senescyt character varying, IN p_archivo character varying) TO "Miniadmin";
GRANT ALL ON PROCEDURE usuarios.sp_actualizar_formacion_academica(IN p_id_academico integer, IN p_id_carrera integer, IN p_fecha_graduacion text, IN p_registro_senescyt character varying, IN p_archivo character varying) TO "Prueba_011";
GRANT ALL ON PROCEDURE usuarios.sp_actualizar_formacion_academica(IN p_id_academico integer, IN p_id_carrera integer, IN p_fecha_graduacion text, IN p_registro_senescyt character varying, IN p_archivo character varying) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_actualizar_idioma(IN p_id_usuario_idioma integer, IN p_id_idioma integer, IN p_nivel character varying, IN p_archivo character varying); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON PROCEDURE usuarios.sp_actualizar_idioma(IN p_id_usuario_idioma integer, IN p_id_idioma integer, IN p_nivel character varying, IN p_archivo character varying) TO "Miniadmin";
GRANT ALL ON PROCEDURE usuarios.sp_actualizar_idioma(IN p_id_usuario_idioma integer, IN p_id_idioma integer, IN p_nivel character varying, IN p_archivo character varying) TO "Prueba_011";
GRANT ALL ON PROCEDURE usuarios.sp_actualizar_idioma(IN p_id_usuario_idioma integer, IN p_id_idioma integer, IN p_nivel character varying, IN p_archivo character varying) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_actualizar_perfil_usuario(IN p_id_usuario bigint, IN p_datos jsonb); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON PROCEDURE usuarios.sp_actualizar_perfil_usuario(IN p_id_usuario bigint, IN p_datos jsonb) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_guardar_url_imagen(IN p_id_usuario bigint, IN p_url_imagen text); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON PROCEDURE usuarios.sp_guardar_url_imagen(IN p_id_usuario bigint, IN p_url_imagen text) TO "Miniadmin";
GRANT ALL ON PROCEDURE usuarios.sp_guardar_url_imagen(IN p_id_usuario bigint, IN p_url_imagen text) TO "Prueba_011";
GRANT ALL ON PROCEDURE usuarios.sp_guardar_url_imagen(IN p_id_usuario bigint, IN p_url_imagen text) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_insertar_perfil_academico(IN p_id_usuario bigint, IN p_id_carrera integer, IN p_fecha_graduacion date, IN p_numero_registro_senescyt character varying, IN p_fecha_registro date); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON PROCEDURE usuarios.sp_insertar_perfil_academico(IN p_id_usuario bigint, IN p_id_carrera integer, IN p_fecha_graduacion date, IN p_numero_registro_senescyt character varying, IN p_fecha_registro date) TO "Miniadmin";
GRANT ALL ON PROCEDURE usuarios.sp_insertar_perfil_academico(IN p_id_usuario bigint, IN p_id_carrera integer, IN p_fecha_graduacion date, IN p_numero_registro_senescyt character varying, IN p_fecha_registro date) TO "Prueba_011";
GRANT ALL ON PROCEDURE usuarios.sp_insertar_perfil_academico(IN p_id_usuario bigint, IN p_id_carrera integer, IN p_fecha_graduacion date, IN p_numero_registro_senescyt character varying, IN p_fecha_registro date) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_marcar_todas_leidas(IN p_id_usuario bigint); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON PROCEDURE usuarios.sp_marcar_todas_leidas(IN p_id_usuario bigint) TO "Miniadmin";
GRANT ALL ON PROCEDURE usuarios.sp_marcar_todas_leidas(IN p_id_usuario bigint) TO "Prueba_011";
GRANT ALL ON PROCEDURE usuarios.sp_marcar_todas_leidas(IN p_id_usuario bigint) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_registrar_exp_laboral(IN p_id_usuario bigint, IN p_id_cargo integer, IN p_id_empresa_catalogo integer, IN p_fecha_inicio date, IN p_fecha_fin date, IN p_descripcion text, IN p_ubicacion character varying, IN p_url_comprobante character varying); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON PROCEDURE usuarios.sp_registrar_exp_laboral(IN p_id_usuario bigint, IN p_id_cargo integer, IN p_id_empresa_catalogo integer, IN p_fecha_inicio date, IN p_fecha_fin date, IN p_descripcion text, IN p_ubicacion character varying, IN p_url_comprobante character varying) TO "Miniadmin";
GRANT ALL ON PROCEDURE usuarios.sp_registrar_exp_laboral(IN p_id_usuario bigint, IN p_id_cargo integer, IN p_id_empresa_catalogo integer, IN p_fecha_inicio date, IN p_fecha_fin date, IN p_descripcion text, IN p_ubicacion character varying, IN p_url_comprobante character varying) TO "Prueba_011";
GRANT ALL ON PROCEDURE usuarios.sp_registrar_exp_laboral(IN p_id_usuario bigint, IN p_id_cargo integer, IN p_id_empresa_catalogo integer, IN p_fecha_inicio date, IN p_fecha_fin date, IN p_descripcion text, IN p_ubicacion character varying, IN p_url_comprobante character varying) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_registrar_idioma_usuario(IN p_id_usuario bigint, IN p_id_idioma integer, IN p_nivel character varying, IN p_url_certificado character varying, IN p_codigo_certificado character varying); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON PROCEDURE usuarios.sp_registrar_idioma_usuario(IN p_id_usuario bigint, IN p_id_idioma integer, IN p_nivel character varying, IN p_url_certificado character varying, IN p_codigo_certificado character varying) TO "Miniadmin";
GRANT ALL ON PROCEDURE usuarios.sp_registrar_idioma_usuario(IN p_id_usuario bigint, IN p_id_idioma integer, IN p_nivel character varying, IN p_url_certificado character varying, IN p_codigo_certificado character varying) TO "Prueba_011";
GRANT ALL ON PROCEDURE usuarios.sp_registrar_idioma_usuario(IN p_id_usuario bigint, IN p_id_idioma integer, IN p_nivel character varying, IN p_url_certificado character varying, IN p_codigo_certificado character varying) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_registrar_perfil_academico(IN p_id_usuario bigint, IN p_id_carrera integer, IN p_fecha_graduacion date, IN p_numero_senescyt character varying, IN p_url_archivo character varying); Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON PROCEDURE usuarios.sp_registrar_perfil_academico(IN p_id_usuario bigint, IN p_id_carrera integer, IN p_fecha_graduacion date, IN p_numero_senescyt character varying, IN p_url_archivo character varying) TO "Miniadmin";
GRANT ALL ON PROCEDURE usuarios.sp_registrar_perfil_academico(IN p_id_usuario bigint, IN p_id_carrera integer, IN p_fecha_graduacion date, IN p_numero_senescyt character varying, IN p_url_archivo character varying) TO "Prueba_011";
GRANT ALL ON PROCEDURE usuarios.sp_registrar_perfil_academico(IN p_id_usuario bigint, IN p_id_carrera integer, IN p_fecha_graduacion date, IN p_numero_senescyt character varying, IN p_url_archivo character varying) TO "AdminSupervisor";


--
-- Name: PROCEDURE sp_registrar_postulante(IN p_nombre character varying, IN p_apellido character varying, IN p_contrasena character varying, IN p_correo character varying, IN p_fecha_nacimiento date, IN p_genero character varying, IN p_telefono character varying, IN p_id_ciudad integer, IN p_id_rol integer); Type: ACL; Schema: usuarios; Owner: postgres
--

GRANT ALL ON PROCEDURE usuarios.sp_registrar_postulante(IN p_nombre character varying, IN p_apellido character varying, IN p_contrasena character varying, IN p_correo character varying, IN p_fecha_nacimiento date, IN p_genero character varying, IN p_telefono character varying, IN p_id_ciudad integer, IN p_id_rol integer) TO "Miniadmin";
GRANT ALL ON PROCEDURE usuarios.sp_registrar_postulante(IN p_nombre character varying, IN p_apellido character varying, IN p_contrasena character varying, IN p_correo character varying, IN p_fecha_nacimiento date, IN p_genero character varying, IN p_telefono character varying, IN p_id_ciudad integer, IN p_id_rol integer) TO "Prueba_011";
GRANT ALL ON PROCEDURE usuarios.sp_registrar_postulante(IN p_nombre character varying, IN p_apellido character varying, IN p_contrasena character varying, IN p_correo character varying, IN p_fecha_nacimiento date, IN p_genero character varying, IN p_telefono character varying, IN p_id_ciudad integer, IN p_id_rol integer) TO "AdminSupervisor";


--
-- Name: SEQUENCE cargo_id_cargo_seq; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON SEQUENCE catalogos.cargo_id_cargo_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE catalogos.cargo_id_cargo_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE catalogos.cargo_id_cargo_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE catalogos.cargo_id_cargo_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE catalogos.cargo_id_cargo_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE catalogos.cargo_id_cargo_seq TO "AdminSupervisor";


--
-- Name: TABLE carrera; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON TABLE catalogos.carrera TO grupo_administrador;
GRANT SELECT ON TABLE catalogos.carrera TO grupo_gerente;
GRANT SELECT ON TABLE catalogos.carrera TO grupo_supervisor;
GRANT SELECT ON TABLE catalogos.carrera TO grupo_postulante;
GRANT SELECT ON TABLE catalogos.carrera TO grupo_empresa;
GRANT ALL ON TABLE catalogos.carrera TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.carrera TO "SUPE";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.carrera TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.carrera TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.carrera TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.carrera TO "RolZasque";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.carrera TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.carrera TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.carrera TO "AdminSupervisor";


--
-- Name: SEQUENCE carrera_id_carrera_seq; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON SEQUENCE catalogos.carrera_id_carrera_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE catalogos.carrera_id_carrera_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE catalogos.carrera_id_carrera_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE catalogos.carrera_id_carrera_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE catalogos.carrera_id_carrera_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE catalogos.carrera_id_carrera_seq TO "AdminSupervisor";


--
-- Name: TABLE catalogo_habilidad; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON TABLE catalogos.catalogo_habilidad TO grupo_administrador;
GRANT SELECT ON TABLE catalogos.catalogo_habilidad TO grupo_gerente;
GRANT SELECT ON TABLE catalogos.catalogo_habilidad TO grupo_supervisor;
GRANT SELECT ON TABLE catalogos.catalogo_habilidad TO grupo_empresa;
GRANT ALL ON TABLE catalogos.catalogo_habilidad TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT ON TABLE catalogos.catalogo_habilidad TO "jeremyjaramillo567@gmail.com";
GRANT SELECT ON TABLE catalogos.catalogo_habilidad TO grupo_postulante;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.catalogo_habilidad TO "SUPE";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.catalogo_habilidad TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.catalogo_habilidad TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.catalogo_habilidad TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.catalogo_habilidad TO "RolZasque";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.catalogo_habilidad TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.catalogo_habilidad TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.catalogo_habilidad TO "AdminSupervisor";


--
-- Name: SEQUENCE catalogo_habilidad_id_habilidad_seq; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON SEQUENCE catalogos.catalogo_habilidad_id_habilidad_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE catalogos.catalogo_habilidad_id_habilidad_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE catalogos.catalogo_habilidad_id_habilidad_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE catalogos.catalogo_habilidad_id_habilidad_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE catalogos.catalogo_habilidad_id_habilidad_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE catalogos.catalogo_habilidad_id_habilidad_seq TO "AdminSupervisor";


--
-- Name: TABLE categoria_oferta; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON TABLE catalogos.categoria_oferta TO grupo_administrador;
GRANT SELECT ON TABLE catalogos.categoria_oferta TO grupo_gerente;
GRANT SELECT ON TABLE catalogos.categoria_oferta TO grupo_supervisor;
GRANT SELECT ON TABLE catalogos.categoria_oferta TO grupo_empresa;
GRANT SELECT ON TABLE catalogos.categoria_oferta TO grupo_postulante;
GRANT ALL ON TABLE catalogos.categoria_oferta TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.categoria_oferta TO "SUPE";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.categoria_oferta TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.categoria_oferta TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.categoria_oferta TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.categoria_oferta TO "RolZasque";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.categoria_oferta TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.categoria_oferta TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.categoria_oferta TO "AdminSupervisor";


--
-- Name: SEQUENCE categoria_oferta_id_categoria_seq; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON SEQUENCE catalogos.categoria_oferta_id_categoria_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE catalogos.categoria_oferta_id_categoria_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE catalogos.categoria_oferta_id_categoria_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE catalogos.categoria_oferta_id_categoria_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE catalogos.categoria_oferta_id_categoria_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE catalogos.categoria_oferta_id_categoria_seq TO "AdminSupervisor";


--
-- Name: TABLE ciudad; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON TABLE catalogos.ciudad TO grupo_administrador;
GRANT SELECT ON TABLE catalogos.ciudad TO grupo_gerente;
GRANT SELECT ON TABLE catalogos.ciudad TO grupo_supervisor;
GRANT SELECT ON TABLE catalogos.ciudad TO grupo_empresa;
GRANT SELECT ON TABLE catalogos.ciudad TO grupo_postulante;
GRANT ALL ON TABLE catalogos.ciudad TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.ciudad TO "SUPE";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.ciudad TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.ciudad TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.ciudad TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.ciudad TO "RolZasque";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.ciudad TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.ciudad TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.ciudad TO "AdminSupervisor";


--
-- Name: SEQUENCE ciudad_id_ciudad_seq; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON SEQUENCE catalogos.ciudad_id_ciudad_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE catalogos.ciudad_id_ciudad_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE catalogos.ciudad_id_ciudad_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE catalogos.ciudad_id_ciudad_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE catalogos.ciudad_id_ciudad_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE catalogos.ciudad_id_ciudad_seq TO "AdminSupervisor";


--
-- Name: TABLE facultad; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON TABLE catalogos.facultad TO grupo_administrador;
GRANT SELECT ON TABLE catalogos.facultad TO grupo_gerente;
GRANT SELECT ON TABLE catalogos.facultad TO grupo_supervisor;
GRANT SELECT ON TABLE catalogos.facultad TO grupo_postulante;
GRANT SELECT ON TABLE catalogos.facultad TO grupo_empresa;
GRANT ALL ON TABLE catalogos.facultad TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.facultad TO "SUPE";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.facultad TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.facultad TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.facultad TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.facultad TO "RolZasque";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.facultad TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.facultad TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.facultad TO "AdminSupervisor";


--
-- Name: SEQUENCE facultad_id_facultad_seq; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON SEQUENCE catalogos.facultad_id_facultad_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE catalogos.facultad_id_facultad_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE catalogos.facultad_id_facultad_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE catalogos.facultad_id_facultad_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE catalogos.facultad_id_facultad_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE catalogos.facultad_id_facultad_seq TO "AdminSupervisor";


--
-- Name: TABLE idioma; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON TABLE catalogos.idioma TO grupo_administrador;
GRANT SELECT ON TABLE catalogos.idioma TO grupo_gerente;
GRANT SELECT ON TABLE catalogos.idioma TO grupo_supervisor;
GRANT SELECT ON TABLE catalogos.idioma TO grupo_empresa;
GRANT ALL ON TABLE catalogos.idioma TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,UPDATE ON TABLE catalogos.idioma TO grupo_postulante;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.idioma TO "SUPE";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.idioma TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.idioma TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.idioma TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.idioma TO "RolZasque";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.idioma TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.idioma TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.idioma TO "AdminSupervisor";


--
-- Name: SEQUENCE idioma_id_idioma_seq; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON SEQUENCE catalogos.idioma_id_idioma_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE catalogos.idioma_id_idioma_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE catalogos.idioma_id_idioma_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE catalogos.idioma_id_idioma_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE catalogos.idioma_id_idioma_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE catalogos.idioma_id_idioma_seq TO "AdminSupervisor";


--
-- Name: TABLE imagen; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON TABLE catalogos.imagen TO grupo_administrador;
GRANT SELECT ON TABLE catalogos.imagen TO grupo_gerente;
GRANT SELECT ON TABLE catalogos.imagen TO grupo_supervisor;
GRANT SELECT,INSERT,UPDATE ON TABLE catalogos.imagen TO grupo_empresa;
GRANT SELECT,INSERT,UPDATE ON TABLE catalogos.imagen TO grupo_postulante;
GRANT ALL ON TABLE catalogos.imagen TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.imagen TO "SUPE";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.imagen TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.imagen TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.imagen TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.imagen TO "RolZasque";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.imagen TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.imagen TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.imagen TO "AdminSupervisor";


--
-- Name: SEQUENCE imagen_id_imagen_seq; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON SEQUENCE catalogos.imagen_id_imagen_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE catalogos.imagen_id_imagen_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE catalogos.imagen_id_imagen_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE catalogos.imagen_id_imagen_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE catalogos.imagen_id_imagen_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE catalogos.imagen_id_imagen_seq TO "AdminSupervisor";


--
-- Name: TABLE jornada_oferta; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON TABLE catalogos.jornada_oferta TO grupo_administrador;
GRANT SELECT ON TABLE catalogos.jornada_oferta TO grupo_gerente;
GRANT SELECT ON TABLE catalogos.jornada_oferta TO grupo_supervisor;
GRANT SELECT ON TABLE catalogos.jornada_oferta TO grupo_empresa;
GRANT SELECT ON TABLE catalogos.jornada_oferta TO grupo_postulante;
GRANT ALL ON TABLE catalogos.jornada_oferta TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.jornada_oferta TO "SUPE";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.jornada_oferta TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.jornada_oferta TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.jornada_oferta TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.jornada_oferta TO "RolZasque";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.jornada_oferta TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.jornada_oferta TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.jornada_oferta TO "AdminSupervisor";


--
-- Name: SEQUENCE jornada_oferta_id_jornada_seq; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON SEQUENCE catalogos.jornada_oferta_id_jornada_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE catalogos.jornada_oferta_id_jornada_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE catalogos.jornada_oferta_id_jornada_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE catalogos.jornada_oferta_id_jornada_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE catalogos.jornada_oferta_id_jornada_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE catalogos.jornada_oferta_id_jornada_seq TO "AdminSupervisor";


--
-- Name: TABLE modalidad_oferta; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON TABLE catalogos.modalidad_oferta TO grupo_administrador;
GRANT SELECT ON TABLE catalogos.modalidad_oferta TO grupo_gerente;
GRANT SELECT ON TABLE catalogos.modalidad_oferta TO grupo_supervisor;
GRANT SELECT ON TABLE catalogos.modalidad_oferta TO grupo_empresa;
GRANT SELECT ON TABLE catalogos.modalidad_oferta TO grupo_postulante;
GRANT ALL ON TABLE catalogos.modalidad_oferta TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.modalidad_oferta TO "SUPE";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.modalidad_oferta TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.modalidad_oferta TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.modalidad_oferta TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.modalidad_oferta TO "RolZasque";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.modalidad_oferta TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.modalidad_oferta TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.modalidad_oferta TO "AdminSupervisor";


--
-- Name: SEQUENCE modalidad_oferta_id_modalidad_seq; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON SEQUENCE catalogos.modalidad_oferta_id_modalidad_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE catalogos.modalidad_oferta_id_modalidad_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE catalogos.modalidad_oferta_id_modalidad_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE catalogos.modalidad_oferta_id_modalidad_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE catalogos.modalidad_oferta_id_modalidad_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE catalogos.modalidad_oferta_id_modalidad_seq TO "AdminSupervisor";


--
-- Name: TABLE plantilla_notificacion; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.plantilla_notificacion TO grupo_administrador;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.plantilla_notificacion TO grupo_postulante;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.plantilla_notificacion TO grupo_empresa;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.plantilla_notificacion TO grupo_supervisor;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.plantilla_notificacion TO grupo_gerente;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.plantilla_notificacion TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.plantilla_notificacion TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.plantilla_notificacion TO "AdminSupervisor";


--
-- Name: SEQUENCE plantilla_notificacion_id_plantilla_seq; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT SELECT,USAGE ON SEQUENCE catalogos.plantilla_notificacion_id_plantilla_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE catalogos.plantilla_notificacion_id_plantilla_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE catalogos.plantilla_notificacion_id_plantilla_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE catalogos.plantilla_notificacion_id_plantilla_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE catalogos.plantilla_notificacion_id_plantilla_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE catalogos.plantilla_notificacion_id_plantilla_seq TO "AdminSupervisor";


--
-- Name: TABLE provincia; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON TABLE catalogos.provincia TO grupo_administrador;
GRANT SELECT ON TABLE catalogos.provincia TO grupo_gerente;
GRANT SELECT ON TABLE catalogos.provincia TO grupo_supervisor;
GRANT SELECT ON TABLE catalogos.provincia TO grupo_empresa;
GRANT SELECT ON TABLE catalogos.provincia TO grupo_postulante;
GRANT ALL ON TABLE catalogos.provincia TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.provincia TO "SUPE";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.provincia TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.provincia TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.provincia TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.provincia TO "RolZasque";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.provincia TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.provincia TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.provincia TO "AdminSupervisor";


--
-- Name: SEQUENCE provincia_id_provincia_seq; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON SEQUENCE catalogos.provincia_id_provincia_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE catalogos.provincia_id_provincia_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE catalogos.provincia_id_provincia_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE catalogos.provincia_id_provincia_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE catalogos.provincia_id_provincia_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE catalogos.provincia_id_provincia_seq TO "AdminSupervisor";


--
-- Name: TABLE tipo_habilidad; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON TABLE catalogos.tipo_habilidad TO grupo_administrador;
GRANT SELECT ON TABLE catalogos.tipo_habilidad TO grupo_gerente;
GRANT SELECT ON TABLE catalogos.tipo_habilidad TO grupo_supervisor;
GRANT SELECT ON TABLE catalogos.tipo_habilidad TO grupo_empresa;
GRANT ALL ON TABLE catalogos.tipo_habilidad TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.tipo_habilidad TO "SUPE";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.tipo_habilidad TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.tipo_habilidad TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.tipo_habilidad TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.tipo_habilidad TO "RolZasque";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.tipo_habilidad TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.tipo_habilidad TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE catalogos.tipo_habilidad TO "AdminSupervisor";


--
-- Name: SEQUENCE tipo_habilidad_id_tipo_habilidad_seq; Type: ACL; Schema: catalogos; Owner: adminAzure
--

GRANT ALL ON SEQUENCE catalogos.tipo_habilidad_id_tipo_habilidad_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE catalogos.tipo_habilidad_id_tipo_habilidad_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE catalogos.tipo_habilidad_id_tipo_habilidad_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE catalogos.tipo_habilidad_id_tipo_habilidad_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE catalogos.tipo_habilidad_id_tipo_habilidad_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE catalogos.tipo_habilidad_id_tipo_habilidad_seq TO "AdminSupervisor";


--
-- Name: TABLE catalogo_empresa; Type: ACL; Schema: empresas; Owner: adminAzure
--

GRANT ALL ON TABLE empresas.catalogo_empresa TO grupo_administrador;
GRANT SELECT ON TABLE empresas.catalogo_empresa TO grupo_gerente;
GRANT SELECT,INSERT,UPDATE ON TABLE empresas.catalogo_empresa TO grupo_postulante;
GRANT SELECT ON TABLE empresas.catalogo_empresa TO grupo_empresa;
GRANT ALL ON TABLE empresas.catalogo_empresa TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE empresas.catalogo_empresa TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE empresas.catalogo_empresa TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE empresas.catalogo_empresa TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE empresas.catalogo_empresa TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE empresas.catalogo_empresa TO "AdminSupervisor";


--
-- Name: COLUMN catalogo_empresa.es_verificada; Type: ACL; Schema: empresas; Owner: adminAzure
--

GRANT UPDATE(es_verificada) ON TABLE empresas.catalogo_empresa TO grupo_gerente;


--
-- Name: SEQUENCE catalogo_empresa_id_empresa_catalogo_seq; Type: ACL; Schema: empresas; Owner: adminAzure
--

GRANT ALL ON SEQUENCE empresas.catalogo_empresa_id_empresa_catalogo_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE empresas.catalogo_empresa_id_empresa_catalogo_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE empresas.catalogo_empresa_id_empresa_catalogo_seq TO "AdminSupervisor";


--
-- Name: TABLE usuario_empresa; Type: ACL; Schema: empresas; Owner: adminAzure
--

GRANT ALL ON TABLE empresas.usuario_empresa TO grupo_administrador;
GRANT SELECT ON TABLE empresas.usuario_empresa TO grupo_gerente;
GRANT SELECT,UPDATE ON TABLE empresas.usuario_empresa TO grupo_empresa;
GRANT ALL ON TABLE empresas.usuario_empresa TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,UPDATE ON TABLE empresas.usuario_empresa TO grupo_postulante;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE empresas.usuario_empresa TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE empresas.usuario_empresa TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE empresas.usuario_empresa TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE empresas.usuario_empresa TO "AdminSupervisor";


--
-- Name: SEQUENCE usuario_empresa_id_empresa_seq; Type: ACL; Schema: empresas; Owner: adminAzure
--

GRANT ALL ON SEQUENCE empresas.usuario_empresa_id_empresa_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE empresas.usuario_empresa_id_empresa_seq TO "AdminSupervisor";


--
-- Name: TABLE roles; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON TABLE usuarios.roles TO grupo_administrador;
GRANT SELECT ON TABLE usuarios.roles TO grupo_empresa;
GRANT ALL ON TABLE usuarios.roles TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.roles TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.roles TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.roles TO "Prueba_011";
GRANT SELECT ON TABLE usuarios.roles TO grupo_postulante;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.roles TO "AdminSupervisor";


--
-- Name: TABLE usuario; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON TABLE usuarios.usuario TO grupo_administrador;
GRANT SELECT,UPDATE ON TABLE usuarios.usuario TO grupo_empresa;
GRANT SELECT,UPDATE ON TABLE usuarios.usuario TO grupo_postulante;
GRANT ALL ON TABLE usuarios.usuario TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.usuario TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.usuario TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.usuario TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.usuario TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.usuario TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.usuario TO "AdminSupervisor";


--
-- Name: TABLE v_empresas_admin; Type: ACL; Schema: empresas; Owner: adminAzure
--

GRANT ALL ON TABLE empresas.v_empresas_admin TO grupo_administrador;
GRANT SELECT ON TABLE empresas.v_empresas_admin TO grupo_gerente;
GRANT ALL ON TABLE empresas.v_empresas_admin TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE empresas.v_empresas_admin TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE empresas.v_empresas_admin TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE empresas.v_empresas_admin TO "AdminSupervisor";


--
-- Name: TABLE historial_oferta; Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON TABLE ofertas.historial_oferta TO "c.ramirez@empresa.com";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.historial_oferta TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.historial_oferta TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.historial_oferta TO "AdminSupervisor";


--
-- Name: SEQUENCE historial_oferta_id_historial_seq; Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT SELECT,USAGE ON SEQUENCE ofertas.historial_oferta_id_historial_seq TO "c.ramirez@empresa.com";
GRANT SELECT,USAGE ON SEQUENCE ofertas.historial_oferta_id_historial_seq TO "AdminSupervisor";


--
-- Name: TABLE oferta_externa_guardada; Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT SELECT,INSERT ON TABLE ofertas.oferta_externa_guardada TO grupo_postulante;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.oferta_externa_guardada TO "AdminSupervisor";


--
-- Name: TABLE oferta_habilidad_seleccionada; Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON TABLE ofertas.oferta_habilidad_seleccionada TO grupo_administrador;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.oferta_habilidad_seleccionada TO grupo_empresa;
GRANT ALL ON TABLE ofertas.oferta_habilidad_seleccionada TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT ON TABLE ofertas.oferta_habilidad_seleccionada TO "jeremyjaramillo567@gmail.com";
GRANT SELECT ON TABLE ofertas.oferta_habilidad_seleccionada TO grupo_postulante;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.oferta_habilidad_seleccionada TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.oferta_habilidad_seleccionada TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.oferta_habilidad_seleccionada TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.oferta_habilidad_seleccionada TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.oferta_habilidad_seleccionada TO "AdminSupervisor";


--
-- Name: SEQUENCE oferta_habilidad_seleccionada_id_oferta_habilidad_seq; Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON SEQUENCE ofertas.oferta_habilidad_seleccionada_id_oferta_habilidad_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE ofertas.oferta_habilidad_seleccionada_id_oferta_habilidad_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE ofertas.oferta_habilidad_seleccionada_id_oferta_habilidad_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE ofertas.oferta_habilidad_seleccionada_id_oferta_habilidad_seq TO "AdminSupervisor";


--
-- Name: TABLE oferta_laboral; Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON TABLE ofertas.oferta_laboral TO grupo_administrador;
GRANT SELECT,INSERT,UPDATE ON TABLE ofertas.oferta_laboral TO grupo_empresa;
GRANT SELECT ON TABLE ofertas.oferta_laboral TO grupo_postulante;
GRANT ALL ON TABLE ofertas.oferta_laboral TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.oferta_laboral TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.oferta_laboral TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.oferta_laboral TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.oferta_laboral TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.oferta_laboral TO "AdminSupervisor";


--
-- Name: SEQUENCE oferta_laboral_id_oferta_seq; Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON SEQUENCE ofertas.oferta_laboral_id_oferta_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE ofertas.oferta_laboral_id_oferta_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE ofertas.oferta_laboral_id_oferta_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE ofertas.oferta_laboral_id_oferta_seq TO "AdminSupervisor";


--
-- Name: TABLE ofertas_favoritas; Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON TABLE ofertas.ofertas_favoritas TO grupo_administrador;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.ofertas_favoritas TO grupo_postulante;
GRANT ALL ON TABLE ofertas.ofertas_favoritas TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.ofertas_favoritas TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.ofertas_favoritas TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.ofertas_favoritas TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.ofertas_favoritas TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.ofertas_favoritas TO "AdminSupervisor";


--
-- Name: SEQUENCE ofertas_favoritas_id_favorita_seq; Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON SEQUENCE ofertas.ofertas_favoritas_id_favorita_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE ofertas.ofertas_favoritas_id_favorita_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE ofertas.ofertas_favoritas_id_favorita_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE ofertas.ofertas_favoritas_id_favorita_seq TO "AdminSupervisor";


--
-- Name: SEQUENCE ofertas_favoritas_id_favoritas_seq; Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON SEQUENCE ofertas.ofertas_favoritas_id_favoritas_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE ofertas.ofertas_favoritas_id_favoritas_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE ofertas.ofertas_favoritas_id_favoritas_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE ofertas.ofertas_favoritas_id_favoritas_seq TO "AdminSupervisor";


--
-- Name: TABLE requisito_manual; Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON TABLE ofertas.requisito_manual TO grupo_administrador;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.requisito_manual TO grupo_empresa;
GRANT ALL ON TABLE ofertas.requisito_manual TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT ON TABLE ofertas.requisito_manual TO grupo_postulante;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.requisito_manual TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.requisito_manual TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.requisito_manual TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.requisito_manual TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE ofertas.requisito_manual TO "AdminSupervisor";


--
-- Name: SEQUENCE requisito_manual_id_requisito_manual_seq; Type: ACL; Schema: ofertas; Owner: adminAzure
--

GRANT ALL ON SEQUENCE ofertas.requisito_manual_id_requisito_manual_seq TO grupo_administrador;
GRANT ALL ON SEQUENCE ofertas.requisito_manual_id_requisito_manual_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE ofertas.requisito_manual_id_requisito_manual_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE ofertas.requisito_manual_id_requisito_manual_seq TO "AdminSupervisor";


--
-- Name: COLUMN pg_config.name; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(name) ON TABLE pg_catalog.pg_config TO azure_pg_admin;


--
-- Name: COLUMN pg_config.setting; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(setting) ON TABLE pg_catalog.pg_config TO azure_pg_admin;


--
-- Name: COLUMN pg_hba_file_rules.line_number; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(line_number) ON TABLE pg_catalog.pg_hba_file_rules TO azure_pg_admin;


--
-- Name: COLUMN pg_hba_file_rules.type; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(type) ON TABLE pg_catalog.pg_hba_file_rules TO azure_pg_admin;


--
-- Name: COLUMN pg_hba_file_rules.database; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(database) ON TABLE pg_catalog.pg_hba_file_rules TO azure_pg_admin;


--
-- Name: COLUMN pg_hba_file_rules.user_name; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(user_name) ON TABLE pg_catalog.pg_hba_file_rules TO azure_pg_admin;


--
-- Name: COLUMN pg_hba_file_rules.address; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(address) ON TABLE pg_catalog.pg_hba_file_rules TO azure_pg_admin;


--
-- Name: COLUMN pg_hba_file_rules.netmask; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(netmask) ON TABLE pg_catalog.pg_hba_file_rules TO azure_pg_admin;


--
-- Name: COLUMN pg_hba_file_rules.auth_method; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(auth_method) ON TABLE pg_catalog.pg_hba_file_rules TO azure_pg_admin;


--
-- Name: COLUMN pg_hba_file_rules.options; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(options) ON TABLE pg_catalog.pg_hba_file_rules TO azure_pg_admin;


--
-- Name: COLUMN pg_hba_file_rules.error; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(error) ON TABLE pg_catalog.pg_hba_file_rules TO azure_pg_admin;


--
-- Name: COLUMN pg_replication_origin_status.local_id; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(local_id) ON TABLE pg_catalog.pg_replication_origin_status TO azure_pg_admin;


--
-- Name: COLUMN pg_replication_origin_status.external_id; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(external_id) ON TABLE pg_catalog.pg_replication_origin_status TO azure_pg_admin;


--
-- Name: COLUMN pg_replication_origin_status.remote_lsn; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(remote_lsn) ON TABLE pg_catalog.pg_replication_origin_status TO azure_pg_admin;


--
-- Name: COLUMN pg_replication_origin_status.local_lsn; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(local_lsn) ON TABLE pg_catalog.pg_replication_origin_status TO azure_pg_admin;


--
-- Name: COLUMN pg_shmem_allocations.name; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(name) ON TABLE pg_catalog.pg_shmem_allocations TO azure_pg_admin;


--
-- Name: COLUMN pg_shmem_allocations.off; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(off) ON TABLE pg_catalog.pg_shmem_allocations TO azure_pg_admin;


--
-- Name: COLUMN pg_shmem_allocations.size; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(size) ON TABLE pg_catalog.pg_shmem_allocations TO azure_pg_admin;


--
-- Name: COLUMN pg_shmem_allocations.allocated_size; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(allocated_size) ON TABLE pg_catalog.pg_shmem_allocations TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.starelid; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(starelid) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.staattnum; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(staattnum) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stainherit; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stainherit) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stanullfrac; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stanullfrac) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stawidth; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stawidth) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stadistinct; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stadistinct) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stakind1; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stakind1) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stakind2; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stakind2) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stakind3; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stakind3) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stakind4; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stakind4) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stakind5; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stakind5) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.staop1; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(staop1) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.staop2; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(staop2) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.staop3; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(staop3) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.staop4; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(staop4) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.staop5; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(staop5) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stacoll1; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stacoll1) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stacoll2; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stacoll2) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stacoll3; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stacoll3) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stacoll4; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stacoll4) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stacoll5; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stacoll5) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stanumbers1; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stanumbers1) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stanumbers2; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stanumbers2) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stanumbers3; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stanumbers3) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stanumbers4; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stanumbers4) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stanumbers5; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stanumbers5) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stavalues1; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stavalues1) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stavalues2; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stavalues2) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stavalues3; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stavalues3) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stavalues4; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stavalues4) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_statistic.stavalues5; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(stavalues5) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- Name: COLUMN pg_subscription.oid; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(oid) ON TABLE pg_catalog.pg_subscription TO azure_pg_admin;


--
-- Name: COLUMN pg_subscription.subdbid; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(subdbid) ON TABLE pg_catalog.pg_subscription TO azure_pg_admin;


--
-- Name: COLUMN pg_subscription.subname; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(subname) ON TABLE pg_catalog.pg_subscription TO azure_pg_admin;


--
-- Name: COLUMN pg_subscription.subowner; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(subowner) ON TABLE pg_catalog.pg_subscription TO azure_pg_admin;


--
-- Name: COLUMN pg_subscription.subenabled; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(subenabled) ON TABLE pg_catalog.pg_subscription TO azure_pg_admin;


--
-- Name: COLUMN pg_subscription.subconninfo; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(subconninfo) ON TABLE pg_catalog.pg_subscription TO azure_pg_admin;


--
-- Name: COLUMN pg_subscription.subslotname; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(subslotname) ON TABLE pg_catalog.pg_subscription TO azure_pg_admin;


--
-- Name: COLUMN pg_subscription.subsynccommit; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(subsynccommit) ON TABLE pg_catalog.pg_subscription TO azure_pg_admin;


--
-- Name: COLUMN pg_subscription.subpublications; Type: ACL; Schema: pg_catalog; Owner: postgres
--

GRANT SELECT(subpublications) ON TABLE pg_catalog.pg_subscription TO azure_pg_admin;


--
-- Name: TABLE postulacion; Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON TABLE postulaciones.postulacion TO grupo_administrador;
GRANT SELECT ON TABLE postulaciones.postulacion TO grupo_supervisor;
GRANT SELECT,UPDATE ON TABLE postulaciones.postulacion TO grupo_empresa;
GRANT SELECT,INSERT,UPDATE ON TABLE postulaciones.postulacion TO grupo_postulante;
GRANT ALL ON TABLE postulaciones.postulacion TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.postulacion TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.postulacion TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.postulacion TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.postulacion TO "AdminSupervisor";


--
-- Name: SEQUENCE postulacion_id_postulacion_seq; Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON SEQUENCE postulaciones.postulacion_id_postulacion_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE postulaciones.postulacion_id_postulacion_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE postulaciones.postulacion_id_postulacion_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE postulaciones.postulacion_id_postulacion_seq TO "AdminSupervisor";


--
-- Name: TABLE validacion_curso; Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON TABLE postulaciones.validacion_curso TO grupo_administrador;
GRANT SELECT,INSERT,UPDATE ON TABLE postulaciones.validacion_curso TO grupo_supervisor;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_curso TO grupo_empresa;
GRANT ALL ON TABLE postulaciones.validacion_curso TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_curso TO grupo_postulante;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_curso TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_curso TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_curso TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_curso TO "AdminSupervisor";


--
-- Name: SEQUENCE validacion_curso_id_validacion_curso_seq; Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON SEQUENCE postulaciones.validacion_curso_id_validacion_curso_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE postulaciones.validacion_curso_id_validacion_curso_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE postulaciones.validacion_curso_id_validacion_curso_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE postulaciones.validacion_curso_id_validacion_curso_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE postulaciones.validacion_curso_id_validacion_curso_seq TO "AdminSupervisor";


--
-- Name: TABLE validacion_documentacion; Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON TABLE postulaciones.validacion_documentacion TO grupo_administrador;
GRANT SELECT,INSERT,UPDATE ON TABLE postulaciones.validacion_documentacion TO grupo_supervisor;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_documentacion TO grupo_empresa;
GRANT ALL ON TABLE postulaciones.validacion_documentacion TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_documentacion TO grupo_postulante;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_documentacion TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_documentacion TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_documentacion TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_documentacion TO "AdminSupervisor";


--
-- Name: SEQUENCE validacion_documentacion_id_validacion_doc_seq; Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON SEQUENCE postulaciones.validacion_documentacion_id_validacion_doc_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE postulaciones.validacion_documentacion_id_validacion_doc_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE postulaciones.validacion_documentacion_id_validacion_doc_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE postulaciones.validacion_documentacion_id_validacion_doc_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE postulaciones.validacion_documentacion_id_validacion_doc_seq TO "AdminSupervisor";


--
-- Name: TABLE validacion_exp_laboral; Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON TABLE postulaciones.validacion_exp_laboral TO grupo_administrador;
GRANT SELECT,INSERT,UPDATE ON TABLE postulaciones.validacion_exp_laboral TO grupo_supervisor;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_exp_laboral TO grupo_empresa;
GRANT ALL ON TABLE postulaciones.validacion_exp_laboral TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_exp_laboral TO grupo_postulante;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_exp_laboral TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_exp_laboral TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_exp_laboral TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_exp_laboral TO "AdminSupervisor";


--
-- Name: SEQUENCE validacion_exp_laboral_id_validacion_exp_seq; Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON SEQUENCE postulaciones.validacion_exp_laboral_id_validacion_exp_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE postulaciones.validacion_exp_laboral_id_validacion_exp_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE postulaciones.validacion_exp_laboral_id_validacion_exp_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE postulaciones.validacion_exp_laboral_id_validacion_exp_seq TO "AdminSupervisor";


--
-- Name: TABLE validacion_idioma; Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON TABLE postulaciones.validacion_idioma TO grupo_administrador;
GRANT SELECT,INSERT,UPDATE ON TABLE postulaciones.validacion_idioma TO grupo_supervisor;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_idioma TO grupo_empresa;
GRANT ALL ON TABLE postulaciones.validacion_idioma TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_idioma TO grupo_postulante;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_idioma TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_idioma TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_idioma TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_idioma TO "AdminSupervisor";


--
-- Name: SEQUENCE validacion_idioma_id_validacion_idioma_seq; Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON SEQUENCE postulaciones.validacion_idioma_id_validacion_idioma_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE postulaciones.validacion_idioma_id_validacion_idioma_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE postulaciones.validacion_idioma_id_validacion_idioma_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE postulaciones.validacion_idioma_id_validacion_idioma_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE postulaciones.validacion_idioma_id_validacion_idioma_seq TO "AdminSupervisor";


--
-- Name: TABLE validacion_oferta; Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON TABLE postulaciones.validacion_oferta TO grupo_administrador;
GRANT SELECT,INSERT,UPDATE ON TABLE postulaciones.validacion_oferta TO grupo_supervisor;
GRANT ALL ON TABLE postulaciones.validacion_oferta TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_oferta TO grupo_empresa;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_oferta TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_oferta TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_oferta TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE postulaciones.validacion_oferta TO "AdminSupervisor";


--
-- Name: SEQUENCE validacion_oferta_id_validacion_oferta_seq; Type: ACL; Schema: postulaciones; Owner: adminAzure
--

GRANT ALL ON SEQUENCE postulaciones.validacion_oferta_id_validacion_oferta_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE postulaciones.validacion_oferta_id_validacion_oferta_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE postulaciones.validacion_oferta_id_validacion_oferta_seq TO "AdminSupervisor";


--
-- Name: TABLE auditoria; Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT INSERT ON TABLE seguridad.auditoria TO grupo_gerente;
GRANT ALL ON TABLE seguridad.auditoria TO grupo_administrador;
GRANT INSERT ON TABLE seguridad.auditoria TO grupo_supervisor;
GRANT INSERT ON TABLE seguridad.auditoria TO grupo_empresa;
GRANT INSERT ON TABLE seguridad.auditoria TO grupo_postulante;
GRANT ALL ON TABLE seguridad.auditoria TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguridad.auditoria TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguridad.auditoria TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguridad.auditoria TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguridad.auditoria TO "AdminSupervisor";


--
-- Name: SEQUENCE auditoria_id_auditoria_seq; Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT SELECT,USAGE ON SEQUENCE seguridad.auditoria_id_auditoria_seq TO grupo_gerente;
GRANT ALL ON SEQUENCE seguridad.auditoria_id_auditoria_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE seguridad.auditoria_id_auditoria_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE seguridad.auditoria_id_auditoria_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE seguridad.auditoria_id_auditoria_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE seguridad.auditoria_id_auditoria_seq TO "AdminSupervisor";


--
-- Name: TABLE configuracion_backup; Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON TABLE seguridad.configuracion_backup TO grupo_administrador;
GRANT SELECT,INSERT,UPDATE ON TABLE seguridad.configuracion_backup TO grupo_postulante;
GRANT SELECT,INSERT,UPDATE ON TABLE seguridad.configuracion_backup TO grupo_empresa;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguridad.configuracion_backup TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguridad.configuracion_backup TO "AdminSupervisor";


--
-- Name: SEQUENCE configuracion_backup_id_config_seq; Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON SEQUENCE seguridad.configuracion_backup_id_config_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE seguridad.configuracion_backup_id_config_seq TO "AdminSupervisor";


--
-- Name: TABLE historial_backups; Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON TABLE seguridad.historial_backups TO grupo_administrador;
GRANT SELECT,INSERT,UPDATE ON TABLE seguridad.historial_backups TO grupo_empresa;
GRANT SELECT,INSERT,UPDATE ON TABLE seguridad.historial_backups TO grupo_postulante;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguridad.historial_backups TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguridad.historial_backups TO "AdminSupervisor";


--
-- Name: SEQUENCE historial_backups_id_backup_seq; Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON SEQUENCE seguridad.historial_backups_id_backup_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE seguridad.historial_backups_id_backup_seq TO "AdminSupervisor";


--
-- Name: TABLE seguridad; Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON TABLE seguridad.seguridad TO grupo_administrador;
GRANT ALL ON TABLE seguridad.seguridad TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguridad.seguridad TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguridad.seguridad TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguridad.seguridad TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguridad.seguridad TO "AdminSupervisor";


--
-- Name: SEQUENCE seguridad_id_seguridad_seq; Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT ALL ON SEQUENCE seguridad.seguridad_id_seguridad_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE seguridad.seguridad_id_seguridad_seq TO "AdminSupervisor";


--
-- Name: TABLE sesiones; Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguridad.sesiones TO "c.ramirez@empresa.com";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguridad.sesiones TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguridad.sesiones TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguridad.sesiones TO "AdminSupervisor";


--
-- Name: SEQUENCE sesiones_id_sesion_seq; Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT SELECT,USAGE ON SEQUENCE seguridad.sesiones_id_sesion_seq TO "c.ramirez@empresa.com";
GRANT SELECT,USAGE ON SEQUENCE seguridad.sesiones_id_sesion_seq TO "AdminSupervisor";


--
-- Name: TABLE sistema_empresa; Type: ACL; Schema: seguridad; Owner: adminAzure
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguridad.sistema_empresa TO "Prueba_011";
GRANT SELECT,INSERT,UPDATE ON TABLE seguridad.sistema_empresa TO grupo_empresa;
GRANT SELECT ON TABLE seguridad.sistema_empresa TO grupo_postulante;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguridad.sistema_empresa TO "AdminSupervisor";


--
-- Name: TABLE configuracion_correo; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.configuracion_correo TO grupo_administrador;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.configuracion_correo TO grupo_postulante;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.configuracion_correo TO grupo_empresa;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.configuracion_correo TO grupo_supervisor;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.configuracion_correo TO grupo_gerente;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.configuracion_correo TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.configuracion_correo TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.configuracion_correo TO "AdminSupervisor";


--
-- Name: SEQUENCE configuracion_correo_id_configuracion_seq; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT SELECT,USAGE ON SEQUENCE usuarios.configuracion_correo_id_configuracion_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE usuarios.configuracion_correo_id_configuracion_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE usuarios.configuracion_correo_id_configuracion_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE usuarios.configuracion_correo_id_configuracion_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE usuarios.configuracion_correo_id_configuracion_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE usuarios.configuracion_correo_id_configuracion_seq TO "AdminSupervisor";


--
-- Name: TABLE cursos; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON TABLE usuarios.cursos TO grupo_administrador;
GRANT ALL ON TABLE usuarios.cursos TO grupo_postulante;
GRANT SELECT ON TABLE usuarios.cursos TO grupo_empresa;
GRANT ALL ON TABLE usuarios.cursos TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.cursos TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.cursos TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.cursos TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.cursos TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.cursos TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.cursos TO "AdminSupervisor";


--
-- Name: SEQUENCE cursos_id_curso_seq; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON SEQUENCE usuarios.cursos_id_curso_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE usuarios.cursos_id_curso_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE usuarios.cursos_id_curso_seq TO "c.ramirez@empresa.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.cursos_id_curso_seq TO "EmpresaPrueba@gmail.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.cursos_id_curso_seq TO "jeremyjaramillo567@gmail.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.cursos_id_curso_seq TO "jeremyjaramillo567@gmail.com7776432";
GRANT SELECT,USAGE ON SEQUENCE usuarios.cursos_id_curso_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE usuarios.cursos_id_curso_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE usuarios.cursos_id_curso_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE usuarios.cursos_id_curso_seq TO "AdminSupervisor";


--
-- Name: TABLE documentacion_academica; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON TABLE usuarios.documentacion_academica TO grupo_administrador;
GRANT ALL ON TABLE usuarios.documentacion_academica TO grupo_postulante;
GRANT ALL ON TABLE usuarios.documentacion_academica TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.documentacion_academica TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.documentacion_academica TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.documentacion_academica TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.documentacion_academica TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.documentacion_academica TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.documentacion_academica TO "AdminSupervisor";


--
-- Name: SEQUENCE documentacion_academica_id_documentacion_seq; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON SEQUENCE usuarios.documentacion_academica_id_documentacion_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE usuarios.documentacion_academica_id_documentacion_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE usuarios.documentacion_academica_id_documentacion_seq TO "c.ramirez@empresa.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.documentacion_academica_id_documentacion_seq TO "EmpresaPrueba@gmail.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.documentacion_academica_id_documentacion_seq TO "jeremyjaramillo567@gmail.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.documentacion_academica_id_documentacion_seq TO "jeremyjaramillo567@gmail.com7776432";
GRANT SELECT,USAGE ON SEQUENCE usuarios.documentacion_academica_id_documentacion_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE usuarios.documentacion_academica_id_documentacion_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE usuarios.documentacion_academica_id_documentacion_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE usuarios.documentacion_academica_id_documentacion_seq TO "AdminSupervisor";


--
-- Name: TABLE exp_laboral; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON TABLE usuarios.exp_laboral TO grupo_administrador;
GRANT SELECT ON TABLE usuarios.exp_laboral TO grupo_empresa;
GRANT ALL ON TABLE usuarios.exp_laboral TO grupo_postulante;
GRANT ALL ON TABLE usuarios.exp_laboral TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.exp_laboral TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.exp_laboral TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.exp_laboral TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.exp_laboral TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.exp_laboral TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.exp_laboral TO "AdminSupervisor";


--
-- Name: TABLE exp_laboral_cargo; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT SELECT,INSERT,UPDATE ON TABLE usuarios.exp_laboral_cargo TO grupo_empresa;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.exp_laboral_cargo TO grupo_postulante;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.exp_laboral_cargo TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.exp_laboral_cargo TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.exp_laboral_cargo TO "AdminSupervisor";


--
-- Name: SEQUENCE exp_laboral_cargo_id_exp_cargo_seq; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT SELECT,USAGE ON SEQUENCE usuarios.exp_laboral_cargo_id_exp_cargo_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE usuarios.exp_laboral_cargo_id_exp_cargo_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE usuarios.exp_laboral_cargo_id_exp_cargo_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE usuarios.exp_laboral_cargo_id_exp_cargo_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE usuarios.exp_laboral_cargo_id_exp_cargo_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE usuarios.exp_laboral_cargo_id_exp_cargo_seq TO "AdminSupervisor";


--
-- Name: SEQUENCE exp_laboral_id_exp_laboral_seq; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON SEQUENCE usuarios.exp_laboral_id_exp_laboral_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE usuarios.exp_laboral_id_exp_laboral_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE usuarios.exp_laboral_id_exp_laboral_seq TO "c.ramirez@empresa.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.exp_laboral_id_exp_laboral_seq TO "EmpresaPrueba@gmail.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.exp_laboral_id_exp_laboral_seq TO "jeremyjaramillo567@gmail.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.exp_laboral_id_exp_laboral_seq TO "jeremyjaramillo567@gmail.com7776432";
GRANT SELECT,USAGE ON SEQUENCE usuarios.exp_laboral_id_exp_laboral_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE usuarios.exp_laboral_id_exp_laboral_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE usuarios.exp_laboral_id_exp_laboral_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE usuarios.exp_laboral_id_exp_laboral_seq TO "AdminSupervisor";


--
-- Name: TABLE historial_postulante; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.historial_postulante TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.historial_postulante TO "Prueba_011";
GRANT ALL ON TABLE usuarios.historial_postulante TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.historial_postulante TO "AdminSupervisor";


--
-- Name: SEQUENCE historial_postulante_id_historial_seq; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON SEQUENCE usuarios.historial_postulante_id_historial_seq TO "c.ramirez@empresa.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.historial_postulante_id_historial_seq TO "AdminSupervisor";


--
-- Name: TABLE notificacion; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON TABLE usuarios.notificacion TO "c.ramirez@empresa.com";
GRANT ALL ON TABLE usuarios.notificacion TO "EmpresaPrueba@gmail.com";
GRANT ALL ON TABLE usuarios.notificacion TO "jeremyjaramillo567@gmail.com";
GRANT ALL ON TABLE usuarios.notificacion TO "jeremyjaramillo567@gmail.com7776432";
GRANT SELECT,INSERT,UPDATE ON TABLE usuarios.notificacion TO grupo_postulante;
GRANT SELECT,INSERT,UPDATE ON TABLE usuarios.notificacion TO grupo_empresa;
GRANT SELECT,INSERT,UPDATE ON TABLE usuarios.notificacion TO grupo_administrador;
GRANT SELECT,INSERT,UPDATE ON TABLE usuarios.notificacion TO grupo_supervisor;
GRANT SELECT,INSERT,UPDATE ON TABLE usuarios.notificacion TO "hzambranor@uteq.edu.ec";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.notificacion TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.notificacion TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.notificacion TO "AdminSupervisor";


--
-- Name: SEQUENCE notificacion_id_notificacion_seq; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT SELECT,USAGE ON SEQUENCE usuarios.notificacion_id_notificacion_seq TO "EmpresaPrueba@gmail.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.notificacion_id_notificacion_seq TO "jeremyjaramillo567@gmail.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.notificacion_id_notificacion_seq TO "jeremyjaramillo567@gmail.com7776432";
GRANT SELECT,USAGE ON SEQUENCE usuarios.notificacion_id_notificacion_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE usuarios.notificacion_id_notificacion_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE usuarios.notificacion_id_notificacion_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE usuarios.notificacion_id_notificacion_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE usuarios.notificacion_id_notificacion_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE usuarios.notificacion_id_notificacion_seq TO "AdminSupervisor";


--
-- Name: TABLE oferta_laboral; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON TABLE usuarios.oferta_laboral TO grupo_administrador;
GRANT ALL ON TABLE usuarios.oferta_laboral TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.oferta_laboral TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.oferta_laboral TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.oferta_laboral TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.oferta_laboral TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.oferta_laboral TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.oferta_laboral TO "AdminSupervisor";


--
-- Name: TABLE perfil_academico; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON TABLE usuarios.perfil_academico TO grupo_administrador;
GRANT SELECT ON TABLE usuarios.perfil_academico TO grupo_empresa;
GRANT ALL ON TABLE usuarios.perfil_academico TO grupo_postulante;
GRANT ALL ON TABLE usuarios.perfil_academico TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.perfil_academico TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.perfil_academico TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.perfil_academico TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.perfil_academico TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.perfil_academico TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.perfil_academico TO "AdminSupervisor";


--
-- Name: SEQUENCE perfil_academico_id_perfil_academico_seq; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON SEQUENCE usuarios.perfil_academico_id_perfil_academico_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE usuarios.perfil_academico_id_perfil_academico_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE usuarios.perfil_academico_id_perfil_academico_seq TO "c.ramirez@empresa.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.perfil_academico_id_perfil_academico_seq TO "EmpresaPrueba@gmail.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.perfil_academico_id_perfil_academico_seq TO "jeremyjaramillo567@gmail.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.perfil_academico_id_perfil_academico_seq TO "jeremyjaramillo567@gmail.com7776432";
GRANT SELECT,USAGE ON SEQUENCE usuarios.perfil_academico_id_perfil_academico_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE usuarios.perfil_academico_id_perfil_academico_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE usuarios.perfil_academico_id_perfil_academico_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE usuarios.perfil_academico_id_perfil_academico_seq TO "AdminSupervisor";


--
-- Name: TABLE postulacion; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON TABLE usuarios.postulacion TO grupo_administrador;
GRANT ALL ON TABLE usuarios.postulacion TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,UPDATE ON TABLE usuarios.postulacion TO grupo_postulante;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.postulacion TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.postulacion TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.postulacion TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.postulacion TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.postulacion TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.postulacion TO "AdminSupervisor";


--
-- Name: SEQUENCE roles_id_rol_seq; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON SEQUENCE usuarios.roles_id_rol_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE usuarios.roles_id_rol_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE usuarios.roles_id_rol_seq TO "c.ramirez@empresa.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.roles_id_rol_seq TO "EmpresaPrueba@gmail.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.roles_id_rol_seq TO "jeremyjaramillo567@gmail.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.roles_id_rol_seq TO "jeremyjaramillo567@gmail.com7776432";
GRANT SELECT,USAGE ON SEQUENCE usuarios.roles_id_rol_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE usuarios.roles_id_rol_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE usuarios.roles_id_rol_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE usuarios.roles_id_rol_seq TO "AdminSupervisor";


--
-- Name: SEQUENCE usuario_id_usuario_seq; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON SEQUENCE usuarios.usuario_id_usuario_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_id_usuario_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_id_usuario_seq TO "c.ramirez@empresa.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_id_usuario_seq TO "EmpresaPrueba@gmail.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_id_usuario_seq TO "jeremyjaramillo567@gmail.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_id_usuario_seq TO "jeremyjaramillo567@gmail.com7776432";
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_id_usuario_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_id_usuario_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_id_usuario_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_id_usuario_seq TO "AdminSupervisor";


--
-- Name: TABLE usuario_idioma; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON TABLE usuarios.usuario_idioma TO grupo_administrador;
GRANT ALL ON TABLE usuarios.usuario_idioma TO grupo_postulante;
GRANT SELECT ON TABLE usuarios.usuario_idioma TO grupo_empresa;
GRANT ALL ON TABLE usuarios.usuario_idioma TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.usuario_idioma TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.usuario_idioma TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.usuario_idioma TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.usuario_idioma TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.usuario_idioma TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.usuario_idioma TO "AdminSupervisor";


--
-- Name: SEQUENCE usuario_idioma_id_usuario_idioma_seq; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON SEQUENCE usuarios.usuario_idioma_id_usuario_idioma_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_idioma_id_usuario_idioma_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_idioma_id_usuario_idioma_seq TO "c.ramirez@empresa.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_idioma_id_usuario_idioma_seq TO "EmpresaPrueba@gmail.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_idioma_id_usuario_idioma_seq TO "jeremyjaramillo567@gmail.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_idioma_id_usuario_idioma_seq TO "jeremyjaramillo567@gmail.com7776432";
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_idioma_id_usuario_idioma_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_idioma_id_usuario_idioma_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_idioma_id_usuario_idioma_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_idioma_id_usuario_idioma_seq TO "AdminSupervisor";


--
-- Name: TABLE usuario_imagen; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON TABLE usuarios.usuario_imagen TO grupo_administrador;
GRANT SELECT,INSERT,UPDATE ON TABLE usuarios.usuario_imagen TO grupo_empresa;
GRANT ALL ON TABLE usuarios.usuario_imagen TO grupo_postulante;
GRANT ALL ON TABLE usuarios.usuario_imagen TO "c.ramirez@empresa.com" WITH GRANT OPTION;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.usuario_imagen TO "SUPERVISAR";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.usuario_imagen TO "Prueba";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.usuario_imagen TO "RolShipu";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.usuario_imagen TO "Miniadmin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.usuario_imagen TO "Prueba_011";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE usuarios.usuario_imagen TO "AdminSupervisor";


--
-- Name: SEQUENCE usuario_imagen_id_usuario_imagen_seq; Type: ACL; Schema: usuarios; Owner: adminAzure
--

GRANT ALL ON SEQUENCE usuarios.usuario_imagen_id_usuario_imagen_seq TO grupo_administrador;
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_imagen_id_usuario_imagen_seq TO grupo_empresa;
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_imagen_id_usuario_imagen_seq TO grupo_postulante;
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_imagen_id_usuario_imagen_seq TO "c.ramirez@empresa.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_imagen_id_usuario_imagen_seq TO "EmpresaPrueba@gmail.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_imagen_id_usuario_imagen_seq TO "jeremyjaramillo567@gmail.com";
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_imagen_id_usuario_imagen_seq TO "jeremyjaramillo567@gmail.com7776432";
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_imagen_id_usuario_imagen_seq TO grupo_supervisor;
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_imagen_id_usuario_imagen_seq TO grupo_gerente;
GRANT SELECT,USAGE ON SEQUENCE usuarios.usuario_imagen_id_usuario_imagen_seq TO "AdminSupervisor";


--
-- PostgreSQL database dump complete
--

\unrestrict 6ckG9wZOTG7iFClB0F1ALs15eZZ8ILzKtosVTcvetiaLy90GPOb1GYjxsAqKl6v

