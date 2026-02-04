package com.example.demo.repository;

import com.example.demo.model.documentacion_academica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentacionAcademicaRepository extends JpaRepository<documentacion_academica, Integer> {
}