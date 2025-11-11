package paintproject.paintapp.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser; // <-- Importante
import io.jsonwebtoken.security.Keys; // <-- Importante
import org.springframework.stereotype.Component;

import java.util.Date;
import java.security.Key; // <-- Importante
import java.nio.charset.StandardCharsets; // <-- Importante

@Component
public class JwtUtil {

    private final String SECRET = "ESTA_ES_MI_SUPER_CLAVE_SEGURA_32_CHARS";
    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 6; // 6 horas

    // 1. (NUEVO) Creamos una llave segura y reutilizable a partir del String
    private final Key key;

    // 2. (NUEVO) Creamos un parser reutilizable para esta llave
    private final JwtParser parser;

    // Constructor para inicializar la llave y el parser una sola vez
    public JwtUtil() {
        byte[] secretBytes = SECRET.getBytes(StandardCharsets.UTF_8);
        this.key = Keys.hmacShaKeyFor(secretBytes);
        this.parser = Jwts.parserBuilder().setSigningKey(key).build();
    }


    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                // 3. (CORREGIDO) Usamos la llave segura en lugar del String
                .signWith(key) 
                .compact();
    }

    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    public boolean validateToken(String token) {
        try {
            return !getClaims(token).getExpiration().before(new Date());
        } catch (Exception e) {
            // En un caso real, aquí deberías loggear la excepción (e.g., token malformado, expirado, etc.)
            // log.warn("Invalid JWT: {}", e.getMessage());
            return false;
        }
    }

    private Claims getClaims(String token) {
        // 4. (CORREGIDO) Usamos el parser reutilizable
        return parser.parseClaimsJws(token).getBody();
    }
}