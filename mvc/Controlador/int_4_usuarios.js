// --------------------------------------------------
//  Vista  Usuarios  (CRUD con GraphQL)
// --------------------------------------------------
import {
  obtenerUsuarios,
  guardarUsuario,
  eliminarUsuario,
  obtenerUsuarioActivo
} from '../modelo/almacenaje.js';

// ---------- helpers ----------
const filaHTML = (u, esAdmin) => `
  <tr>
     <td>${u.nombre}</td>
     <td>${u.correo}</td>
     <td>${u.password}</td>
     <td>
       ${esAdmin
         ? `<button class="btn btn-sm btn-danger borrar" data-correo="${u.correo}">
              Borrar
            </button>`
         : `<span class="text-muted">—</span>`}
     </td>
  </tr>`;

// ---------- listado ----------
async function pintarTabla () {
  const tbody   = document.getElementById('tablaUsuarios');
  const usuario = obtenerUsuarioActivo();
  const esAdmin = usuario?.rol === "admin";

  // Si no hay sesión, ocultar tabla y salir
  const tablaContenedor = document.querySelector(".consulta-borrador-container");
  if (!usuario && tablaContenedor) {
    tablaContenedor.style.display = "none";
    return;
  }

  const lista = await obtenerUsuarios();
  tbody.innerHTML = lista.map(u => filaHTML(u, esAdmin)).join('');

  if (esAdmin) {
    tbody.querySelectorAll('.borrar').forEach(btn => {
      btn.onclick = async e => {
        await eliminarUsuario(e.target.dataset.correo);
        pintarTabla();
      };
    });
  }
}

// ---------- alta ----------
async function alta (e) {
  e.preventDefault();
  const ok = await guardarUsuario({
    nombre:   nombre.value.trim(),
    correo:   correo.value.trim(),
    password: password.value
  });
  if (!ok) return alert('Ese correo ya existe');
  e.target.reset();
  pintarTabla();
}

// ---------- init ----------
document.addEventListener('DOMContentLoaded', () => {
  pintarTabla();
  formUsuario.addEventListener('submit', alta);
});
