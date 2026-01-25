package com.example.demo.repository;
import com.example.demo.model.Usuario;

public interface IUsuarioCustomRepository {
    void registrarConProcedimiento(Usuario usuario);
    void registrarEmpresaPro(
            String correo,
            String pass,
            Integer idC,
            String nombreE,
            String desc,
            String ruc,
            String web
    );
}

