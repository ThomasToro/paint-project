package paintproject.paintapp.service;

import java.util.List;

import org.springframework.stereotype.Service;

import paintproject.paintapp.model.Drawing;
import paintproject.paintapp.repository.DrawingRepository;

@Service
public class PaintService {

    private final DrawingRepository drawingRepository;

    public PaintService(DrawingRepository drawingRepository) {
        this.drawingRepository = drawingRepository;
    }
    

    public void guardarDibujo(Drawing dibujo) {
        drawingRepository.save(dibujo);
        System.out.println(dibujo);
    }

    public List<Drawing> obtenerDibujosPorUsuario(Long userId) {
        return drawingRepository.findByUserId(userId);
    }

    public Drawing obtenerDibujoPorId(Long id) {
    return drawingRepository.findById(id);
}

    public void actualizarDibujo(Long id, Drawing dibujo) {
    drawingRepository.update(id, dibujo);
}


    public Long obtenerUserIdPorEmail(String email) {
    return drawingRepository.obtenerUserIdPorEmail(email);
}



    // public Drawing obtenerDibujo(Long id) {
    //     return drawingRepository.findById(id);
    // }

    // public void eliminarDibujo(Long id) {
    //     drawingRepository.delete(id);
    // }
}
