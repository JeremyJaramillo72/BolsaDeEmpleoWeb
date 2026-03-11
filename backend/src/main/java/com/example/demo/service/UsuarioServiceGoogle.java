package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.HashMap;

@Service
public class UsuarioServiceGoogle {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional // 🔥 Importante: Si falla el segundo procedure, que no se guarde el primero
    public Long registrarUsuarioCompletoGoogle(String nombre, String apellido, String correo, String fotoUrl) {
        try {
            // 1. Datos para el registro de Google
            Map<String, Object> datos = new HashMap<>();
            datos.put("nombre", nombre);
            datos.put("apellido", apellido);
            datos.put("correo", correo);
            datos.put("foto_url", fotoUrl);
            int idRolPostulante = 3;
            datos.put("id_rol", idRolPostulante);

            String jsonDatos = objectMapper.writeValueAsString(datos);

            // 2. Ejecutar registro inicial y obtener el ID generado
            // Usamos una consulta para insertar y retornar el ID en un solo paso
            String sqlInsert = "INSERT INTO usuarios.usuario(nombre, apellido, correo, contrasena, id_rol) " +
                    "VALUES (?, ?, ?, 'GOOGLE_AUTH', ?) RETURNING id_usuario";

            Long nuevoIdUsuario = jdbcTemplate.queryForObject(sqlInsert, Long.class, nombre, apellido, correo, idRolPostulante);

            // 3. Manejo de la foto (opcional como lo tenías)
            if (fotoUrl != null) {
                String sqlFoto = "INSERT INTO catalogos.imagen(url_imagen) VALUES (?) RETURNING id_imagen";
                Integer idImg = jdbcTemplate.queryForObject(sqlFoto, Integer.class, fotoUrl);
                jdbcTemplate.update("INSERT INTO usuarios.usuario_imagen(id_usuario, id_imagen) VALUES (?, ?)", nuevoIdUsuario, idImg);
            }

            // 4. 🔥 LA LLAMADA CLAVE AL PROCEDURE DE SEGURIDAD
            // CALL seguridad.registrousuariologin(p_correo, p_id_usuario, p_id_rol)
            jdbcTemplate.execute(String.format(
                    "CALL seguridad.registrousuariologin('%s', %d, %d)",
                    correo, nuevoIdUsuario, idRolPostulante
            ));

            System.out.println("✅ Usuario y Seguridad creados para: " + correo);

            // 5. 🔥 RETORNAR EL ID DEL USUARIO CREADO
            return nuevoIdUsuario;

        } catch (Exception e) {
            System.err.println("❌ Error en registro completo: " + e.getMessage());
            throw new RuntimeException("Fallo en la creación del perfil de seguridad: " + e.getMessage());
        }
    }

    public boolean existePorCorreo(String correo) {
        String sql = "SELECT COUNT(*) FROM usuarios.usuario WHERE correo = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, correo);
        return count != null && count > 0;
    }

    // 🔥 NUEVO MÉTODO PARA OBTENER EL ID DEL USUARIO POR CORREO
    public Long obtenerIdPorCorreo(String correo) {
        String sql = "SELECT id_usuario FROM usuarios.usuario WHERE correo = ?";
        return jdbcTemplate.queryForObject(sql, Long.class, correo);
    }
}