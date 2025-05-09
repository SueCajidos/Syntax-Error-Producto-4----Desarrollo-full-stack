// controlador/loginControlador.js
// --------------------------------------------------------------
//  Inicio de sesión (versión provisional sin JWT)
// --------------------------------------------------------------

import {
  loguearUsuario,
  obtenerUsuarioActivo,
  cerrarSesion
} from "../Modelo/almacenaje.js";   

/* ----------  SUBMIT LOGIN  ---------- */
async function loguear(event) {
  event.preventDefault();

  const correo   = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const ok = await loguearUsuario(correo, password);   // ⇠ ahora async

  if (ok) {
    alert("Inicio de sesión exitoso");
    setTimeout(() => (location.href = "home.html"), 100);
  } else {
    alert("Correo o contraseña incorrectos");
  }
}

/* ----------  MOSTRAR USUARIO ACTIVO  ---------- */
function mostrarUsuarioActivo() {
  const navUsuario = document.getElementById("navUsuario");
  const usuario = obtenerUsuarioActivo();

  if (!navUsuario) return;

  if (usuario) {
    navUsuario.innerHTML = `
      <span>${usuario.nombre ?? usuario.correo}</span>
      <button id="cerrarSesionBtn"
              class="btn btn-sm btn-outline-dark ms-2">
        Cerrar Sesión
      </button>`;
    document
      .getElementById("cerrarSesionBtn")
      .addEventListener("click", () => {
        cerrarSesion();
        location.reload();
      });
  } else {
    navUsuario.innerHTML = `<a href="inicioSesion.html">Login</a>`;
  }
}

/* ----------  INIT  ---------- */
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("formLogin")
    ?.addEventListener("submit", loguear);

  mostrarUsuarioActivo();
});
