package paintproject.paintapp.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import paintproject.paintapp.service.AuthService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import paintproject.paintapp.model.User;;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authservice;

    public AuthController(AuthService authservice){
        this.authservice=authservice;

    }

    @PostMapping("/register")
    public String register(@RequestBody User user){
        return authservice.register(user);

    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User user){
        System.out.println("entramos al controller");
        System.out.println(user.getEmail()+user.getPassword());
        String token = authservice.login(user.getEmail(), user.getPassword());
        System.out.println(token);

        if (token == null) {
            //Devuelve 401 con mensaje
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Credenciales inválidas, vuelva a intentarlo");
        }

        //Devuelve 200 con token
        return ResponseEntity.ok(token);
}

    

    
    
}
