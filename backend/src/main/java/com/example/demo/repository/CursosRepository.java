package com.example.demo.repository;

import com.example.demo.model.Cursos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CursosRepository extends JpaRepository<Cursos, Integer> {
    @Procedure(procedureName = "usuarios.sp_actualizar_curso")
    void actualizarCurso(
            @Param("p_id_curso") Integer idCurso,
            @Param("p_nombre_curso") String nombreCurso,
            @Param("p_institucion") String institucion,
            @Param("p_horas_duracion") Integer horasDuracion,
            @Param("p_archivo") String urlarchivo
    );
}