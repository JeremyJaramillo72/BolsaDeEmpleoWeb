package com.example.demo.repository;

import com.example.demo.model.HistorialBackup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistorialBackupRepository extends JpaRepository<HistorialBackup,Long> {
    HistorialBackup findFirstByTipoOrderByIdBackupDesc(String tipo);
}
