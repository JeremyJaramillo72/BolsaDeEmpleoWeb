package com.example.demo.repository;

import com.example.demo.model.SeguridadDb;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SeguridadDbRepository extends JpaRepository<SeguridadDb, Integer> {
}