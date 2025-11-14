package paintproject.paintapp.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import paintproject.paintapp.model.Drawing;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class DrawingRepository {

    @Autowired
    private UserRepository userRepository;

    private final JdbcTemplate jdbc;

    public DrawingRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }


    public void save(Drawing dibujo) {
        String sql = "INSERT INTO drawings (title, vector_data, background_image_path, user_id) VALUES (?, ?, ?, ?)";
        jdbc.update(sql, dibujo.getTitle(), dibujo.getVectorData(), dibujo.getBackgroundImagePath(), dibujo.getUserId());
    }

    //------------------------ LO ACABO DE AÑADIR
    public void delete(Long userId, Long drawingId){
        String sql= "DELETE FROM drawings WHERE user_id = ? AND id = ?";
        jdbc.update(sql, userId, drawingId);
    }

    public List<Drawing> findByUserId(Long userId) {
        String sql = "SELECT * FROM drawings WHERE user_id = ?";
        return jdbc.query(sql, (rs, rowNum) -> mapRow(rs), userId);
    }

    private Drawing mapRow(ResultSet rs) throws SQLException {
        Drawing d = new Drawing();
        d.setId(rs.getLong("id"));
        d.setTitle(rs.getString("title"));
        d.setVectorData(rs.getString("vector_data"));
        d.setBackgroundImagePath(rs.getString("background_image_path"));
        d.setUserId(rs.getLong("user_id"));
        return d;
    }

    public Long obtenerUserIdPorEmail(String email) {
        var user = userRepository.findByEmail(email);
        return user != null ? user.getId() : null;
    }

    public Drawing findById(Long id) {
        String sql = "SELECT * FROM drawings WHERE id = ?";
        return jdbc.query(sql, rs -> {
            if (rs.next()) return mapRow(rs);
            return null;
        }, id);
    }

    public void update(Long id, Drawing dibujo) {
        String sql = "UPDATE drawings SET title = ?, vector_data = ?, background_image_path = ? WHERE id = ?";
        jdbc.update(sql, dibujo.getTitle(), dibujo.getVectorData(), dibujo.getBackgroundImagePath(), id);
    }


}
