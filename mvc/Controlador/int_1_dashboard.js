import {
  obtenerVoluntariados,
  obtenerUsuarioActivo,
  obtenerSeleccionVoluntariado,
  guardarSeleccionVoluntariado
} from "../modelo/almacenaje.js";

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

async function handleDrop(e) {
  e.preventDefault();
  const cardId = e.dataTransfer.getData("text/plain");
  const card = document.getElementById(cardId);

  if (card && e.target === seleccionContainer) {
    seleccionContainer.appendChild(card);

    const ph = seleccionContainer.querySelector("p");
    if (ph && seleccionContainer.children.length > 1) ph.remove();

    const usuario = obtenerUsuarioActivo();
    if (!usuario) return;

    let seleccion = await obtenerSeleccionVoluntariado(usuario.id);
    const idPuro = cardId.replace("voluntariado-card-", "");
    if (!seleccion.includes(idPuro)) {
      seleccion.push(idPuro);
      await guardarSeleccionVoluntariado(usuario.id, seleccion);
    }

  }
}

async function handleDropVolver(e) {
  e.preventDefault();
  const cardId = e.dataTransfer.getData("text/plain");
  const card = document.getElementById(cardId);

  if (card && e.target === voluntariadosContainer) {
    voluntariadosContainer.appendChild(card);

    const usuario = obtenerUsuarioActivo();
    if (!usuario) return;

    let seleccion = await obtenerSeleccionVoluntariado(usuario.id);
    const idPuro = cardId.replace("voluntariado-card-", "");
    seleccion = seleccion.filter(id => id !== idPuro);
    await guardarSeleccionVoluntariado(usuario.id, seleccion);


    const quedan = Array.from(seleccionContainer.children).some(el => el.classList.contains("card"));
    if (!quedan) {
      seleccionContainer.innerHTML = "<p>Aquí se mostraría una selección de voluntariados.</p>";
    }
  }
}

async function mostrarVoluntariadosHome() {
  if (!voluntariadosContainer) return;

  voluntariadosContainer.innerHTML = "";
  seleccionContainer.innerHTML = "<p>Aquí se mostraría una selección de voluntariados.</p>";

  try {
    const voluntariados = await obtenerVoluntariados();
    const usuario = obtenerUsuarioActivo();
    const seleccion = usuario ? await obtenerSeleccionVoluntariado(usuario.id) : [];

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

      if (seleccion.includes(v.id)) {
        seleccionContainer.querySelector("p")?.remove();
        seleccionContainer.appendChild(card);
      } else {
        voluntariadosContainer.appendChild(card);
      }

      card.addEventListener("dragstart", handleDragStart);


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

  const btnVaciar = document.getElementById("vaciarSeleccion");
  btnVaciar?.addEventListener("click", async () => {
    const usuario = obtenerUsuarioActivo();
    if (!usuario) return;

    await guardarSeleccionVoluntariado(usuario.id, []);
    location.reload();
  });
}

document.addEventListener("DOMContentLoaded", initHome);
