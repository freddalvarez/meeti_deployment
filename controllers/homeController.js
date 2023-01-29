const Categorias = require('../models/Categorias');
const Meeti = require('../models/Meeti');
const Grupos = require('../models/Grupos');
const Usuarios = require('../models/Usuarios');
const moment = require('moment');
const sequelize = require('sequelize');
const Op = sequelize.Op;

exports.home = async (req, res) => {

    const consultas = [];
    consultas.push(Categorias.findAll());
    consultas.push(Meeti.findAll({
        atributtes: ['slug','titulo','invitado','fecha','hora'],
        where: {
            fecha: {
                [Op.gte]: moment(new Date()).format('YYYY-MM-DD')
            }
        },
        limit: 3,
        order: [
            ['fecha', 'ASC']
        ],
        include: [
            {
                model: Grupos,
                atributtes: ['imagen']
            },
            {
                model: Usuarios,
                atributtes: ['nombre','imagen']
            }
        ]
    }));

    const [categorias,meetis] = await Promise.all(consultas)

    res.render('home', {
        nombrePagina: 'Inicio',
        categorias,
        meetis,
        moment
    });
}