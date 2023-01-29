const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuarios = require('../models/Usuarios');

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, next) => {
            const usuario = await Usuarios
                .findOne({
                    where: {
                        email,
                        activo: 1
                    }
                });
            if (!usuario) return next(null, false, {
                message: 'Ese usuario no existe, o no has confirmado tu cuenta'
            });

            const verificarPassword = usuario.validarPassword(password);

            if (!verificarPassword) return next(null, false, {
                message: 'Password incorrecto'
            });

            return next(null, usuario);
        }
    )
);

passport.serializeUser(function (usuario, callback) {
    callback(null, usuario);
});

passport.deserializeUser(function (usuario, callback) {
    callback(null, usuario);
});

module.exports = passport;