package com.example.demo.dto; //

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data // Genera getters, setters, toString, etc.
@NoArgsConstructor // Genera el constructor vacío necesario para Spring
@AllArgsConstructor // Genera un constructor con todos los campos
public class LoginRequest {
    private String correo;
    private String contrasena;
}