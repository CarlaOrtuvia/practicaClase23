import passport from "passport";

//Funcion general para retornar errores es las estrategias de passport

export const passportError = (strategy) => { //Voy a enviar local, github o jwt
    return async (req, res, next) => {
        passport.authenticate(strategy, (error, user, info) => {
            //console.log(user, info)
            if (error) {
                return next(error) //Que la funcion que me llame maneje como va a responder ante mi error
            }
            if (!user) {
                console.log(info.toString())
                return res.status(401).redirect('/login')
                //return res.status(401).send({ error: info.messages ? info.messages : info.toString() })

            }

            req.user = user
            next()
        })(req, res, next) //Esto es por que me va a llamar un middleware

    }
}

//Recibo un rol y establezco la capacidad del usuario
export const authorization = (rol) => { //rol = 'Admin' desde ruta 'Crear Producto'
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).send({ error: 'User no autorizado' })
        }
        if (!rol.includes(req.user.user.rol)) { 
            return res.status(403).send({ error: 'Usuario no tiene los permisos necesarios' })
        }
        next()
    }
}