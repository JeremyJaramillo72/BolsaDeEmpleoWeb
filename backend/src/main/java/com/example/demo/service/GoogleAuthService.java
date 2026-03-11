package com.example.demo.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class GoogleAuthService {

    // Traemos el ID que configuraste en tu application.properties
    @Value("${google.clientId}")
    private String clientId;

    public GoogleIdToken.Payload verificarToken(String tokenString) throws Exception {
        // Configuramos el verificador oficial de Google
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(clientId))
                .build();

        // Verificamos el token
        GoogleIdToken idToken = verifier.verify(tokenString);

        if (idToken != null) {
            // Si es válido, devolvemos toda la info del usuario (Payload)
            return idToken.getPayload();
        } else {
            throw new IllegalArgumentException("Token de Google inválido o caducado bro");
        }
    }
}