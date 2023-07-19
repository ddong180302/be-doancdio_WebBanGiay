import db from '../models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
require('dotenv').config();
import validator from 'validator';

let checkUserEmail = async (email) => {
    try {
        let user = await db.User.findOne({
            where: { email: email },
            attributes: ['email']
        })
        return user !== null;
    } catch (e) {
        throw e;
    }
}

let hashUserPassword = async (password) => {
    try {
        let salt = await bcrypt.genSalt(10);
        let hashPassword = await bcrypt.hash(password, salt);
        return hashPassword;
    } catch (e) {
        throw e;
    }
}

export const register = async (req, res, next) => {
    const { fullName, email, password, phone } = req.body;
    try {
        const errors = [];
        if (!fullName) {
            errors.push("fullName không được để trống");
        }

        if (!email) {
            errors.push("email không được để trống");
        } else {
            const isValidEmail = validator.isEmail(email);
            if (!isValidEmail) {
                errors.push("email không đúng định dạng");
            } else {
                const isExistEmail = await checkUserEmail(email);
                if (isExistEmail) {
                    errors.push("Email đã tồn tại, vui lòng sử dụng email khác");
                }
            }
        }

        if (!phone) {
            errors.push("phone không được để trống");
        }

        if (!password) {
            errors.push("password không được để trống");
        }

        if (errors.length > 0) {
            res.status(400).json({
                statusCode: 400,
                message: errors,
                error: "Bad Request",
            });
        }
        const hashPasswordFromBcrypt = await hashUserPassword(password);
        const user = await db.User.create({
            fullName: fullName,
            email: email,
            password: hashPasswordFromBcrypt,
            phone: phone,
            role: "USER",
        });
        res.status(201).json({
            statusCode: 201,
            message: "",
            data: {
                id: user.id,
                email: email,
                fullName: fullName,
            },
        });
    } catch (e) {
        next(e);
    }
};

export const login = async (req, res, next) => {

    const { email, password } = req.body;
    try {
        const isExist = await checkUserEmail(email);

        if (!isExist) {
            return {
                statusCode: 400,
                message: "Thông tin đăng nhập không chính xác",
                error: "Bad Request",
            };
        }

        const user = await db.User.findOne({
            where: { email: email },
            raw: true,
        });
        if (!user) {
            return {
                statusCode: 400,
                message: "Thông tin đăng nhập không chính xác",
                error: "Bad Request",
            };
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            res.status(400).json({
                statusCode: 400,
                message: "Thông tin đăng nhập không chính xác",
                error: "Bad Request",
            });
        }

        const payload = {
            email: user.email,
            phone: user.phone,
            fullName: user.fullName,
            role: user.role,
            sub: user.id,
        };

        const access_token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: "1h",
        });

        const refresh_token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: "1d",
        });

        await db.User.update(
            {
                refresh_token: refresh_token,
            },
            {
                where: {
                    email: email,
                },
            }
        );
        res.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            secure: false,
            path: "/",
            sameSite: "strict",
            expires: new Date(Date.now() + 3600000),
        });

        const data = {
            access_token: access_token,
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                fullName: user.fullName,
                role: user.role,
                avatar: user.avatar
            },
        }
        if (data && data.user && data.user.avatar) {
            data.user.avatar = await new Buffer.from(data.user.avatar, 'binary').toString('base64');
        } else {
            data.user.avatar = '';
        }
        res.status(201).json({
            statusCode: 201,
            message: "",
            data: data,
        })

    } catch (e) {
        next(e)
    }
};

export const getAccount = async (req, res, next) => {
    const decoded = req.user;
    try {
        const user = await db.User.findOne({
            where: {
                email: decoded.email
            },
            raw: true,
        });
        if (user) {
            const avatar = user.avatar ? await new Buffer.from(user.avatar, "binary").toString("base64") : "";
            res.status(200).json({
                statusCode: 200,
                message: "",
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        phone: user.phone,
                        fullName: user.fullName,
                        role: user.role,
                        avatar: avatar,
                    },
                },
            });
        }

    } catch (e) {
        next(e);
    }

};

export const logout = async (req, res, next) => {
    const user = req.user;
    try {
        res.clearCookie("refresh_token");
        await db.User.update(
            {
                refresh_token: "",
            },
            {
                where: {
                    email: user.email,
                },
            }
        );
        res.status(201).json({
            statusCode: 201,
            message: "",
            data: "Logout success.",
        });

    } catch (e) {
        next(e);
    }
};

export const refresh = async (req, res, next) => {
    const decoded = req.user;
    try {
        const user = await db.User.findOne({
            where: {
                email: decoded.email
            },
            raw: true,
        });

        if (!user) {
            await res.status(402).json({
                statusCode: 402,
                message: "User not found",
                error: "Unauthorized",
            });
        }

        const access_token = jwt.sign(
            {
                email: user.email,
                phone: user.phone,
                fullName: user.fullName,
                role: user.role,
                sub: user.id,
            },
            process.env.JWT_ACCESS_SECRET,
            {
                expiresIn: "1h",
            }
        );

        const refresh_token = jwt.sign(
            {
                email: user.email,
                phone: user.phone,
                fullName: user.fullName,
                role: user.role,
                sub: user.id,
            },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: "1d",
            }
        );

        await res.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            secure: false,
            path: "/",
            sameSite: "strict",
        });

        await db.User.update(
            {
                refresh_token: refresh_token,
            },
            {
                where: {
                    email: decoded.email,
                },
            }
        );

        const data = {
            access_token: access_token,
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                fullName: user.fullName,
                role: user.role,
            },
        };

        await res.status(401).json({
            statusCode: 200,
            message: "",
            data: data,
        });
    } catch (e) {
        next(e);
    }
};

export default {
    register, refresh, login, logout, getAccount
}