package paintproject.paintapp.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import paintproject.paintapp.model.User;
import paintproject.paintapp.repository.UserRepository;
import paintproject.paintapp.security.JwtUtil;

@Service
public class AuthService {

    private final UserRepository repo;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository repo, JwtUtil jwtUtil) {
        this.repo = repo;
        this.jwtUtil = jwtUtil;
    }

    public String register(User user) {
        if (repo.findByEmail(user.getEmail()) != null) {
            return "EL USUARIO YA EXISTE";
        }

        user.setPassword(encoder.encode(user.getPassword()));
        repo.save(user);
        return "Usuario registrado correctamente";
    }

    public String login(String email, String password) {
        User user = repo.findByEmail(email);

        if (user == null || !encoder.matches(password, user.getPassword())) {
            return null; // credenciales incorrectas
        }

        return jwtUtil.generateToken(user.getEmail());
    }
}
