const Proyectos = require('../models/Proyectos')
const Tareas = require('../models/Tareas')

exports.proyectosHome = async (req, res) => {
    // console.log(res.locals.usuario);
    const usuarioId = res.locals.usuario.id
    const proyectos = await Proyectos.findAll({where:{usuarioId}})

    res.render('index', {
        nombrePagina: 'Proyectos',
        proyectos
    })
}

exports.formularioProyecto = async (req, res) => {
    const usuarioId = res.locals.usuario.id
    const proyectos = await Proyectos.findAll({where:{usuarioId}})
    res.render('nuevoProyecto', {
        nombrePagina: 'Nuevo Proyecto',
        proyectos
    })
}

exports.nuevoProyecto = async (req, res) => {
    const usuarioId = res.locals.usuario.id
    const proyectos = await Proyectos.findAll({where:{usuarioId}})

    //validar que tengamos algo en el input
    const {nombre} = req.body
    let errores = []
    
    if(!nombre) {
        // console.log('!nombre')
        errores.push({'text':'Agrega un nombre al Proyecto'})
    }

    // si hay errores
    if(errores.length > 0) {
        // console.log('errores.length > 0')
        res.render('nuevoProyecto', {
            nombrePagina: 'Nuevo Proyecto',
            errores,
            proyectos
        })
    } else {
        //no hay errores
        // insertar en la BD
        const usuarioId = res.locals.usuario.id
        const proyecto = await Proyectos.create({ nombre, usuarioId })
        res.redirect('/')
    }
}

exports.proyectoPorUrl = async (req, res, next) => {
    const usuarioId = res.locals.usuario.id
    const proyectosPromise = Proyectos.findAll({where:{usuarioId}})
    const proyectoPromise = Proyectos.findOne({
        where: {
            url: req.params.url,
            usuarioId
        }
    })

    const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise])

    // Consultar tareas del proyecto actual
    const tareas = await Tareas.findAll({
        where: {
            proyectoId: proyecto.id
        },
        // include: [
        //     { model: Proyectos}
        // ]
    })
    
    
    if(!proyecto) return next()

    

    res.render('tareas', {
        nombrePagina: 'Tareas del Proyecto',
        proyecto,
        proyectos,
        tareas
    })
}

exports.editarProyecto = async (req, res) => {
    const usuarioId = res.locals.usuario.id
    const proyectosPromise = Proyectos.findAll({where:{usuarioId}})
    const proyectoPromise = Proyectos.findOne({
        where: {
            id: req.params.id,
            usuarioId
        }
    })

    const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise])


    res.render('nuevoProyecto', {
        nombrePagina: 'Editar proyecto',
        proyectos,
        proyecto
    })
}

exports.actualizarProyecto = async (req, res) => {
    const usuarioId = res.locals.usuario.id
    const proyectos = await Proyectos.findAll({where:{usuarioId}})

    //validar que tengamos algo en el input
    const {nombre} = req.body
    let errores = []
    
    if(!nombre) {
        // console.log('!nombre')
        errores.push({'text':'Agrega un nombre al Proyecto'})
    }

    // si hay errores
    if(errores.length > 0) {
        // console.log('errores.length > 0')
        res.render('nuevoProyecto', {
            nombrePagina: 'Nuevo Proyecto',
            errores,
            proyectos
        })
    } else {
        //no hay errores
        // insertar en la BD
        await Proyectos.update(
            { nombre },
            { where: { id: req.params.id }}
        )
        res.redirect('/')
    }
}

exports.borrarProyecto = async (req, res, next) => {
    // console.log(req.query);
    const {urlProyecto} = req.query
    
    const resultado = await Proyectos.destroy({where: {url: urlProyecto}})
    if(!resultado) {
        return next()
    }
    res.status(200).send('Proyecto Eliminado Correctamente')
}