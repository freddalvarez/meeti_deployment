const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');
const Categorias = require('../../models/Categorias');
const Comentarios = require('../../models/Comentarios');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.mostrarMeeti = async (req, res) => {
    const meeti = await Meeti.findOne({
        where: {
            slug: req.params.slug
        },
        include: [
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    })

    if(!meeti) {
        res.redirect('/');
        
    }

    const ubicacion = Sequelize.literal(`ST_GeomFromText('POINT(${meeti.ubicacion.coordinates[0]} ${meeti.ubicacion.coordinates[1]})')`);

    const distancia = Sequelize.fn('ST_DistanceSphere', Sequelize.col('ubicacion'), ubicacion);

    const cercanos = await Meeti.findAll({
        order: distancia,
        where: Sequelize.where(distancia, { [Op.lte]: 2000 }),
        limit: 3,
        offset: 1,
        include: [
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    })

    const comentarios = await Comentarios.findAll({
        where: {
            meetiId: meeti.id
        },
        include: [
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    })

    res.render('mostrar-meeti', {
        nombrePagina: `Información del Meeti: ${meeti.titulo}`,
        meeti,
        moment,
        comentarios,
        cercanos
    })
}

exports.confirmarAsistencia = async (req, res, next) => {

    const {accion} = req.body;

    if(accion === 'confirmar') {
        Meeti.update(
            {'interesados': Sequelize.fn('array_append', Sequelize.col('interesados'), req.user.id)},
            {where: {'slug': req.params.slug}}
        )

        res.send('Has confirmado tu asistencia');

    } else {
        Meeti.update(
            {'interesados': Sequelize.fn('array_remove', Sequelize.col('interesados'), req.user.id)},
            {where: {'slug': req.params.slug}}
        )

        res.send('Has cancelado tu asistencia');
    }
}

exports.mostrarAsistentes = async (req, res, next) => {
    const meeti = await Meeti.findOne({
        where: {
            slug: req.params.slug
        },
        attributes: ['interesados']
    })

    const {interesados} = meeti;

    const asistentes = await Usuarios.findAll({
        attributes: ['nombre', 'imagen'],
        where: {
            id: interesados
        }
    })

    res.render('asistentes-meeti', {
        nombrePagina: 'Listado de Asistentes Meeti',
        asistentes
    })
}

exports.mostrarCategoria = async (req, res, next) => {
    const categoria = await Categorias.findOne({
        where: {
            slug: req.params.categoria
        },
        attributes: ['id', 'nombre']
    })

    const meetis = await Meeti.findAll({
        order : [
            ['fecha', 'ASC'],
            ['hora', 'ASC']
        ],
        include: [
            {
                model: Grupos,
                where: {
                    categoriaId: categoria.id
                
                }
            },
            {
                model: Usuarios
            }
        ],
    })

    res.render('categoria', {
        nombrePagina: `Categoria: ${categoria.nombre}`,
        meetis,
        moment
    })
}
