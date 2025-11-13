
package paintproject.paintapp.security;



import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;

import io.jsonwebtoken.Claims;



@Service

public class JwtService {



    private static final String SECRET_KEY = "ESTA_ES_MI_SUPER_CLAVE_SEGURA_32_CHARS";



    public Long extraerUserId(String token) {

        try {

            Claims claims = Jwts.parserBuilder()

                .setSigningKey(SECRET_KEY.getBytes())

                .build()

                .parseClaimsJws(token)

                .getBody();

            

            return claims.get("userId", Long.class);

        } catch (Exception e) {

            throw new RuntimeException("Invalid token", e);

        }

    }

    public String extraerEmail(String token) {
    try {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(SECRET_KEY.getBytes())
            .build()
            .parseClaimsJws(token)
            .getBody();

        return claims.getSubject(); //normalmente el email se guarda como 'sub' (subject)
    } catch (Exception e) {
        throw new RuntimeException("Token inválido", e);
    }
}


}

