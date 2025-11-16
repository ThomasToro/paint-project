document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    try {
        const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
        });

        console.log("Respuesta completa:", res);

        const text = await res.text();
        console.log("Cuerpo recibido:", text);

        //Si el backend envía explícitamente un mensaje de error en texto:
        if (/credencial/i.test(text)) {
        alert(text);
        return;
        }

        //Si espero un JWT, comprueba que tenga 2 puntos , header.payload.signature
        const looksLikeJwt = typeof text === "string" && text.split('.').length === 3;
        if (!looksLikeJwt) {
        alert("Respuesta inesperada del servidor: " + text);
        return;
        }

        //OK
        localStorage.setItem("token", text.trim());
        alert("¡Login exitoso!");
        window.location.href = "galeria.html";

    } catch (err) {
        console.error(err);
        alert("Error al iniciar sesión: " + err.message);
    }
});
