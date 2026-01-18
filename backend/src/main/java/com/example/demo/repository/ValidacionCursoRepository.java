package com.example.demo.repository;

import com.example.demo.model.ValidacionCurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ValidacionCursoRepository extends JpaRepository<ValidacionCurso, Integer> {
}