package com.example.demo.repository;

import com.example.demo.model.ValidacionIdioma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ValidacionIdiomaRepository extends JpaRepository<ValidacionIdioma, Integer> {
}