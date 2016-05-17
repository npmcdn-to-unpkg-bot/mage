var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usuarioSchema = new Schema({
    nome: { type: String, required: true },
    login: { type: String, required: true },
    senha: { type: String, required: true },
    email: { type: String, required: true },
    oraculos: [],
    perfil: { type: String, required: true }
});

var Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario; 