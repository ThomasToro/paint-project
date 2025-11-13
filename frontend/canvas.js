const canvas = document.getElementById("paintCanvas");
const ctx = canvas.getContext("2d");

let painting = false;
let startX, startY;
let currentTool = "line";
let color = "#000";

// Verificar sesión activa
const token = localStorage.getItem("token");
if (!token) {
  alert("Debes iniciar sesión primero");
  window.location.href = "login.html";
}

// Verificar si es dibujo nuevo o existente
const drawingId = localStorage.getItem("drawingId");
let isNew = !drawingId;

// Cambiar herramienta
document.getElementById("tool").addEventListener("change", e => {
  currentTool = e.target.value;
});

// Cambiar color
document.getElementById("colorPicker").addEventListener("input", e => {
  color = e.target.value;
});

// Eventos de dibujo
canvas.addEventListener("mousedown", e => {
  painting = true;
  startX = e.offsetX;
  startY = e.offsetY;
});

canvas.addEventListener("mouseup", e => {
  if (!painting) return;
  painting = false;
  const endX = e.offsetX;
  const endY = e.offsetY;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  switch (currentTool) {
    case "line":
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      break;

    case "rect":
      ctx.strokeRect(startX, startY, endX - startX, endY - startY);
      break;

    case "square":
      const side = Math.min(Math.abs(endX - startX), Math.abs(endY - startY));
      ctx.strokeRect(
        startX,
        startY,
        side * Math.sign(endX - startX),
        side * Math.sign(endY - startY)
      );
      break;

    case "circle":
      const radius = Math.sqrt(
        (endX - startX) ** 2 + (endY - startY) ** 2
      );
      ctx.beginPath();
      ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
      ctx.stroke();
      break;

    case "ellipse":
      ctx.beginPath();
      ctx.ellipse(
        startX,
        startY,
        Math.abs(endX - startX),
        Math.abs(endY - startY),
        0,
        0,
        2 * Math.PI
      );
      ctx.stroke();
      break;
  }
});

// Limpiar lienzo
document.getElementById("clearBtn").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Guardar o actualizar dibujo
document.getElementById("saveBtn").addEventListener("click", () => {
  const imageData = canvas.toDataURL("image/png");

  const title = isNew
    ? prompt("Nombre del nuevo dibujo:")
    : prompt("Actualizar nombre del dibujo:", "");

  if (!title) return;

  const url = isNew
    ? "http://localhost:8080/api/dibujos"
    : `http://localhost:8080/api/dibujos/${drawingId}`;

  const method = isNew ? "POST" : "PUT";

  fetch(url, {
    method,
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
    title: title,
    vectorData: imageData,
    backgroundImagePath: null
  })

  })
    .then(res => {
      if (!res.ok) throw new Error("Error al guardar dibujo");
      return res.text();
    })
    .then(msg => {
      alert(msg);
      window.location.href = "galeria.html";
    })
    .catch(err => console.error(err));
});

// Volver a la galería
document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "galeria.html";
});

// Si existe un dibujo, cargarlo al abrir
if (!isNew) {
  fetch(`http://localhost:8080/api/dibujos/${drawingId}`, {
    headers: {
      "Authorization": "Bearer " + token
    }
  })
    .then(res => res.json())
    .then(dibujo => {
      const img = new Image();
      img.src = dibujo.vectorData;
      img.onload = () => ctx.drawImage(img, 0, 0);
    })
    .catch(err => console.error("Error al cargar el dibujo:", err));
}
