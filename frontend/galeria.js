// Verificar sesión activa
const token = localStorage.getItem("token");
if (!token) {
  alert("Debes iniciar sesión primero");
  window.location.href = "login.html";
}

const container = document.getElementById("drawingsContainer");

// Cargar los dibujos del usuario
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
      card.dataset.id = d.id;

      //Contenedor fondo ----
      const previewContainer = document.createElement("div");
      previewContainer.classList.add("drawing-preview");

      if (d.backgroundImagePath) {
        previewContainer.style.backgroundImage = `url(${d.backgroundImagePath})`;
      }

      //Imagen del dibujo ----
      const previewImg = document.createElement("img");
      previewImg.classList.add("drawing-preview-img");
      previewImg.alt = d.title;
      previewImg.src = d.vectorData || "placeholder.png";
      previewContainer.appendChild(previewImg);

      //ítulo ----
      const title = document.createElement("div");
      title.classList.add("drawing-title");
      title.textContent = d.title || "(Sin título)";

      // Botón eliminar ----
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Eliminar";
      deleteBtn.classList.add("delete-btn");

      //Evitar que el clic del botón abra el dibujo
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        if (confirm(`¿Seguro que quieres eliminar "${d.title}"?`)) {
          eliminarDibujo(d.id, card);
        }
      });

      // ---- Ensamblar tarjeta ----
      card.appendChild(title);
      card.appendChild(previewContainer);
      card.appendChild(deleteBtn);

      // ---- Click para abrir el dibujo ----
      card.addEventListener("click", () => {
        localStorage.setItem("drawingId", d.id);
        window.location.href = "canvas.html";
      });

      container.appendChild(card);
    });
  })
  .catch(err => {
    console.error("Error al cargar dibujos:", err);
    container.innerHTML = "<p>Error al cargar tus dibujos.</p>";
  });


// --------------------------------------------
// Función para eliminar dibujo
// --------------------------------------------
function eliminarDibujo(id, cardElement) {
  fetch(`http://localhost:8080/api/dibujos/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + token
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("No se pudo eliminar el dibujo");

      // Quitar visualmente la tarjeta eliminada
      cardElement.remove();

      alert("Dibujo eliminado correctamente");
    })
    .catch(err => {
      console.error("Error al eliminar dibujo:", err);
      alert("Error al eliminar el dibujo");
    });
}


// Nuevo dibujo
document.getElementById("newDrawingBtn").addEventListener("click", () => {
  localStorage.removeItem("drawingId");
  window.location.href = "canvas.html";
});

// Cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("drawingId");
  window.location.href = "login.html";
});
