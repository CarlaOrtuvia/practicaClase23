import'dotenv/config';
import bcrypt from 'bcrypt';

export const hashPassword =  (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(parseInt(process.env.SALT)));
const passwordEnc = hashPassword('coderhouse')

export const validatePassword =  (passwordSend, passwordBDD) => bcrypt.compareSync(passwordSend, passwordBDD);

console.log(validatePassword('coderhouse', passwordEnc))