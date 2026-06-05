-- Índices para acelerar el Panel de Administración (KPIs y tendencia de auditorías)
-- Ejecutar en Azure PostgreSQL como adminAzure (o postgres):
--   psql -h bolsi-empleo-dbpg.postgres.database.azure.com -U adminAzure -d Bolsa-Empleo-Azure -f dashboard-indexes.sql

-- ========== AUDITORÍAS (cuello de botella principal) ==========
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha_hora
    ON seguridad.auditoria (fecha_hora DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_fecha
    ON seguridad.auditoria (usuario_db, fecha_hora DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_fecha_dia
    ON seguridad.auditoria ((CAST(fecha_hora AS date)));

CREATE INDEX IF NOT EXISTS idx_auditoria_accion
    ON seguridad.auditoria (accion);

-- ========== OFERTAS ==========
CREATE INDEX IF NOT EXISTS idx_oferta_estado
    ON ofertas.oferta_laboral (estado_oferta);

CREATE INDEX IF NOT EXISTS idx_oferta_estado_fecha_creacion
    ON ofertas.oferta_laboral (estado_oferta, fecha_creacion DESC);

CREATE INDEX IF NOT EXISTS idx_oferta_empresa_estado
    ON ofertas.oferta_laboral (id_empresa, estado_oferta);

CREATE INDEX IF NOT EXISTS idx_oferta_fecha_creacion
    ON ofertas.oferta_laboral (fecha_creacion DESC);

-- ========== USUARIOS / EMPRESAS ==========
CREATE INDEX IF NOT EXISTS idx_usuario_fecha_registro
    ON usuarios.usuario (fecha_registro DESC);

CREATE INDEX IF NOT EXISTS idx_usuario_empresa_id_usuario
    ON empresas.usuario_empresa (id_usuario);

-- ========== POSTULACIONES ==========
CREATE INDEX IF NOT EXISTS idx_postulacion_fecha
    ON postulaciones.postulacion (fecha_postulacion DESC);

CREATE INDEX IF NOT EXISTS idx_postulacion_id_usuario
    ON postulaciones.postulacion (id_usuario);

CREATE INDEX IF NOT EXISTS idx_postulacion_id_oferta
    ON postulaciones.postulacion (id_oferta);

CREATE INDEX IF NOT EXISTS idx_postulacion_estado
    ON postulaciones.postulacion (estado_validacion);

-- Actualizar estadísticas del planificador
ANALYZE seguridad.auditoria;
ANALYZE ofertas.oferta_laboral;
ANALYZE usuarios.usuario;
ANALYZE postulaciones.postulacion;
