const Usuarios = require('../models/Usuarios')
const enviarEmail = require('../handlers/email')

exports.formCrearCuenta = (req, res) => {
    res.render('crearCuenta', {
        nombrePagina: 'Crear Usuario en UpTask'
    })
}

exports.formIniciarSesion = (req, res) => {
    const { error } = res.locals.mensajes;
    res.render('iniciarSesion', {
        nombrePagina: 'Iniciar Sesión en UpTask',
        error
    })
}

exports.crearCuenta = async (req, res) => {
    //leer los datos
    const { email, password } = req.body

    try {
        //crear el usuario
        await Usuarios.create({
            email,
            password
        })

        // crear una URL de confirmar
        const confirmarUrl = `http://${req.headers.host}/confirmar/${email}`

        // crear el objeto de usuario
        const usuario = {
            email
        }

        // enviar el mail
        await enviarEmail.enviar({
            usuario,
            subject: 'Confirma tu Cuenta UpTask',
            confirmarUrl,
            archivo: 'confirmar-cuenta'
        })

        // redirigir al usuario
        req.flash('confirmar', 'Te enviamos un correo, confirma tu cuenta')
        res.redirect('/iniciar-sesion')
    } catch (error) {
        req.flash('error',error.errors.map(error => error.message) )
        res.render('crearCuenta', {
            nombrePagina: 'Crear Usuario en UpTask',
            mensajes: req.flash(),
            email,
            password
        })
    }
    
}

exports.formReestablecerPassword = (req, res) => {
    res.render('reestablecer', {
        nombrePagina: 'Reestablecer tu Contraseña',
        
    })
}

//cambia el estado de una cuenta
exports.confirmarCuenta = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            email: req.params.correo
        }
    })

    // si no existe el usuario
    if(!usuario) {
        req.flash('error', 'No valido')
        res.redirect('/crear-cuenta')
    }

    usuario.activo = 1
    await usuario.save()

    req.flash('correcto', 'Cuenta activada correctamente')
    res.redirect('/iniciar-sesion')
}