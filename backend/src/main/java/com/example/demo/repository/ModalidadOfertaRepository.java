package com.example.demo.repository;
import com.example.demo.model.ModalidadOferta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ModalidadOfertaRepository extends JpaRepository<ModalidadOferta, Integer> {}