// --------------------------------------------------
//  Vista  Usuarios  (CRUD con GraphQL)
// --------------------------------------------------
import {
  obtenerUsuarios,
  guardarUsuario,
  eliminarUsuario
} from '../modelo/almacenaje.js';

// ---------- helpers ----------
const filaHTML = u => `
  <tr>
     <td>${u.nombre}</td>
     <td>${u.correo}</td>
     <td>${u.password}</td>
     <td>
       <button class="btn btn-sm btn-danger borrar" data-correo="${u.correo}">
         Borrar
       </button>
     </td>
  </tr>`;

// ---------- listado ----------
async function pintarTabla () {
  const tbody = document.getElementById('tablaUsuarios');
  tbody.innerHTML = (await obtenerUsuarios()).map(filaHTML).join('');

  tbody.querySelectorAll('.borrar').forEach(btn => {
    btn.onclick = async e => {
      await eliminarUsuario(e.target.dataset.correo);
      pintarTabla();
    };
  });
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
