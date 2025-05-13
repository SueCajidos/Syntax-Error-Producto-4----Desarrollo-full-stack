const ENDPOINT = 'http://localhost:4000/graphql';

/**
 * Envía una consulta o mutación GraphQL y devuelve solo `data`.
 * Lanza Error si el servidor responde con `errors`.
 */
export async function gql(query, variables = {}) {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  const token = usuario?.token;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })  // 👈 AÑADE el token si existe
  };

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables })
  });

  const { data, errors } = await res.json();
  if (errors) throw new Error(errors.map(e => e.message).join(' | '));
  return data;
}

