const Usuarios = require('../models/Usuarios');
const { validationResult, body } = require('express-validator');
const enviarEmail = require('../handlers/emails');

const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

const configuracionMulter = {
    limits: { fileSize: 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname+'/../public/uploads/perfiles/');
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

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea Tu Cuenta'
    });
}

exports.crearNuevaCuenta = async (req, res) => {
    const usuario = req.body;
    
    const rules = [
        body('confirmar').notEmpty().withMessage('El password confirmado no puede ir vacio'),
        body('confirmar').equals(req.body.password).withMessage('Los passwords no coinciden')
    ];

    await Promise.all(rules.map(validation => validation.run(req)));

    const erroresExpress = validationResult(req);

    try {
        await Usuarios.create(usuario);

        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

        await enviarEmail.enviarEmail({
            usuario,
            subject: 'Confirma tu cuenta en Meeti',
            url,
            archivo: 'confirmar-cuenta'
        });
        
        req.flash('exito', 'Hemos enviado un correo de confirmación a tu correo');
        res.redirect('/iniciar-sesion');
    }
    catch(error) {
        console.log(error);

        let erroresSequelize = [];

        if (error.name === 'SequelizeUniqueConstraintError'){
            erroresSequelize.push('El correo ya está registrado');
        }   else {
            erroresSequelize = error.errors.map(err => err.message);
        }       

        const errExp = erroresExpress.array().map(err => err.msg);

        const todosLosErrores = [...erroresSequelize, ...errExp];

    if (todosLosErrores.length > 0) {
        req.flash('error', todosLosErrores);
        res.redirect('crear-cuenta')
    }
    }
}

exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesión'
    });
}

exports.confirmarCuenta = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            email: req.params.correo
        }
    });

    if (!usuario) {
        req.flash('error', 'No existe esa cuenta');
        res.redirect('/crear-cuenta');
        return next();
    }

    usuario.activo = 1;
    await usuario.save();

    req.flash('exito', 'Cuenta activada correctamente');
    res.redirect('/iniciar-sesion');
}

exports.formEditarPerfil = async (req, res) => {

    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('editar-perfil', {
        nombrePagina: 'Edita tu perfil',
        usuario
    });
}

exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    const { nombre, descripcion, email } = req.body;

    usuario.nombre = nombre;
    usuario.descripcion = descripcion;
    usuario.email = email;

    await usuario.save();

    req.flash('exito', 'Cambios guardados correctamente');
    res.redirect('/administracion');
}

exports.formCambiarPassword = (req, res) => {
    res.render('cambiar-password', {
        nombrePagina: 'Cambiar Password'
    });
}

exports.cambiarPassword = async (req, res, next) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    const { passwordAnterior, nuevo, repetir } = req.body;

    const verificarPassword = usuario.validarPassword(passwordAnterior);

    if (!verificarPassword) {
        req.flash('error', 'Password actual incorrecto');
        res.redirect('/administracion');
        return next();
    }

    if (nuevo !== repetir) {
        req.flash('error', 'Los passwords no coinciden');
        res.redirect('/administracion');
        return next();
    }

    const hash = usuario.hashPassword(nuevo);

    usuario.password = hash;
    await usuario.save();
    
    req.flash('exito', 'Password cambiado correctamente');
    res.redirect('/administracion');
    
}

exports.formSubirImagenPerfil = async (req, res) => {

    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('imagen-perfil', {
        nombrePagina: 'Sube tu imagen de perfil',
        usuario
    });
}

exports.guardarImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    if(req.file && usuario.imagen) {
        const imagenAnteriorPath = __dirname+`/../public/uploads/perfiles/${usuario.imagen}`;
        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error);
                return;
            }
        });
    }

    if (req.file) {
        usuario.imagen = req.file.filename;
    }

    await usuario.save();

    req.flash('exito', 'Imagen guardada correctamente');
    res.redirect('/administracion');
}



