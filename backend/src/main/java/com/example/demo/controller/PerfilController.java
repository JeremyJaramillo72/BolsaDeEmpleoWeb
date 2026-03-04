package com.example.demo.controller;

import com.example.demo.dto.PerfilProfesionalDTO;
import com.example.demo.repository.ExpLaboralRepository;
import com.example.demo.repository.UsuarioIdiomaRepository;
import com.example.demo.repository.UsuarioImagenRepository;
import com.example.demo.service.IPerfilProfesionalService;
import com.example.demo.service.Impl.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

import com.example.demo.repository.UsuarioRepository;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PerfilController {
    private final IPerfilProfesionalService iPerfilProfesionalService;
    private final CloudinaryService cloudinaryService;
    private final UsuarioImagenRepository usuarioImagenRepository;




    @GetMapping("/perfil/{idUsuario}")
    public ResponseEntity<PerfilProfesionalDTO> obtenerPerfilCompleto(@PathVariable Long idUsuario) {
        try {
            PerfilProfesionalDTO perfil = iPerfilProfesionalService.obtenerPerfil(idUsuario);
            return ResponseEntity.ok(perfil);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/perfil-academico/registrar")
    public ResponseEntity<?> registrarAcademico(
            @RequestParam("idUsuario") Long idUsuario,
            @RequestParam("idCarrera") Integer idCarrera,
            @RequestParam("fechaGraduacion") String fechaGraduacion,
            @RequestParam(value = "numeroSenescyt", required = false) String registroSenescyt,
            @RequestParam(value = "archivo", required = false) MultipartFile archivo) {

        Map<String, Object> datos = new HashMap<>();
        datos.put("id_carrera", idCarrera);
        datos.put("fecha_graduacion", fechaGraduacion);
        datos.put("registro_senescyt", registroSenescyt);

        iPerfilProfesionalService.procesarYRegistrar(idUsuario, "academico", datos, archivo);
        return ResponseEntity.ok(Map.of("mensaje", "Formación académica guardada"));
    }

    @PostMapping("/perfil-idioma/registrars")
    public ResponseEntity<?> registrarIdiomas(

            @RequestParam("idUsuario") Long idUsuario,
            @RequestParam("idIdioma") Integer idIdioma,
            @RequestParam("nivel") String nivel,
            @RequestParam(value = "codigoCertificado", required = false) String codigoCertificado,
            @RequestParam(value = "archivo", required = false) MultipartFile archivo) {

        try {
        Map<String, Object> datos = new HashMap<>();
        datos.put("id_idioma", idIdioma);
        datos.put("nivel", nivel);
        datos.put("codigo_certificado", codigoCertificado);

        iPerfilProfesionalService.procesarYRegistrar(idUsuario, "idioma", datos, archivo);
        return ResponseEntity.ok(Map.of("mensaje", "Idioma guardado exitosamente"));
        }
        catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error a guardar idiomas");

        }

    }

    @PostMapping("/exp-laboral/registrar")
    public ResponseEntity<?> registrarExperiencia(
            @RequestParam("idUsuario") Long idUsuario,
            @RequestParam("idCargo") Integer idCargo,
            @RequestParam("idEmpresaCatalogo") Integer idEmpresaCatalogo,
            @RequestParam("fechaInicio") String fechaInicio,
            @RequestParam(value = "fechaFin", required = false) String fechaFin,
            @RequestParam("descripcion") String descripcion,
            @RequestParam(value = "ubicacion", required = false) String ubicacion,
            @RequestParam(value = "archivo", required = false) MultipartFile archivo) {

        Map<String, Object> datos = new HashMap<>();
        datos.put("id_cargo", idCargo);
        datos.put("id_empresa_catalogo", idEmpresaCatalogo);
        datos.put("fecha_inicio", fechaInicio);
        datos.put("fecha_fin", fechaFin);
        datos.put("descripcion", descripcion);
        datos.put("ubicacion", ubicacion);

        iPerfilProfesionalService.procesarYRegistrar(idUsuario, "experiencia", datos, archivo);
        return ResponseEntity.ok(Map.of("mensaje", "Experiencia laboral guardada"));
    }

    @PostMapping("/perfil-curso/registrar")
    public ResponseEntity<?> registrarCurso(
            @RequestParam("idUsuario") Long idUsuario,
            @RequestParam("nombreCurso") String nombreCurso,
            @RequestParam("institucion") String institucion,
            @RequestParam(value = "horasDuracion", required = false) Integer horasDuracion,
            @RequestParam(value = "archivo", required = false) MultipartFile archivo) {

        Map<String, Object> datos = new HashMap<>();
        datos.put("nombre_curso", nombreCurso);
        datos.put("institucion", institucion);
        datos.put("horas_duracion", horasDuracion);

        iPerfilProfesionalService.procesarYRegistrar(idUsuario, "curso", datos, archivo);
        return ResponseEntity.ok(Map.of("mensaje", "Curso guardado exitosamente"));
    }

    @PostMapping("/perfil/{id}/foto")
    public ResponseEntity<?> actualizarLogoUsuario(
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo) {
        try {

            String urlSegura = cloudinaryService.subirImagenEArchivo(archivo);

            System.out.println("¡Éxito! La URL en Cloudinary es: " + urlSegura);
            usuarioImagenRepository.guardarUrlImagen(id.intValue(), urlSegura);
            return ResponseEntity.ok(Map.of("urlImagen", urlSegura));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al subir la imagen a la nube");
        }
    }

    @DeleteMapping("/perfil/{idUsuario}/item/{tipoItem}/{idItem}")
    public ResponseEntity<?> eliminarItemPerfil(
            @PathVariable Long idUsuario,
            @PathVariable String tipoItem,
            @PathVariable Integer idItem) {
        try {

            iPerfilProfesionalService.eliminarItem(idUsuario, tipoItem, idItem);
            return ResponseEntity.ok(Map.of("mensaje", "elemento eliminado exitosamente"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("error al eliminar el elemento");
        }
    }


    @PostMapping("/perfil/cargos/crear")
    public ResponseEntity<?> crearNuevoCargo(@RequestBody Map<String, Object> payload) {
        try {
            String nombreCargo = (String) payload.get("nombreCargo");

            Integer nuevoId = iPerfilProfesionalService.RegistrarCargo(nombreCargo);

            return ResponseEntity.ok(Map.of(
                    "idCargo", nuevoId,
                    "nombreCargo", nombreCargo
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("error interno del servidor");
        }
    }

    @PostMapping("/perfil/empresas/crear")
    public ResponseEntity<?> crearNuevaEmpresa(@RequestBody Map<String, Object> payload) {
        try {
            String nombre = (String) payload.get("nombre_empresa");
            String ruc = (String) payload.get("ruc");
            Integer idCat = payload.get("id_categoria") != null ?
                    Integer.valueOf(payload.get("id_categoria").toString()) : null;

            Integer nuevoId = iPerfilProfesionalService.RegistrarCatalogoEmpresa(nombre, ruc, idCat);

            return ResponseEntity.ok(Map.of(
                    "idEmpresaCatalogo", nuevoId,
                    "nombreEmpresa", nombre
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("error al procesar la empresa");
        }
    }

}