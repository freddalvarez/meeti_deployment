const sequelize = require('sequelize');
const db = require('../config/db');
const slug = require('slug');

const Categorias = db.define('categorias', {
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: sequelize.TEXT,
    slug: sequelize.TEXT
},{
    timeStamps: false,
});

module.exports = Categorias;
