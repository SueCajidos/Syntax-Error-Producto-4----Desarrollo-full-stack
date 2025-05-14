// ---------------- CONFIG BÁSICA ----------------
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./server/config/db');
const authMiddleware = require('./server/middleware/auth');
const Usuario = require('./server/models/Usuario');
const Voluntariado = require('./server/models/Voluntariado');

connectDB();

const app = express();
app.use(cors());
app.use(authMiddleware);

// ---------------- ESQUEMA ----------------------
const schema = buildSchema(`
  type Usuario {
    id: ID!
    nombre: String!
    correo: String!
    password: String!
    rol: String!
    seleccionVoluntariados: [String]
    token: String
  }

  type Voluntariado {
    id: ID!
    titulo: String!
    usuario: Usuario!
    fecha: String!
    descripcion: String
    tipo: String!
  }

  type Query {
    obtenerUsuarios: [Usuario]
    obtenerVoluntariados: [Voluntariado]
    obtenerSeleccion(usuarioId: ID!): [String]
  }

  type Mutation {
    crearUsuario(nombre:String!, correo:String!, password:String!, rol:String): Usuario
    eliminarUsuario(correo:String!): Boolean
    login(correo:String!, password:String!): Usuario
    crearVoluntariado(
      titulo:String!, usuario:String!,
      fecha:String!,  descripcion:String!, tipo:String!
    ): Voluntariado
    eliminarVoluntariado(id:ID!): Boolean
    guardarSeleccion(usuarioId: ID!, voluntariados: [String]!): String
  }
`);

// ---------------- RESOLVERS --------------------
const root = {
  /* --- USUARIOS --- */

  obtenerSeleccion: async ({ usuarioId }) => {
    const usuario = await Usuario.findById(usuarioId);
    return usuario?.seleccionVoluntariados || [];
  },

  obtenerUsuarios: async (args, req) => {
  if (!req.user) {
    throw new Error("No autenticado");
  }

  if (req.user.rol !== "admin") {
    throw new Error("Acceso denegado: solo el administrador puede ver los usuarios");
  }

  return (await Usuario.find()).map(u => ({
    id: u._id.toString(),
    ...u.toObject()
  }));
},

  crearUsuario: async ({ nombre, correo, password, rol }) => {
    if (await Usuario.exists({ correo })) throw new Error('Correo ya registrado');

    const doc = await Usuario.create({ nombre, correo, password, rol });
    console.log('👍 insertado →', doc);               // ← lo verás en consola
    return { id: doc._id.toString(), ...doc.toObject() };
  },

  guardarSeleccion: async ({ usuarioId, voluntariados }) => {
    await Usuario.findByIdAndUpdate(usuarioId, {
      seleccionVoluntariados: voluntariados
    });
    return 'Selección guardada';
  },

  eliminarUsuario: async ({ correo }, req) => {
  if (!req.user || req.user.rol !== 'admin') {
    throw new Error('Solo el administrador puede eliminar usuarios');
  }

  return (await Usuario.deleteOne({ correo })).deletedCount > 0;
},

login: async ({ correo, password }) => {
  const usr = await Usuario.findOne({ correo });
  if (!usr || usr.password !== password) return null;

  const token = jwt.sign(
    {
      id: usr._id.toString(),
      correo: usr.correo,
      rol: usr.rol
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  return {
    id: usr._id.toString(),
    nombre: usr.nombre,
    correo: usr.correo,
    rol: usr.rol,
    token 
  };
},

  /* --- VOLUNTARIADOS --- */
    obtenerVoluntariados: async (args, req) => {
    if (!req.user) throw new Error('No autenticado');

    const filtro = req.user.rol === 'admin'
      ? {}
      : { usuario: req.user.id };

    const vol = await Voluntariado.find(filtro).populate('usuario', 'nombre correo');

    return vol.map(v => ({
      id: v.id,
      titulo: v.titulo,
      usuario: v.usuario,
      fecha: v.fecha.toISOString().slice(0, 10),
      descripcion: v.descripcion,
      tipo: v.tipo
    }));
  },

  crearVoluntariado: async ({ titulo, usuario, fecha, descripcion, tipo }, req) => {
    console.log('📥 Datos recibidos:', { titulo, usuario, fecha, descripcion, tipo });

    const autor = await Usuario.findOne({ correo: usuario });
    if (!autor) {
      console.warn('❌ Usuario no encontrado con correo:', usuario);
      throw new Error('Usuario no existe');
    }

    console.log('👤 Usuario encontrado:', autor._id);

    const doc = await Voluntariado.create({
      titulo,
      usuario: autor._id,
      fecha,
      descripcion,
      tipo
    });

    console.log('✅ Voluntariado guardado:', doc);

    // ✅ ENVÍO SOCKET desde el servidor
    const io = req?.app?.get('io');
    if (io) {
      io.emit('voluntariado-actualizado', {
        id: doc._id.toString(),
        titulo,
        usuario: { correo: autor.correo },
        fecha,
        descripcion,
        tipo
      });
      console.log('📡 Emitido "voluntariado-actualizado" desde el servidor');
    }

    return {
      id: doc.id,
      titulo,
      usuario: autor,
      fecha,
      descripcion,
      tipo
    };
  },

  eliminarVoluntariado: async ({ id }) =>
    (await Voluntariado.deleteOne({ _id: id })).deletedCount > 0
};

// ---------------- SERVER + SOCKET -----------------------

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado vía WebSocket');

  socket.on('nuevo-voluntariado', (data) => {
    console.log('📦 Nuevo voluntariado recibido:', data);
    io.emit('voluntariado-actualizado', data);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado');
  });
});

// ---------------- GRAPHQL -----------------------

app.use('/graphql', graphqlHTTP((req) => ({
  schema,
  rootValue: root,
  graphiql: true,
  context: req
})));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor con WebSocket y GraphQL listo → http://localhost:${PORT}/graphql`);
});
