package com.example.demo.repository;

import com.example.demo.model.ValidacionExpLaboral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ValidacionExpLaboralRepository extends JpaRepository<ValidacionExpLaboral, Integer> {
}