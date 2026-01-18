package com.example.demo.repository;

import com.example.demo.model.DocumentacionAcademica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentacionAcademicaRepository extends JpaRepository<DocumentacionAcademica, Integer> {
}