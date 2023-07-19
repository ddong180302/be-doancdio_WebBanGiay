import db from '../models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const checkUserEmail = async (email) => {
    let user = await db.User.findOne({
        where: { email: email }
    });
    return !!user;
};

const hashUserPassword = async (password) => {
    let salt = await bcrypt.genSaltSync(10);
    let hashPassword = await bcrypt.hashSync(password, salt);
    return hashPassword;
};

export { checkUserEmail, hashUserPassword };