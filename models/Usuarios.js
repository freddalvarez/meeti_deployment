const sequelize = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcrypt-nodejs');

const Usuarios = db.define('usuarios', {
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: sequelize.STRING(60),
    imagen: sequelize.STRING(60),
    descripcion: {
        type: sequelize.TEXT
    },
    email: {
        type: sequelize.STRING(60),
        allowNull: false,
        validate: {
            isEmail: {
                msg: 'Agrega un correo válido'
            },
            notEmpty: {
                msg: 'El correo no puede ir vacío'
            }
        },
        unique: {
            args: true,
            msg: 'Usuario ya registrado'
        }
    },
    password: {
        type: sequelize.STRING(60),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El password no puede ir vacío'
            }
        }
    },
    activo: {
        type: sequelize.INTEGER(1),
        defaultValue: 0
    },
    tokenPassword: sequelize.STRING,
    expiraToken: sequelize.DATE
}, {
    hooks: {
        beforeCreate(usuario) {
            usuario.password = Usuarios.prototype.hashPassword(usuario.password);
        }
    }
});

Usuarios.prototype.validarPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

Usuarios.prototype.hashPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

module.exports = Usuarios;