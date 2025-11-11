package paintproject.paintapp.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import paintproject.paintapp.model.User;;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbc;

    
    public UserRepository(JdbcTemplate jdbc){
        this.jdbc=jdbc;

    }

    public void save(User user){
        String sql= "INSERT INTO usuarios (nombre,email,password) VALUES (?,?,?)";

        jdbc.update(sql, user.getNombre(),user.getEmail(),user.getPassword());

    }

    public User findByEmail(String email){
        String sql= "SELECT * FROM usuarios WHERE email = ? LIMIT 1";
        return jdbc.query(sql, rs -> {
            if (rs.next()) {
                User u = new User();
                u.setId(rs.getLong("id"));
                u.setNombre(rs.getString("nombre"));
                u.setEmail(rs.getString("email"));
                u.setPassword(rs.getString("password"));
                return u;
                
                
            }
            return null;
        }, email);

    }
    
}
