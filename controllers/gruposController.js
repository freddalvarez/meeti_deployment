const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');

const multer = require('multer');
const shortid = require('shortid');
const uuid = require('uuid').v4;
const fs = require('fs');

const configuracionMulter = {
    limits: { fileSize: 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname+'/../public/uploads/grupos/');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Formato no válido'), false);
        }
    }
}


const upload = multer(configuracionMulter).single('imagen');


exports.subirImagen = (req, res, next) => {
    
        upload(req, res, function(error) {
            if (error) {
                if (error instanceof multer.MulterError) {
                    if (error.code === 'LIMIT_FILE_SIZE') {
                        req.flash('error', 'El archivo es muy grande: Máximo 100kb');
                    } else {
                        req.flash('error', error.message);
                    }
                } else if (error.hasOwnProperty('message')) {
                    req.flash('error', error.message);
                }
                res.redirect('back');
                return;
            } else {
                return next();
            }
        });
}

exports.formNuevoGrupo = async(req, res) => {

    const categorias = await Categorias.findAll();


    res.render('nuevo-grupo', {
        nombrePagina: 'Crea un nuevo grupo',
        categorias
    });
}

exports.crearGrupo = async(req, res) => {


    const grupo = req.body;
    grupo.usuarioId = req.user.id;
    if(req.file) {
        grupo.imagen = req.file.filename;
    }

    grupo.id = uuid();

    try {
        console.log(grupo);
        await Grupos.create(grupo);
        req.flash('exito', 'Se ha creado el grupo correctamente');
        res.redirect('/administracion');
    } catch (error) {
        console.log(error);
        
        const erroresSequelize = error.errors.map(err => err.message);

        if (erroresSequelize.length > 0) {
            req.flash('error', erroresSequelize);
            res.redirect('/nuevo-grupo');
        }
    }
}

exports.formEditarGrupo = async(req, res, next) => {

    const consultas = [];
    consultas.push(Grupos.findByPk(req.params.grupoId));
    consultas.push(Categorias.findAll());

    const [grupo, categorias] = await Promise.all(consultas);

    res.render('editar-grupo', {
        nombrePagina: `Editar Grupo: ${grupo.nombre}`,
        grupo,
        categorias
    });
}

exports.editarGrupo = async(req, res, next) => {
    
        const grupo = await Grupos.findOne({where: {id: req.params.grupoId, usuarioId: req.user.id}});
    
        if(!grupo) {
            req.flash('error', 'Operación no válida');
            res.redirect('/administracion');
            return next();
        }
    
        const { nombre, descripcion, categoriaId, url } = req.body;
    
        grupo.nombre = nombre;
        grupo.descripcion = descripcion;
        grupo.categoriaId = categoriaId;
        grupo.url = url;
    
        await grupo.save();
        req.flash('exito', 'Cambios guardados correctamente');
        res.redirect('/administracion');
}

exports.formEditarImagen = async(req, res, next) => {

    const grupo = await Grupos.findOne({where: {id: req.params.grupoId, usuarioId: req.user.id}});

    if(!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    res.render('imagen-grupo', {
        nombrePagina: `Editar Imagen Grupo: ${grupo.nombre}`,
        grupo
    });
}

exports.editarImagen = async(req, res, next) => {
        
    const grupo = await Grupos.findOne({where: {id: req.params.grupoId, usuarioId: req.user.id}});
    
    if(!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }
    if(req.file && grupo.imagen) {
        const imagenAnteriorPath = __dirname+`/../public/uploads/grupos/${grupo.imagen}`;
        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error);
                return;
            }
        });
    }

    if(req.file) {
        grupo.imagen = req.file.filename;
    }
    await grupo.save();
    req.flash('exito', 'Imagen subida correctamente');
    res.redirect('/administracion');
}

exports.formEliminarGrupo = async(req, res, next) => {

    const grupo = await Grupos.findOne({where: {id: req.params.grupoId, usuarioId: req.user.id}});

    if(!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    res.render('eliminar-grupo', {
        nombrePagina: `Eliminar Grupo: ${grupo.nombre}`,
        grupo
    });
}

exports.eliminarGrupo = async(req, res, next) => {
        
    const grupo = await Grupos.findOne({where: {id: req.params.grupoId, usuarioId: req.user.id}});
    
    if(!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    if(grupo.imagen) {
        const imagenAnteriorPath = __dirname+`/../public/uploads/grupos/${grupo.imagen}`;
        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error);
                return;
            }
        });
    }

    await Grupos.destroy({where: {id: req.params.grupoId}});
    req.flash('exito', 'Grupo eliminado correctamente');
    res.redirect('/administracion');
}