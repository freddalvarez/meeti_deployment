const Meeti = require('../../models/Meeti.js');
const Grupos = require('../../models/Grupos.js');
const Usuarios = require('../../models/Usuarios.js');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');

exports.resultadosBusqueda = async (req, res, next) => {
    const { categoria,titulo, ciudad } = req.query;

    let query

    if(!categoria) {
        query = '';
    } else {
        query = `where: {
            categoriaId: {
                [Op.eq]: ${categoria}
            }
        }`
    }

    const meetis = await Meeti.findAll({
        where: {
            titulo: {
                [Op.iLike]: '%' + titulo + '%'
            },
            ciudad: {
                [Op.iLike]: '%' + ciudad + '%'
            }
        },
        include: [
            {
                model: Grupos,
                query
            },
            {
                model: Usuarios,
                attributes: ['id','nombre','imagen']
            }
        ]
    });

    res.render('busqueda', {
        nombrePagina: 'Resultados de la búsqueda',
        meetis,
        moment
    });
}