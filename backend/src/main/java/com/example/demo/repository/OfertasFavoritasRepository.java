package com.example.demo.repository;

import com.example.demo.model.OfertasFavoritas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OfertasFavoritasRepository extends JpaRepository<OfertasFavoritas, Integer> {
}