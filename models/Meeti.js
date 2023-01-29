const sequelize = require('sequelize');
const db = require('../config/db');
const uuid = require('uuid').v4;
const slug = require('slug');
const shortid = require('shortid');
const Usuarios = require('../models/Usuarios');
const Grupos = require('../models/Grupos');

const Meeti = db.define('meeti', {
    id: {
        type: sequelize.UUID,
        primaryKey: true,
        allowNull: false
    },
    titulo: {
        type: sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Agrega un título al Meeti'
            }
        }
    },
    slug: sequelize.STRING,
    invitado: sequelize.STRING(60),
    cupo: {
        type: sequelize.INTEGER,
        defaultValue: 0
    },
    descripcion: {
        type: sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Agrega una descripción al Meeti'
            }
        }
    },
    fecha: {
        type: sequelize.DATEONLY,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Agrega una fecha al Meeti'
            }
        }
    },
    hora: {
        type: sequelize.TIME,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Agrega una hora al Meeti'
            }
        }
    },
    direccion: {
        type: sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Agrega una dirección al Meeti'
            }
        }
    },
    ciudad: {
        type: sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Agrega una ciudad al Meeti'
            }
        }
    },
    estado: {
        type: sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Agrega un estado al Meeti'
            }
        }
    },
    pais: {
        type: sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Agrega un país al Meeti'
            }
        }
    },
    ubicacion: {
        type: sequelize.GEOMETRY('POINT')
    },
    interesados : {
        type: sequelize.ARRAY(sequelize.INTEGER),
        defaultValue: []
    }
    }, {
        hooks: {
            async beforeCreate(meeti) {
                const url = slug(meeti.titulo).toLowerCase();
                meeti.slug = `${url}-${shortid.generate()}`;
            }
        }
});


Meeti.belongsTo(Usuarios);
Meeti.belongsTo(Grupos);

module.exports = Meeti;



