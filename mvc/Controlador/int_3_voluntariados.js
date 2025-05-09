// --------------------------------------------------------------
//  Vista «Voluntariados»  – consume el backend GraphQL
// --------------------------------------------------------------

import {
  obtenerVoluntariados,
  guardarVoluntariado,
  eliminarVoluntariado,
  obtenerUsuarioActivo
} from '../modelo/almacenaje.js';

/* ---------- nodos DOM ---------- */
const tbody   = document.querySelector('#tablaVoluntariados tbody');
const form    = document.getElementById('formVoluntariado');
const inpMail = document.getElementById('usuario');
const canvas  = document.getElementById('graficoVoluntariados');
const ctx     = canvas.getContext('2d');

/* ============================================================== 
 * TABLA
 * ==============================================================*/
export async function cargarTabla () {
  const usuario = obtenerUsuarioActivo();
  tbody.innerHTML = '';

  let lista = await obtenerVoluntariados();

  // 🔐 Filtrar si no es admin
  if (usuario?.rol !== 'admin') {
    lista = lista.filter(v => v.usuario.correo === usuario.correo);
  }

  if (usuario) {
    // Mostrar tabla si hay usuario
    document.querySelector(".consulta-borrador-container").style.display = "block";
  } else {
    // Ocultar tabla si no hay usuario
    document.querySelector(".consulta-borrador-container").style.display = "none";
  }

  lista.forEach(v => {
    // 🔍 Solo mostrar botón de borrar si es admin o autor
    const puedeBorrar = usuario?.rol === 'admin' || usuario?.correo === v.usuario.correo;

    tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td>${v.titulo}</td>
        <td>${v.usuario.correo}</td>
        <td>${v.fecha}</td>
        <td>${v.descripcion}</td>
        <td>${v.tipo}</td>
        <td>
          ${puedeBorrar ? `
            <button class="btn btn-danger btn-sm borrar" data-id="${v.id}">
              Borrar
            </button>` : `<span class="text-muted">—</span>`}
        </td>
      </tr>`);
  });

  /* — borrar — */
  tbody.querySelectorAll('.borrar').forEach(b =>
    b.onclick = async e => {
      const id = e.target.dataset.id;
      await eliminarVoluntariado(id);
      await cargarTabla();
      dibujarGrafico();
    });
}

// ============================================================== 
// ALTA
// ============================================================== 
async function altaVoluntariado(ev) {
  ev.preventDefault();

  const usr = obtenerUsuarioActivo();
  if (!usr) {
    alert('Debes iniciar sesión para publicar un voluntariado.');
    location.href = 'inicioSesion.html';
    return;
  }

  // Verificar si ya existe un voluntariado con el mismo título y usuario
  const voluntariados = await obtenerVoluntariados();
  const voluntariadoExistente = voluntariados.some(v =>
    v.titulo === titulo.value && v.usuario.correo === usr.correo && v.fecha === fecha.value
  );

  if (voluntariadoExistente) {
    alert('Ya existe un voluntariado con estos datos.');
    return;
  }

  // Si no existe, guardar el nuevo voluntariado
  await guardarVoluntariado({
    titulo: titulo.value,
    usuario: usr.correo,
    fecha: fecha.value,
    descripcion: descripcion.value,
    tipo: tipo.value
  });

  form.reset();
  inpMail.value = usr.correo; // repone el correo
  await cargarTabla();
  dibujarGrafico();
}

/* ============================================================== 
 * GRÁFICO
 * ==============================================================*/
async function dibujarGrafico () {
  const datos = await obtenerVoluntariados();

  const tot = {};                               // { correo: {Petición, Oferta} }
  datos.forEach(v => {
    const mail = v.usuario.correo;
    tot[mail] ??= { Petición: 0, Oferta: 0 };
    tot[mail][v.tipo]++;
  });

  // ---------- canvas ----------
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const users = Object.keys(tot);
  if (!users.length) return;

  const pet = users.map(u => tot[u].Petición);
  const off = users.map(u => tot[u].Oferta);

  const BAR=30,GAP=40,SEP=10,SCALE=30,Y0=canvas.height-50,X0=80;

  users.forEach((u,i) => {
    const x = X0 + i*(BAR*2+GAP) + SEP;
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(x,           Y0-pet[i]*SCALE, BAR, pet[i]*SCALE);
    ctx.fillStyle = '#4d96ff';
    ctx.fillRect(x+BAR+SEP,   Y0-off[i]*SCALE, BAR, off[i]*SCALE);
  });

  // ejes
  ctx.beginPath();
  ctx.moveTo(X0, Y0); ctx.lineTo(X0 + users.length*(BAR*2+GAP), Y0);
  ctx.moveTo(X0, Y0); ctx.lineTo(X0, 20);
  ctx.strokeStyle='#555'; ctx.lineWidth=2; ctx.stroke();

  // etiquetas
  ctx.font="13px Quicksand, sans-serif"; ctx.fillStyle="#000"; ctx.textAlign="center";
  users.forEach((u,i) => {
    const x = X0 + i*(BAR*2+GAP) + BAR + SEP/2;
    ctx.fillText(u, x, Y0+15);
  });
}

/* ============================================================== 
 * INIT
 * ==============================================================*/
document.addEventListener('DOMContentLoaded', async () => {
  const usr = obtenerUsuarioActivo();
  if (usr) inpMail.value = usr.correo;   // autocompleta en el formulario

  await cargarTabla();
  dibujarGrafico();

  form?.addEventListener('submit', altaVoluntariado);
});
