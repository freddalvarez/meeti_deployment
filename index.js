const express = require('express');
require('dotenv').config({ path: 'variables.env' });
const router = require('./routes');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const db = require('./config/db');
require('./models/Usuarios');
require('./models/Categorias');
require('./models/Grupos');
require('./models/Meeti');
require('./models/Comentarios');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');


db.sync().then(() => console.log('DB connected')).catch(error => console.log(error))

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(expressLayouts);

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, './views'));

app.use(express.static('public'));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    res.locals.usuario = {...req.user} || null;
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    next();
});

app.use('/', router());

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

app.listen(port, host,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})
