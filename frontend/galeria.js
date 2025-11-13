// Verificar sesión activa
const token = localStorage.getItem("token");
if (!token) {
  alert("Debes iniciar sesión primero");
  window.location.href = "login.html";
}

const container = document.getElementById("drawingsContainer");

// 🔄 Cargar los dibujos del usuario
fetch("http://localhost:8080/api/dibujos", {
  method: "GET",
  headers: {
    "Authorization": "Bearer " + token,
    "Content-Type": "application/json"
  }
})
  .then(res => {
    if (!res.ok) throw new Error("Error al cargar dibujos");
    return res.json();
  })
  .then(dibujos => {
    if (!dibujos || dibujos.length === 0) {
      container.innerHTML = "<p>No tienes dibujos guardados aún.</p>";
      return;
    }

    dibujos.forEach(d => {
      const card = document.createElement("div");
      card.classList.add("drawing-card");
      card.dataset.id = d.id; //Guarda el ID como atributo

      // Miniatura del dibujo
      const preview = document.createElement("img");
      preview.classList.add("drawing-preview");
      preview.alt = d.title;
      preview.src = d.vectorData || "placeholder.png"; // Mostrar miniatura real o fallback

      // Título del dibujo
      const title = document.createElement("div");
      title.classList.add("drawing-title");
      title.textContent = d.title || "(Sin título)";

      // Ensamblar tarjeta
      card.appendChild(preview);
      card.appendChild(title);

      // Al hacer clic → guardar ID y abrir canvas
      card.addEventListener("click", () => {
        localStorage.setItem("drawingId", d.id);
        console.log(" Dibujo seleccionado:", d.id);
        window.location.href = "canvas.html";
      });

      container.appendChild(card);
    });
  })
  .catch(err => {
    console.error(" Error al cargar dibujos:", err);
    container.innerHTML = "<p>Error al cargar tus dibujos.</p>";
  });

// ➕ Nuevo dibujo
document.getElementById("newDrawingBtn").addEventListener("click", () => {
  localStorage.removeItem("drawingId");
  window.location.href = "canvas.html";
});

// 🚪 Cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("drawingId");
  window.location.href = "login.html";
});
