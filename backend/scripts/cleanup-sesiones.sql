BEGIN;

-- Eliminar filas duplicadas (mismo id_sesion), conservar una
DELETE FROM seguridad.sesiones a
USING seguridad.sesiones b
WHERE a.id_sesion = b.id_sesion
  AND a.ctid < b.ctid;

-- Cerrar sesiones ACTIVA antiguas (mas de 7 dias)
UPDATE seguridad.sesiones
SET accion = 'CERRADA', fecha_cierre = NOW()
WHERE accion = 'ACTIVA'
  AND fecha_inicio < NOW() - INTERVAL '7 days';

-- Eliminar historial cerrado
DELETE FROM seguridad.sesiones WHERE accion = 'CERRADA';

COMMIT;

-- PK fuera de transaccion por si ya existe
ALTER TABLE seguridad.sesiones DROP CONSTRAINT IF EXISTS sesiones_pkey;
ALTER TABLE seguridad.sesiones ADD CONSTRAINT sesiones_pkey PRIMARY KEY (id_sesion);

SELECT setval('seguridad.sesiones_id_sesion_seq', COALESCE((SELECT MAX(id_sesion) FROM seguridad.sesiones), 1));

SELECT accion, COUNT(*) AS total FROM seguridad.sesiones GROUP BY accion ORDER BY accion;

SELECT s.id_sesion, g.login_name, s.fecha_inicio, s.ip_address, s.accion
FROM seguridad.sesiones s
JOIN seguridad.seguridad g ON g.id_seguridad = s.id_seguridad
ORDER BY s.fecha_inicio DESC;
