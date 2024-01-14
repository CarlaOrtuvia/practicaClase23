import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import InitializePassport from './config/passport.js'
import cors from 'cors';
import apiRouter from './routes/apis.routes.js';
import errorHandler from './middlewares/errors/index.js';
import { addLogger } from './config/logger.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

dotenv.config();
const app = express()
const PORT = 4000

const server =  app.listen(PORT, () => {
    console.log(`Server on Port ${PORT}`)
})

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('BDD conectada'))
    .catch(() => console.log('Error en conexion a BDD'))

    const whiteList = ['http://127.0.0.1:5173']

    const corsOptions = {
        origin: function (origin, callback) {
            if (whiteList.indexOf(origin) != -1 || !origin) {
                callback(null, true)
            } else {
                callback(new Error("Acceso denegado"))
            }
        }
    }
   
    const swaggerOptions = {
        definition: {
            openapi: '3.1.0',
            info: {
                title: "Documentación del curso de Backend",
                description: "API Coder Backend"
            }
        },
        apis: [`${__dirname}/docs/**/*.yaml`]
        //** = indica una subcarpeta que no me interesa el nombre
        //*.yaml = indica que en esa subcarpeta va a haber archivos. No me interesa el nombre de estos pero la extensión es yaml
    }
    
    //La forma en que voy a trabajar mi documentación
    const specs = swaggerJSDoc(swaggerOptions)
     

    

app.use(express.json())
app.use(cors(corsOptions))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(process.env.SIGNED_COOKIE))
app.use(session({
    store:  MongoStore.create({ 
        mongoUrl: process.env.MONGO_URL,
       mongoOptions: { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        }, 
        ttl: 120
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
})) 

InitializePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use(addLogger);
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs)); //En qué ruta se va a ejecutar, y bajo qué condiciones



app.use('/api', apiRouter);
app.use(errorHandler);