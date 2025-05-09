import { gql } from './apiGraphQL.js';

/* ---------- USUARIOS ---------- */
export async function obtenerUsuarios() {
  const q = `query { obtenerUsuarios { id nombre correo password } }`;
  const { obtenerUsuarios } = await gql(q);
  return obtenerUsuarios;
}

export async function guardarUsuario(u) {
  const m = `mutation($n:String!,$c:String!,$p:String!){
               crearUsuario(nombre:$n, correo:$c, password:$p){ id } }`;
  try {
    await gql(m, { n: u.nombre, c: u.correo, p: u.password });
    return true;
  } catch (e) {
    if (e.message.includes('Correo ya registrado')) return false;
    throw e;
  }
}

export async function eliminarUsuario(correo) {
  const m = `mutation($c:String!){ eliminarUsuario(correo:$c) }`;
  const { eliminarUsuario } = await gql(m, { c: correo });
  return eliminarUsuario;
}

/* ---------- VOLUNTARIADOS ---------- */
export async function obtenerVoluntariados() {
  const q = /* lenguaje graphql */ `
    query {
      obtenerVoluntariados {
        id
        titulo
        usuario {
          correo
          nombre
        }
        fecha
        descripcion
        tipo
      }
    }
  `;
  // ← PASA q, no {query: q}
  const { obtenerVoluntariados } = await gql(q);
  return obtenerVoluntariados;
}

export async function guardarVoluntariado(v) {
  const m = /* lenguaje graphql */ `
    mutation($t: String!, $u: String!, $f: String!, $d: String!, $tp: String!) {
      crearVoluntariado(
        titulo:      $t,
        usuario:     $u,
        fecha:       $f,
        descripcion: $d,
        tipo:        $tp
      ) {
        id
      }
    }
  `;
  await gql(m, {
    t:  v.titulo,
    u:  v.usuario,
    f:  v.fecha,
    d:  v.descripcion,
    tp: v.tipo
  });
}

export async function eliminarVoluntariado(id) {
  const m = /* lenguaje graphql */ `
    mutation($id: ID!) {
      eliminarVoluntariado(id: $id)
    }
  `;
  const { eliminarVoluntariado } = await gql(m, { id });
  return eliminarVoluntariado;
}

/* ---------- SESIÓN (localStorage) ---------- */
export async function loguearUsuario(correo, password) {
  const m = `mutation($c:String!, $p:String!) {
               login(correo: $c, password: $p) {
                 id
                 nombre
                 correo
                 rol
               }
             }`;
  const { login } = await gql(m, { c: correo, p: password });

  if (login) {
    localStorage.setItem('usuarioActivo', JSON.stringify(login));
    return true;
  }

  return false;
}


export const obtenerUsuarioActivo = () =>
  JSON.parse(localStorage.getItem('usuarioActivo') || 'null');

export const cerrarSesion = () => localStorage.removeItem('usuarioActivo');
