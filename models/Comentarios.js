const sequelize = require('sequelize');
const db = require('../config/db');
const Usuarios = require('./Usuarios');
const Meeti = require('./Meeti');

const Comentarios = db.define('comentario', {
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mensaje: sequelize.TEXT
},{
    timestamps: false,
});

Comentarios.belongsTo(Usuarios);
Comentarios.belongsTo(Meeti);

module.exports = Comentarios;


