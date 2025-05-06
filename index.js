// index.js

// ---------------------
// IMPORTACIONES BÁSICAS
// ---------------------
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const cors = require('cors'); // Para evitar problemas CORS

// -----------------------------
// IMPORTAMOS LOS MODELOS (MEMORIA)
// -----------------------------
const Usuario = require('./mvc/modelo/Usuario');
const Voluntariado = require('./mvc/modelo/Voluntariado');

// Estructuras de memoria para simular la persistencia
const usuarios = [];
const voluntariados = [];
// ---------------------
// CONEXIÓN A MONGODB
// ---------------------
const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
let db;

client.connect()
  .then(() => {
    db = client.db('producto3');
    console.log(" Conectado a MongoDB - Base de datos: producto3");
  })
  .catch(err => console.error(" Error al conectar a MongoDB:", err));
// -----------------------------
// DEFINIMOS EL ESQUEMA GRAPHQL
// -----------------------------
const schema = buildSchema(`

  # Tipos de datos
  type Usuario {
    nombre: String
    correo: String
    password: String
  }

  type Voluntariado {
    id: ID
    titulo: String
    usuario: String
    fecha: String
    descripcion: String
    tipo: String
  }

  # Consultas
  type Query {
    obtenerUsuarios: [Usuario]
    obtenerVoluntariados: [Voluntariado]
  }

  # Mutaciones
  type Mutation {
    crearUsuario(nombre: String!, correo: String!, password: String!): Usuario
    eliminarUsuario(correo: String!): Boolean

    crearVoluntariado(id: ID!, titulo: String!, usuario: String!, fecha: String!, descripcion: String!, tipo: String!): Voluntariado
    eliminarVoluntariado(id: ID!): Boolean
  }
`);

// -----------------------------
// DEFINIMOS LOS RESOLVERS
// -----------------------------
const root = {
  // ----------- USUARIOS -----------
  obtenerUsuarios: async () => {
    const coleccion = db.collection('usuarios');
    const resultado = await coleccion.find().toArray();
    return resultado;

    /*
    return usuarios;
    */
  },

  crearUsuario: async ({ nombre, correo, password }) => {
    const coleccion = db.collection('usuarios');
    const existe = await coleccion.findOne({ correo: correo });
    if (existe) {
      throw new Error("Correo ya registrado");
    }
    const nuevo = { nombre, correo, password };
    await coleccion.insertOne(nuevo);
    return nuevo;

    /*
    if (usuarios.find(u => u.correo === correo)) {
      throw new Error("Correo ya registrado");
    }
    const nuevo = new Usuario(nombre, correo, password);
    usuarios.push(nuevo);
    return nuevo;
    */
  },

  eliminarUsuario: async ({ correo }) => {
    const coleccion = db.collection('usuarios');
    const resultado = await coleccion.deleteOne({ correo: correo });
    return resultado.deletedCount > 0;

    /*
    const index = usuarios.findIndex(u => u.correo === correo);
    if (index === -1) return false;
    usuarios.splice(index, 1);
    return true;
    */
  },

  // ----------- VOLUNTARIADOS -----------
  obtenerVoluntariados: async () => {
    const coleccion = db.collection('voluntariados');
    const resultado = await coleccion.find().toArray();
    return resultado;

    /*
    return voluntariados;
    */
  },

  crearVoluntariado: async ({ id, titulo, usuario, fecha, descripcion, tipo }) => {
    const coleccion = db.collection('voluntariados');
    const nuevo = { id, titulo, usuario, fecha, descripcion, tipo };
    await coleccion.insertOne(nuevo);
    return nuevo;

    /*
    const nuevo = new Voluntariado(id, titulo, usuario, fecha, descripcion, tipo);
    voluntariados.push(nuevo);
    return nuevo;
    */
  },

  eliminarVoluntariado: async ({ id }) => {
    const coleccion = db.collection('voluntariados');
    const resultado = await coleccion.deleteOne({ id: id });
    return resultado.deletedCount > 0;

    /*
    const index = voluntariados.findIndex(v => v.id == id);
    if (index === -1) return false;
    voluntariados.splice(index, 1);
    return true;
    */
  }
};

// -----------------------------
// CONFIGURACIÓN DEL SERVIDOR
// -----------------------------
const app = express();
app.use(cors());

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/graphql`);
});
