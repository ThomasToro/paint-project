document.getElementById("registerForm").addEventListener("submit",e=>{
    e.preventDefault();

    const data = {
        nombre: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    }

    fetch("http://localhost:8080/api/auth/register",{
        method: "POST",
        headers: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify(data)

    }).then(res=> res.ok? alert("Registro exitoso") : alert("Ups, algo salió mal")).catch(err=> console.log(err));

})