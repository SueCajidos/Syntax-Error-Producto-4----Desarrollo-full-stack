export function mostrarMenuLogin() {
    const navUsuario = document.getElementById("navUsuario");
    navUsuario.innerHTML = `<a href="inicioSesion.html">Login</a>`;
  }
  
  export function mostrarMenuUsuario(correo) {
    const navUsuario = document.getElementById("navUsuario");
    navUsuario.innerHTML = `
      <a href="#">${correo}</a>
      <a href="#" id="cerrarSesion">(Cerrar sesión)</a>
    `;
  }
  