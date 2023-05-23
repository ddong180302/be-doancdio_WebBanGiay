import express from "express";
import db from '../models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
require('dotenv').config()

let checkUserEmail = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: email }
            })
            if (user) {
                resolve(true)
            } else {
                resolve(false)
            }
        } catch (e) {
            reject(e)
        }
    })
}

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let salt = await bcrypt.genSaltSync(10);
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e);
        }
    })
}

export const register = (fullName, email, password, phone) => {
    return new Promise(async (resolve, reject) => {
        const validateEmail = (email) => {
            return String(email)
                .toLowerCase()
                .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
        }
        try {
            const isValidEmail = validateEmail(email)
            if (!fullName && !isValidEmail && !phone && !password) {
                resolve({
                    statusCode: 400,
                    message: [
                        'fullName không được để trống',
                        'phone không được để trống',
                        'password không được để trống',
                        'email không được để trống or không đúng định dạng'
                    ],
                    error: "Bad Request"
                })
            }

            if (!fullName && !isValidEmail && !phone) {
                resolve({
                    statusCode: 400,
                    message: [
                        'fullName không được để trống',
                        'phone không được để trống',
                        'email không được để trống or không đúng định dạng'
                    ],
                    error: "Bad Request"
                })
            }

            if (!fullName && !password && !phone) {
                resolve({
                    statusCode: 400,
                    message: [
                        'fullName không được để trống',
                        'phone không được để trống',
                        'password không được để trống',
                    ],
                    error: "Bad Request"
                })
            }

            if (!isValidEmail && !password && !phone) {
                resolve({
                    statusCode: 400,
                    message: [
                        'password không được để trống',
                        'phone không được để trống',
                        'email không được để trống or không đúng định dạng'
                    ],
                    error: "Bad Request"
                })
            }
            if (!isValidEmail && !password && !fullName) {
                resolve({
                    statusCode: 400,
                    message: [
                        'fullName không được để trống',
                        'phone không được để trống',
                        'email không được để trống or không đúng định dạng'
                    ],
                    error: "Bad Request"
                })
            }

            if (!fullName && !isValidEmail) {
                resolve({
                    statusCode: 400,
                    message: [
                        'fullName không được để trống',
                        'email không được để trống or không đúng định dạng'
                    ],
                    error: "Bad Request"
                })
            }

            if (!fullName && !password) {
                resolve({
                    statusCode: 400,
                    message: [
                        'fullName không được để trống',
                        'password không được để trống'
                    ],
                    error: "Bad Request"
                })
            }

            if (!fullName && !phone) {
                resolve({
                    statusCode: 400,
                    message: [
                        'fullName không được để trống',
                        'phone không được để trống'
                    ],
                    error: "Bad Request"
                })
            }

            if (!password && !phone) {
                resolve({
                    statusCode: 400,
                    message: [
                        'phone không được để trống',
                        'password không được để trống',
                    ],
                    error: "Bad Request"
                })
            }

            if (!password && !isValidEmail) {
                resolve({
                    statusCode: 400,
                    message: [
                        'email không được để trống or không đúng định dạng',
                        'password không được để trống',
                    ],
                    error: "Bad Request"
                })
            }

            if (!phone && !isValidEmail) {
                resolve({
                    statusCode: 400,
                    message: [
                        'email không được để trống or không đúng định dạng',
                        'phone không được để trống',
                    ],
                    error: "Bad Request"
                })
            }

            if (!fullName) {
                resolve({
                    statusCode: 400,
                    message: 'fullName không được để trống',
                    error: "Bad Request"
                })
            }

            if (!password) {
                resolve({
                    statusCode: 400,
                    message: 'password không được để trống',
                    error: "Bad Request"
                })
            }

            if (!phone) {
                resolve({
                    statusCode: 400,
                    message: 'phone không được để trống',
                    error: "Bad Request"
                })
            }

            if (!isValidEmail) {
                resolve({
                    statusCode: 400,
                    message: 'email không được để trống or không đúng định dạng',
                    error: "Bad Request"
                })
            }

            let check = await checkUserEmail(email);
            if (check === true) {
                resolve({
                    statusCode: 400,
                    message: 'Email đã tồn tại, vui lòng sử dụng email khác',
                    error: "Bad Request"
                })
            } else {
                let hashPasswordFromBcrypt = await hashUserPassword(password);
                await db.User.create({
                    fullName: fullName,
                    email: email,
                    password: hashPasswordFromBcrypt,
                    phone: phone,
                    role: "USER",
                });
                resolve({
                    statusCode: 201,
                    message: "",
                    data: {
                        id: uuidv4(),
                        email: email,
                        fullName: fullName
                    },
                })
            }
        } catch (e) {
            reject(e)
        }

    })
}

const login = async (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let isExist = await checkUserEmail(email);
            if (isExist === true) {
                let user = await db.User.findOne({
                    where: { email: email },
                    raw: true
                });
                if (user) {
                    let check = await bcrypt.compareSync(password, user.password)
                    if (check) {
                        const access_token = jwt.sign({
                            email: user.email,
                            phone: user.phone,
                            fullName: user.fullName,
                            role: user.role,
                            sub: user.id
                        },
                            process.env.JWT_ACCESS_SECRET, {
                            expiresIn: "10h"
                        })
                        const refresh_token = jwt.sign({
                            email: user.email,
                            phone: user.phone,
                            fullName: user.fullName,
                            role: user.role,
                            sub: user.id
                        },
                            process.env.JWT_REFRESH_SECRET, {
                            expiresIn: "1d"
                        })

                        await res.cookie("refresh_token", refresh_token, {
                            httpOnly: true,
                            secure: false,
                            path: "/",
                            sameSite: "strict",
                        })

                        await db.User.update({
                            refresh_token: refresh_token
                        }, {
                            where: {
                                email: email
                            }
                        });

                        const data = {
                            access_token: access_token,
                            user: {
                                id: user.id,
                                email: user.email,
                                phone: user.phone,
                                fullName: user.fullName,
                                role: user.role,
                            }
                        }

                        // if (delay) {
                        //     await new Promise(resolve => setTimeout(resolve, delay));
                        // }
                        resolve({
                            statusCode: 201,
                            message: "",
                            data: data,
                        })
                    } else {
                        resolve({
                            statusCode: 400,
                            message: "Thông tin đăng nhập không chính xác",
                            error: "Bad Request"
                        })
                    }
                } else {
                    resolve({
                        statusCode: 400,
                        message: "Thông tin đăng nhập không chính xác",
                        error: "Bad Request"
                    })
                }
            } else {
                resolve({
                    statusCode: 400,
                    message: "Thông tin đăng nhập không chính xác",
                    error: "Bad Request"
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

const getAccount = (token) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!token) {
                resolve({
                    statusCode: 401,
                    message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
                    error: "Unauthorized"
                })
            }
            const access_token = token.split(" ")[1];
            let decoded = jwt.verify(access_token, process.env.JWT_ACCESS_SECRET);
            if (!decoded) {
                resolve({
                    statusCode: 401,
                    message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
                    error: "Unauthorized"
                })
            } else {
                let user = await db.User.findOne({
                    where: {
                        email: decoded.email
                    },
                    raw: true
                });
                if (user) {
                    resolve({
                        statusCode: 200,
                        message: "",
                        data: {
                            user: {
                                id: user.id,
                                email: user.email,
                                phone: user.phone,
                                fullName: user.fullName,
                                role: user.role,
                                avatar: user.image
                            }
                        },
                    })
                }
            }
        } catch (e) {
            reject(e)
        }
    })
}

const logout = (token) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!token) {
                resolve({
                    statusCode: 401,
                    message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
                    error: "Unauthorized"
                })
            }
            const access_token = token.split(" ")[1];
            let decoded = jwt.verify(access_token, process.env.JWT_ACCESS_SECRET);
            if (!decoded) {
                resolve({
                    statusCode: 401,
                    message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
                    error: "Unauthorized"
                })
            } else {
                let user = await db.User.findOne({
                    where: {
                        email: decoded.email
                    },
                    raw: true
                });
                if (user) {
                    await db.User.update({
                        refresh_token: ""
                    }, {
                        where: {
                            email: decoded.email
                        }
                    });
                    resolve({
                        statusCode: 201,
                        message: "",
                        data: "Logout success."
                    })
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    register,
    login,
    getAccount,
    logout
}