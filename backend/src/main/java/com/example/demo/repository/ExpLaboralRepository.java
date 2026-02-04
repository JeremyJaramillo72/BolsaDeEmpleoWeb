package com.example.demo.repository;

import com.example.demo.model.exp_laboral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpLaboralRepository extends JpaRepository<exp_laboral, Integer> {
}