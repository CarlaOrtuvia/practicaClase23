import 'dotenv/config'
import nodemailer from 'nodemailer'

const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'carlitaortuvia@gmail.com',
        pass: process.env.PASSWORD_EMAIL,
        authMethod: 'LOGIN'
    }
})

export const sendRecoveryMail = (email, recoveryLink) => {
    const mailOptions = {
        from: 'carlitaortuvia83@gmail.com',
        to: email,
        subject: 'Link para reestablecer su contraseña',
        text: `Haga click en el siguiente enlace para reestablecer su contraseña: ${recoveryLink}`
    }

    transport.sendMail(mailOptions, (error, info) => {
        if (error)
            console.log(error)
        else
            console.log('Email enviado correctamente')
    })
}