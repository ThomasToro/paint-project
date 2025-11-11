package paintproject.paintapp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String email;
    private String password;

    public User(){

    }

    public User (String nombre, String email, String password ) {
        this.nombre=nombre;
        this.email=email;
        this.password=password; 
    }

    public String getNombre(){
        return nombre;
    }

    public String getEmail(){
        return email;
    }

    public String getPassword(){
        return password;
    }

    public void setId(Long nuevoId){
        this.id= nuevoId;

    }

    public void setNombre(String nuevoNombre){
    this.nombre= nuevoNombre;

    }

    public void setEmail(String nuevoEmail){
        this.email= nuevoEmail;

    }

    public void setPassword(String nuevaContrasena){
        this.password= nuevaContrasena;
    }


}
