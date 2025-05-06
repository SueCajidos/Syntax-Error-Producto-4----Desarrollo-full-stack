const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'producto3';

let db;

async function conectarMongo() {
  if (!db) {
    const cliente = new MongoClient(url);
    await cliente.connect();
    db = cliente.db(dbName);
  }
  return db;
}

module.exports = conectarMongo;
