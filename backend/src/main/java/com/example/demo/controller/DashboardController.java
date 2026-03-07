package com.example.demo.controller;

import com.example.demo.dto.DashboardDTO.*;
import com.example.demo.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin")
    public ResponseEntity<AdminStats> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminStats());
    }

    @GetMapping("/empresa/{idEmpresa}")
    public ResponseEntity<EmpresaStats> getEmpresaDashboard(@PathVariable Long idEmpresa) {
        return ResponseEntity.ok(dashboardService.getEmpresaStats(idEmpresa));
    }

    @GetMapping("/postulante/{idUsuario}")
    public ResponseEntity<PostulanteStats> getPostulanteDashboard(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(dashboardService.getPostulanteStats(idUsuario));
    }
}