import local from 'passport-local'
import GithubStrategy from 'passport-github2'
import jwt from 'passport-jwt'
import passport from 'passport';
import CustomError from '../services/errors/CustomError.js';
import EError from '../services/errors/enum.js';
import { createHash, validatePassword } from '../utils/bcrypt.js'
import { userModel } from "../models/users.models.js";
import 'dotenv/config'



//Defino la estregia a utilizar: autenticación de manera local, utilizando email y contraseña
const LocalStrategy = local.Strategy
const JWTStrategy = jwt.Strategy
const ExtractJWT = jwt.ExtractJwt //Extrar de las cookies el token

const initializePassport = () => {

    //1) Capturar las cookies
    const cookieExtractor = req => {
        //En lugar de tomar de las cookies, directamente todo de la petición
        const token = req.headers.authorization ? req.headers.authorization : {}

        console.log("cookieExtractor", token)
        return token
    }

    //2) Estrategia utilizando cookies
    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]), //El token va a venir desde cookieExtractor
        secretOrKey: process.env.JWT_SECRET
    }, async (jwt_payload, done) => { //jwt_payload = info del token (en este caso, datos del cliente)
        try {
            console.log("JWT", jwt_payload)
            return done(null, jwt_payload)
        } catch (error) {
            return done(error)
        }
    }))

    //3) Estrategia register
    passport.use('register', new LocalStrategy(
        { passReqToCallback: true, usernameField: 'email' }, async (req, username, password, done) => {
            const { first_name, last_name, email, age } = req.body
            try {
                const user = await userModel.findOne({ email: email })
                if (user) {
                    return done(null, false)
                }
                const passwordHash = createHash(password)
                const userCreated = await userModel.create({
                    first_name: first_name,
                    last_name: last_name,
                    age: age,
                    email: email,
                    password: passwordHash
                })
                return done(null, userCreated)
            } catch (error) {
                return done(error)
            }
        }))

    //4) Estrategia login
    passport.use('login', new LocalStrategy(
        { usernameField: 'email' }, async (email, password, done) => {
            try {
                const user = await findUserByEmail(email);

                // Si el usuario no existe o la contraseña es incorrecta
                if (!user) {
                    return done(null, false, { message: 'Credenciales inválidas.' });
                }

                // Validar la contraseña
                const isPasswordValid = await validatePassword(password, user.password);

                // Si la contraseña es incorrecta
                if (!isPasswordValid) {
                    return done(null, false, { message: 'Credenciales inválidas.' });
                }
                // Actualizar last_connection
                user.last_connection = new Date();
                await user.save();

                // Si el usuario existe y la contraseña es correcta, retornar el usuario
                return done(null, user);
            }
            catch (error) {
                // Manejo genérico de errores
                return done(error, false, { message: 'Error en el proceso de inicio de sesión.' });
            }
    }));

    //5) Estrategia utilizando github
    passport.use('github', new GithubStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.SECRET_CLIENT,
        callbackURL: process.env.CALLBACK_URL
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log(accessToken)
            console.log(refreshToken)
            console.log(profile._json)
            const user = await userModel.findOne({ email: profile._json.email })
            if (user) {
                done(null, false)
            } else {
                const nombre_github_sin_espacios = profile._json.name.replace(/\s/g, '');

                const userCreated = await userModel.create({
                    first_name: profile._json.name,
                    last_name: ' ',
                    email: profile._json.email,
                    age: 18,
                    password: createHash(profile._json.email + nombre_github_sin_espacios)
                })
                done(null, userCreated)
            }
        } catch (error) {
            done(error)
        }
    }))

    //6) Agregarle un id único a la sesión que genero cuando me logueo
    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    //7) Eliminar la sesión del usuario
    passport.deserializeUser(async (id, done) => {
        const user = await userModel.findById(id)
        done(null, user)
    })
}

export default initializePassport