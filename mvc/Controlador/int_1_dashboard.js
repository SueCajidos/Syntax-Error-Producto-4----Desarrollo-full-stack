import { obtenerVoluntariados } from "../modelo/almacenaje.js";

const voluntariadosContainer = document.getElementById("voluntariadosContainer");
const seleccionContainer = document.getElementById("seleccionVoluntariadosContainer");

function handleDragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.id); // Guarda el ID del voluntariado
  e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function handleDrop(e) {
  e.preventDefault();
  const cardId = e.dataTransfer.getData("text/plain");
  const card = document.getElementById(cardId);

  if (card && e.target === seleccionContainer) {
    seleccionContainer.appendChild(card);

    const ph = seleccionContainer.querySelector("p");
    if (ph && seleccionContainer.children.length > 1) ph.remove();

    const sel = JSON.parse(localStorage.getItem("seleccionVoluntariados")) || [];
    if (!sel.includes(cardId)) {
      sel.push(cardId);
      localStorage.setItem("seleccionVoluntariados", JSON.stringify(sel));
    }
  }
}

function handleDropVolver(e) {
  e.preventDefault();
  const cardId = e.dataTransfer.getData("text/plain");
  const card = document.getElementById(cardId);

  if (card && e.target === voluntariadosContainer) {
    voluntariadosContainer.appendChild(card);

    const sel = JSON.parse(localStorage.getItem("seleccionVoluntariados")) || [];
    localStorage.setItem("seleccionVoluntariados", JSON.stringify(sel.filter(id => id !== cardId)));

    const quedan = Array.from(seleccionContainer.children).some(el => el.classList.contains("card"));
    if (!quedan) seleccionContainer.innerHTML = "<p>Aquí se mostraría una selección de voluntariados.</p>";
  }
}

async function mostrarVoluntariadosHome() {
  if (!voluntariadosContainer) return;

  voluntariadosContainer.innerHTML = "";
  seleccionContainer.innerHTML = "<p>Aquí se mostraría una selección de voluntariados.</p>";

  try {
    const voluntariados = await obtenerVoluntariados();
    const seleccion = JSON.parse(localStorage.getItem("seleccionVoluntariados")) || [];

    if (!voluntariados.length) {
      voluntariadosContainer.innerHTML = "<p>No hay voluntariados disponibles actualmente.</p>";
      return;
    }

    voluntariados.forEach(v => {
      const cardId = `voluntariado-card-${v.id}`;
      const card = document.createElement("div");
      card.id = cardId;
      card.className = "card " + (v.tipo === "Oferta" ? "card-oferta" : "card-peticion");
      card.draggable = true;
      card.innerHTML = `
        <div class="card-image"></div>
        <h3>${v.titulo}</h3>
        <p><strong>Usuario:</strong> ${v.usuario.correo}</p>
        <p><strong>Fecha:</strong> ${v.fecha}</p>
        <p><strong>Descripción:</strong> ${v.descripcion}</p>
        <p class="tipo">${v.tipo}</p>
      `;
      card.addEventListener("dragstart", handleDragStart);

      if (seleccion.includes(cardId)) {
        seleccionContainer.querySelector("p")?.remove();
        seleccionContainer.appendChild(card);
      } else {
        voluntariadosContainer.appendChild(card);
      }
    });
  } catch (err) {
    console.error("Error al cargar voluntariados:", err);
    voluntariadosContainer.innerHTML = "<p>Error al cargar los voluntariados.</p>";
  }
}

async function initHome() {
  await mostrarVoluntariadosHome();

  seleccionContainer?.addEventListener("dragover", handleDragOver);
  seleccionContainer?.addEventListener("drop", handleDrop);

  voluntariadosContainer?.addEventListener("dragover", handleDragOver);
  voluntariadosContainer?.addEventListener("drop", handleDropVolver);

  // Mostrar selección si ya existe
  const sel = JSON.parse(localStorage.getItem("seleccionVoluntariados")) || [];
  if (sel.length > 0) {
    sel.forEach(id => {
      const card = document.getElementById(id);
      if (card) seleccionContainer.appendChild(card);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initHome();

  const btnVaciar = document.getElementById("vaciarSeleccion");
  btnVaciar?.addEventListener("click", () => {
    localStorage.removeItem("seleccionVoluntariados");
    location.reload();
  });
});
