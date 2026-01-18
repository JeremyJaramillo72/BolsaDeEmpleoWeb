package com.example.demo.repository;

import com.example.demo.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
// Al extender de ambas, UsuarioRepository tiene los métodos automáticos Y los tuyos
public interface UsuarioRepository extends JpaRepository<Usuario, Long>, IUsuarioCustomRepository {

    Optional<Usuario> findByCorreo(String correo);
}