package com.example.demo.repository;

import com.example.demo.model.ValidacionDocumentacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ValidacionDocumentacionRepository extends JpaRepository<ValidacionDocumentacion, Integer> {
}