// controlador/menuControlador.js
// --------------------------------------------------------------
//  Menú superior: muestra usuario activo y permite cerrar sesión
// --------------------------------------------------------------

import { obtenerUsuarioActivo, cerrarSesion } from "../Modelo/almacenaje.js";

/* ----------  PINTAR MENÚ  ---------- */
function mostrarUsuarioActivo() {
  const navUsuario   = document.getElementById("navUsuario");
  const registerLink = document.getElementById("registerLink");
  const usuario      = obtenerUsuarioActivo();

  if (!navUsuario) return;

  if (usuario) {
    navUsuario.innerHTML = `
      <span>${(usuario.nombre ?? usuario.correo)
        .charAt(0).toUpperCase() + (usuario.nombre ?? usuario.correo).slice(1)} (${usuario.rol})</span>
      <button id="cerrarSesion" class="btn btn-sm btn-danger">
        Cerrar sesión
      </button>`;

    document.getElementById("cerrarSesion")
      .addEventListener("click", () => {
        cerrarSesion();
        location.href = "inicioSesion.html";
      });

    registerLink && (registerLink.style.display = "none");

    //  Ocultar elementos de administración si no es admin
    if (usuario.rol !== 'admin') {
      const zonaAdmin = document.getElementById("zonaAdmin");
      zonaAdmin && (zonaAdmin.style.display = "none");
    }

  } else {
    navUsuario.innerHTML = `
      <span class="me-2">-no login-</span>
      <a href="inicioSesion.html">Login</a>`;
    registerLink && (registerLink.style.display = "block");
  }
}

/* ----------  INIT  ---------- */
document.addEventListener("DOMContentLoaded", mostrarUsuarioActivo);
