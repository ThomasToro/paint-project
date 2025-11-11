package paintproject.paintapp.controller;

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
    public String login(@RequestBody User user){
        String token = authservice.login(user.getEmail(), user.getPassword());
        if (token == null) return "CREDENCIALES INVALIDAS";
        return token;
    }
    

    
    
}
