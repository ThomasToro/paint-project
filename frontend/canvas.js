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
let polygonSides = 5; 
let starPoints = 5;   
let lineWidthInput = document.getElementById("lineWidth"); 

const token = localStorage.getItem("token");
if (!token) {
  alert("Debes iniciar sesión primero");
  window.location.href = "login.html";
}

const drawingId = localStorage.getItem("drawingId");
let isNew = !drawingId;

// --- NUEVO SISTEMA PARA SELECCIONAR HERRAMIENTAS ---
const toolButtons = document.querySelectorAll(".tool-list li");
toolButtons.forEach(button => {
  button.addEventListener("click", () => {
    document.querySelector(".tool-list li.active").classList.remove("active");
    button.classList.add("active");
    currentTool = button.dataset.tool;
  });
});
// --- FIN DEL NUEVO SISTEMA ---

document.getElementById("colorPicker").addEventListener("input", e => {
  color = e.target.value;
});

// -------------------------------------------------------------
// --- LÓGICA DE COORDENADAS (LA SOLUCIÓN) ---
// -------------------------------------------------------------

/**
 * Esta función calcula la posición exacta del mouse dentro del canvas,
 * ajustando la escala si el CSS ha redimensionado el elemento.
 */
function getMousePos(evt) {
  const rect = canvas.getBoundingClientRect();
  
  // Calculamos la relación entre píxeles internos y píxeles en pantalla
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY
  };
}

// -------------------------------------------------------------
// --- FUNCIONES AUXILIARES Y DE DIBUJO ---
// -------------------------------------------------------------

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

// -------------------------------------------------------------
// --- EVENT HANDLERS (MODIFICADOS) ---
// -------------------------------------------------------------

canvas.addEventListener("mousedown", e => {
  // USA LA NUEVA FUNCIÓN AQUÍ
  const pos = getMousePos(e);
  startX = pos.x;
  startY = pos.y;

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
  // USA LA NUEVA FUNCIÓN AQUÍ TAMBIÉN
  const pos = getMousePos(e);
  const mx = pos.x;
  const my = pos.y;

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
      drawPolygon(startX, startY, r, polygonSides); 
      break;
    case "star":
      const outer = Math.sqrt((mx - startX)**2 + (my - startY)**2);
      const inner = outer * 0.5; 
      drawStar(startX, startY, outer, inner, starPoints); 
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

/* SOPORTE TÁCTIL (No requiere cambios grandes, ya que simula mousedown/move) */
function touchToMouse(event) {
  if (!event.touches || event.touches.length === 0) return;
  const t = event.touches[0];
  // Enviamos las coordenadas crudas, los listeners de arriba harán la corrección de escala
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
// --- GESTIÓN DE IMAGEN Y GUARDADO ---
// -------------------------------------------------------------

document.getElementById("setBackgroundBtn").addEventListener("click", () => {
  const fileInput = document.getElementById("backgroundInput");
  fileInput.click();
});

document.getElementById("backgroundInput").addEventListener("change", () => {
  const fileInput = document.getElementById("backgroundInput");
  const file = fileInput.files[0];
  
  if (!file) return;

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

document.getElementById("clearBtn").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  snapshot = null; 
  
  canvas.style.backgroundImage = "none";
  backgroundImage = null;
});

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

document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "galeria.html";
});

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