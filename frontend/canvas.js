const canvas = document.getElementById("paintCanvas");
const ctx = canvas.getContext("2d");

let painting = false; 
let startX, startY;
let currentTool = "line";
let color = "#000";
let backgroundImage = null;
let bgX = 0, bgY = 0;        
let bgScale = 1;            
let draggingBackground = false;
let dragOffsetX = 0, dragOffsetY = 0;
let isDrawingShape = false; 
let snapshot = null;
let polygonSides = 5; // <-- Usará este valor (5)
let starPoints = 5;   // <-- Usará este valor (5)
let lineWidthInput = document.getElementById("lineWidth"); 


const token = localStorage.getItem("token");
if (!token) {
  alert("Debes iniciar sesión primero");
  window.location.href = "login.html";
}

const drawingId = localStorage.getItem("drawingId");
let isNew = !drawingId;

document.getElementById("tool").addEventListener("change", e => {
  currentTool = e.target.value;
});

document.getElementById("colorPicker").addEventListener("input", e => {
  color = e.target.value;
});


// -------------------------------------------------------------
// ---INICIO LÓGICA DE DIBUJO ---
// -------------------------------------------------------------

/* FUNCIONES AUXILIARES */
function getLineWidth() {
  if (lineWidthInput) return Number(lineWidthInput.value) || 2;
  return 2; 
}

function takeSnapshot() {
  try {
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  } catch (e) {
    console.warn("No se pudo tomar snapshot (posiblemente por CORS):", e);
    snapshot = null;
  }
}

function restoreSnapshot() {
  if (snapshot) ctx.putImageData(snapshot, 0, 0);
}

/* FUNCIONES DE DIBUJO DE FORMAS */
function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawRect(x1, y1, x2, y2) {
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
}

function drawSquare(x1, y1, x2, y2) {
  const side = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1));
  const sx = x2 >= x1 ? x1 : x1 - side;
  const sy = y2 >= y1 ? y1 : y1 - side;
  ctx.strokeRect(sx, sy, side, side);
}

function drawCircle(x1, y1, x2, y2) {
  const r = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
  ctx.beginPath();
  ctx.arc(x1, y1, r, 0, Math.PI*2);
  ctx.stroke();
}

function drawEllipse(x1, y1, x2, y2) {
  const rx = Math.abs(x2 - x1);
  const ry = Math.abs(y2 - y1);
  ctx.beginPath();
  ctx.ellipse(x1, y1, rx, ry, 0, 0, Math.PI*2);
  ctx.stroke();
}

function drawPolygon(cx, cy, radius, sides) {
  if (sides < 3) sides = 3;
  ctx.beginPath();
  for (let i=0;i<sides;i++){
    const a = (i / sides) * Math.PI * 2 - Math.PI/2;
    const x = cx + Math.cos(a) * radius;
    const y = cy + Math.sin(a) * radius;
    if (i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.closePath();
  ctx.stroke();
}

function drawStar(cx, cy, outer, inner, points) {
  const step = Math.PI / points;
  ctx.beginPath();
  for (let i = 0; i < 2 * points; i++) {
    const r = (i % 2 === 0) ? outer : inner;
    const a = i * step - Math.PI/2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

/* EVENT HANDLERS  */
canvas.addEventListener("mousedown", e => {
  // Se usa getBoundingClientRect para precisión
  const rect = canvas.getBoundingClientRect();
  startX = Math.round(e.clientX - rect.left);
  startY = Math.round(e.clientY - rect.top);

  // Configuraciones comunes
  ctx.strokeStyle = color; 
  ctx.lineWidth = getLineWidth();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (currentTool === "pencil" || currentTool === "eraser") {
    painting = true; 
    ctx.beginPath();
    ctx.moveTo(startX, startY);

    if (currentTool === "eraser") {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = getLineWidth() * 2; 
    }
    return;
  }

  // para shapes: tomar snapshot para preview
  isDrawingShape = true;
  takeSnapshot();


});

canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  const mx = Math.round(e.clientX - rect.left);
  const my = Math.round(e.clientY - rect.top);

  if (painting) {
    // pencil / eraser
    ctx.lineTo(mx, my);
    ctx.stroke();
    return;
  }

  if (!isDrawingShape) return;

  // restaurar snapshot y dibujar forma temporal
  restoreSnapshot();
  ctx.strokeStyle = color; 
  ctx.lineWidth = getLineWidth();

  switch (currentTool) {
    case "line":
      drawLine(startX, startY, mx, my);
      break;
    case "rect":
      drawRect(startX, startY, mx, my);
      break;
    case "square":
      drawSquare(startX, startY, mx, my);
      break;
    case "circle":
      drawCircle(startX, startY, mx, my);
      break;
    case "ellipse":
      drawEllipse(startX, startY, mx, my);
      break;
    case "polygon":
      const r = Math.sqrt((mx - startX)**2 + (my - startY)**2);
      drawPolygon(startX, startY, r, polygonSides); // <-- Usa 'polygonSides' (5)
      break;
    case "star":
      const outer = Math.sqrt((mx - startX)**2 + (my - startY)**2);
      const inner = outer * 0.5; 
      drawStar(startX, startY, outer, inner, starPoints); // <-- Usa 'starPoints' (5)
      break;
    default:
      break;
  }
});

canvas.addEventListener("mouseup", e => {
  if (painting) {
    // terminar pencil/eraser
    painting = false;
    if (currentTool === "eraser") {
      ctx.restore(); 
    }
    return;
  }

  if (!isDrawingShape) return;
  
  isDrawingShape = false;
  snapshot = null; 
});

/* SOPORTE TÁCTIL  */
function touchToMouse(event) {
  if (!event.touches || event.touches.length === 0) return;
  const t = event.touches[0];
  const rect = canvas.getBoundingClientRect();
  const simulated = { clientX: t.clientX, clientY: t.clientY };
  return simulated;
}
canvas.addEventListener("touchstart", e => {
  const s = touchToMouse(e);
  if (s) canvas.dispatchEvent(new MouseEvent("mousedown", {clientX: s.clientX, clientY: s.clientY}));
  e.preventDefault();
}, { passive: false }); 

canvas.addEventListener("touchmove", e => {
  const s = touchToMouse(e);
  if (s) canvas.dispatchEvent(new MouseEvent("mousemove", {clientX: s.clientX, clientY: s.clientY}));
  e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchend", e => {
  canvas.dispatchEvent(new MouseEvent("mouseup", {}));
  e.preventDefault();
}, { passive: false });


// -------------------------------------------------------------
// --- FIN LÓGICA DE DIBUJO ---
// -------------------------------------------------------------



// Seleccionar imagen
document.getElementById("setBackgroundBtn").addEventListener("click", () => {
  const fileInput = document.getElementById("backgroundInput");
  const file = fileInput.files[0];
  if (!file) {
    alert("Selecciona una imagen primero");
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.src = e.target.result;
    img.onload = () => {
      backgroundImage = img; 

      ctx.clearRect(0, 0, canvas.width, canvas.height); 
      
      canvas.style.backgroundImage = `url(${e.target.result})`;
      canvas.style.backgroundSize = "cover"; 
      canvas.style.backgroundPosition = "center";
    };
  };
  reader.readAsDataURL(file);
});

// Tu función redrawCanvas (parece no usarse, pero se mantiene)
function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (backgroundImage) {
    ctx.save();
    ctx.translate(bgX, bgY);
    ctx.scale(bgScale, bgScale);
    ctx.drawImage(backgroundImage, 0, 0);
    ctx.restore();
  }
}


// Limpiar lienzo
document.getElementById("clearBtn").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  snapshot = null; 
  
  canvas.style.backgroundImage = "none";
  backgroundImage = null;
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
  
  const bgData = backgroundImage ? backgroundImage.src : null;

  fetch(url, {
    method,
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: title,
      vectorData: imageData, 
      backgroundImagePath: bgData 
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
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.backgroundImage = "none";
      backgroundImage = null;
    
      if (dibujo.backgroundImagePath) {
        const bg = new Image();
        bg.src = dibujo.backgroundImagePath;
        bg.onload = () => {
          backgroundImage = bg; 
          canvas.style.backgroundImage = `url(${bg.src})`;
          canvas.style.backgroundSize = "cover";
          canvas.style.backgroundPosition = "center";
          
          const img = new Image();
          img.src = dibujo.vectorData;
          img.onload = () => ctx.drawImage(img, 0, 0);
        };
      } else {
        const img = new Image();
        img.src = dibujo.vectorData;
        img.onload = () => ctx.drawImage(img, 0, 0);
      }
      
    })
    .catch(err => console.error("Error al cargar el dibujo:", err));
}