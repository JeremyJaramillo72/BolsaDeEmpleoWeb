/*package com.example.demo.repository.Impl;
// AQUÍ VAN LOS IMPORTS QUE TE PASÉ ARRIBA
import com.example.demo.model.Usuario;
import com.example.demo.repository.IUsuarioCustomRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import jakarta.persistence.ParameterMode;
import org.springframework.stereotype.Repository;


@Repository
public class UsuarioRepositoryImpl implements IUsuarioCustomRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public void registrarConProcedimiento(Usuario usuario) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_registrar_postulante");

        // Registro de parámetros
        query.registerStoredProcedureParameter("p_nombre", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_apellido", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_contrasena", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_correo", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_fechanacimiento", java.sql.Date.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_genero", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_telefono", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_idciudad", Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_idrol", Integer.class, ParameterMode.IN);

        // Seteo de valores desde el objeto Usuario
        query.setParameter("p_nombre", usuario.getNombre());
        query.setParameter("p_apellido", usuario.getApellido());
        query.setParameter("p_contrasena", usuario.getContrasena());
        query.setParameter("p_correo", usuario.getCorreo());
        if (usuario.getFechaNacimiento() != null) {
            query.setParameter("p_fechanacimiento", java.sql.Date.valueOf(usuario.getFechaNacimiento()));
        } else {
            query.setParameter("p_fechanacimiento", null);
        }
        query.setParameter("p_genero", usuario.getGenero());
        query.setParameter("p_telefono", usuario.getTelefono());

        // Para las llaves foráneas, accedemos al ID del objeto relacionado
        if (usuario.getCiudad() != null) {
            query.setParameter("p_idciudad", usuario.getCiudad().getIdCiudad());
        } else {
            query.setParameter("p_idciudad", null);
        }

        if (usuario.getRol() != null) {
            query.setParameter("p_idrol", usuario.getRol().getIdRol());
        } else {
            // Si es un postulante nuevo, podrías quemar el ID 3 aquí si lo prefieres
            query.setParameter("p_idrol", 3);
        }
        query.execute();
    }

    @Override
    public void registrarEmpresaPro(String correo, String pass, Integer idC, String nombreE, String desc, String ruc, String web) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_registrar_empresa_completa");

        // Registro de parámetros (Debe coincidir con el orden del SQL)
        query.registerStoredProcedureParameter("p_correo", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_contrasena", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_idciudad", Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_nombreempresa", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_descripcion", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_ruc", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_sitioweb", String.class, ParameterMode.IN);

        // Seteo de valores
        query.setParameter("p_correo", correo);
        query.setParameter("p_contrasena", pass);
        query.setParameter("p_idciudad", idC);
        query.setParameter("p_nombreempresa", nombreE);
        query.setParameter("p_descripcion", desc);
        query.setParameter("p_ruc", ruc);
        query.setParameter("p_sitioweb", web);

        query.execute();
    }
}*/