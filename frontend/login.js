document.getElementById("loginForm").addEventListener("submit",e=>{
    e.preventDefault();

    const data ={
        email: document.getElementById("email").value,
        password: document.getElementById("password").value

    }

    fetch ("http://localhost:8080/api/auth/login",{
        
        method: "POST",
        headers: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify(data)

    }).then(res => {
        if (!res.ok) throw new Error("Credenciales incorrectas");
        return res.text(); // o .json(), depende de cómo el backend devuelva el token

    }).then(
        token=>{
            localStorage.setItem("token",token);
            alert("¡Login exitoso!");
            window.location.href="galeria.html";
        }
        
    ).catch(err=>console.error(err));
    alert("Error al iniciar sesión"+err.message)}
);