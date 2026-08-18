-- 5 ofertas nuevas para Importadora Castro (ljaramilloa@uteq.edu.ec, id_empresa = 2)
INSERT INTO ofertas.oferta_laboral (
  id_empresa, id_modalidad, id_categoria, id_jornada, id_ciudad,
  titulo, descripcion, fecha_inicio, fecha_cierre, estado_oferta,
  salario_min, salario_max, cantidad_vacantes, experiencia_minima
) VALUES
(2, 1, 1, 1, 6, 'Analista de Sistemas Junior',
 'Importadora Castro busca analista para soporte de aplicaciones internas, mantenimiento de servidores y monitoreo de bases de datos PostgreSQL.',
 CURRENT_DATE, CURRENT_DATE + INTERVAL '45 days', 'aprobado', 850.00, 1200.00, 2, 1),
(2, 2, 1, 1, 6, 'Desarrollador Backend Java',
 'Vacante remota para desarrollo de APIs REST con Spring Boot, integracion con PostgreSQL y despliegue en entornos cloud.',
 CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', 'aprobado', 1000.00, 1500.00, 1, 2),
(2, 3, 2, 2, 6, 'Asistente Administrativo Logistico',
 'Apoyo en gestion documental, coordinacion de inventarios y seguimiento de procesos de importacion en modalidad hibrida.',
 CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'aprobado', 500.00, 750.00, 3, 0),
(2, 1, 3, 1, 6, 'Ejecutivo Comercial Zona Centro',
 'Responsable de prospeccion de clientes, seguimiento de ventas mayoristas y cumplimiento de metas comerciales mensuales.',
 CURRENT_DATE, CURRENT_DATE + INTERVAL '40 days', 'aprobado', 600.00, 900.00, 2, 1),
(2, 2, 1, 1, 6, 'Especialista en Ciberseguridad',
 'Implementacion de politicas de seguridad, hardening de servidores PostgreSQL y respuesta a incidentes en infraestructura TI.',
 CURRENT_DATE, CURRENT_DATE + INTERVAL '50 days', 'aprobado', 1200.00, 1800.00, 1, 3);

SELECT id_oferta, titulo, estado_oferta, fecha_cierre
FROM ofertas.oferta_laboral
WHERE id_empresa = 2
ORDER BY id_oferta DESC
LIMIT 5;
