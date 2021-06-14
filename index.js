const express = require('express')
const routes = require('./routes')
const path = require('path')
const bodyParser = require('body-parser')
const helpers = require('./helpers')
const flash = require('connect-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const passport = require('./config/passport')
//extraer valores de variables.env
require('dotenv').config({ path: 'variables.env'})

//crear la conexion a la base de datos
const db = require('./config/db')

// importar el modelo
require('./models/Proyectos')
require('./models/Tareas')
require('./models/Usuarios')

db.sync()
    .then(() => console.log('Conectado al servidor'))
    .catch(error => console.log(error))

//crea la app
const app = express()

// donde cargar los archivos estaticos
app.use(express.static('public'))

// Habilitar pug
app.set('view engine', 'pug')

// Habilitar BodyParser para leer datos de formulario
app.use(bodyParser.urlencoded({extended:true}))


// Añadir carpeta de las vistas
app.set('views', path.join(__dirname, './views'))

// agregar flash messages
app.use(flash())

//cookie parser
app.use(cookieParser())

// sessiones nos permiten navegar entre distintas paginas sin volvernos a autenticar
app.use(session({
    secret: 'clavesecreta',
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

//importar helpers
app.use((req, res, next) => {
    res.locals.vardump = helpers.vardump
    res.locals.mensajes = req.flash()
    res.locals.usuario = {...req.user} || null
    next()
})


app.use('/', routes())

// servidor y puerto
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 3000

app.listen(port, host, () => {
    console.log('El servidor esta LISTO!');
})
