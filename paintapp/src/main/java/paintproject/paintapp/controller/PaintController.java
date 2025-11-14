package paintproject.paintapp.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import paintproject.paintapp.model.Drawing;
import paintproject.paintapp.service.PaintService;
import paintproject.paintapp.security.JwtService;

import java.io.Console;
import java.util.List;

@RestController
@RequestMapping("/api/dibujos")
public class PaintController {

    @Autowired
    private PaintService paintService;

    @Autowired
    private JwtService jwtService;

    // Guardar dibujo (usa el token para obtener userId)
    @PostMapping
        public ResponseEntity<?> guardarDibujo(@RequestBody Drawing dibujo, 
            @RequestHeader("Authorization") String authHeader) {
            try {
                String token = authHeader.replace("Bearer ", "");
                String email = jwtService.extraerEmail(token); //  aquí extraemos el email
                Long userId = paintService.obtenerUserIdPorEmail(email); //  buscamos en BD

                if (userId == null) {
                    return ResponseEntity.badRequest().body("Usuario no encontrado");
                }

                dibujo.setUserId(userId);
                paintService.guardarDibujo(dibujo);


                return ResponseEntity.ok("Dibujo guardado correctamente");
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Error al guardar dibujo: " + e.getMessage());
            }
        }


    // Obtener todos los dibujos del usuario autenticado
    @GetMapping
    public ResponseEntity<List<Drawing>> obtenerDibujosUsuario(
        @RequestHeader("Authorization") String authHeader
        ) {
            try {
                String token = authHeader.replace("Bearer ", "");
                String email = jwtService.extraerEmail(token); // 🔹 Cambia aquí
                Long userId = paintService.obtenerUserIdPorEmail(email); // 🔹 Nuevo método

                List<Drawing> dibujos = paintService.obtenerDibujosPorUsuario(userId);
                System.out.println(dibujos+"esto proviene del controlador");
                return ResponseEntity.ok(dibujos);
            } catch (Exception e) {
                e.printStackTrace(); // <--esto para ver el error real en consola
                return ResponseEntity.badRequest().build();
            }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarDibujo(@RequestHeader("Authorization") String authHeader, @PathVariable Long id){ //pathvariable porque no es algo que se mande por body sino que está directamente en la url
        try {
            String token= authHeader.replace("Bearer","");
            String email= jwtService.extraerEmail(token);
            Long user_id= paintService.obtenerUserIdPorEmail(email);

            if (user_id==null) {
                return ResponseEntity.badRequest().body("Usuario no encontrado");
                
            }
            System.out.println("id del usuario"+user_id);
            System.out.println("Id del dibujo:"+id);

            paintService.eliminarDibujo(user_id, id);
            return ResponseEntity.ok("Dibujo correctamente eliminado");
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar el dibujo: " + e.getMessage());
        }
    }



    @GetMapping("/{id}")
    public ResponseEntity<Drawing> obtenerDibujoPorId(
        @RequestHeader("Authorization") String authHeader,
        @PathVariable Long id
    ) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtService.extraerEmail(token);
            Long userId = paintService.obtenerUserIdPorEmail(email);


            Drawing dibujo = paintService.obtenerDibujoPorId(id);
            if (dibujo == null || !dibujo.getUserId().equals(userId)) {
                return ResponseEntity.status(403).build(); // No pertenece al usuario
            }
            return ResponseEntity.ok(dibujo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    
    @PutMapping("/{id}")
    public ResponseEntity<String> actualizarDibujo(
        @RequestHeader("Authorization") String authHeader,
        @PathVariable Long id,
        @RequestBody Drawing dibujo
    ) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtService.extraerEmail(token); //  aquí extraemos el email
            Long userId = paintService.obtenerUserIdPorEmail(email); //  buscamos en BD

            System.out.println("TOKEN DE AUTH"+token);
            System.out.println("ID DEL DUEÑO"+userId);
            System.out.println("ID DEL DIBUJO"+id);
            

            Drawing existente = paintService.obtenerDibujoPorId(id);
            if (existente == null || !existente.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body("No tienes permiso para modificar este dibujo");
            }

            dibujo.setUserId(userId);
            paintService.actualizarDibujo(id, dibujo);
            return ResponseEntity.ok("Dibujo actualizado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar dibujo: " + e.getMessage());
        }
    }

    


}
