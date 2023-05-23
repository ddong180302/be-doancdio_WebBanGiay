
import authService from "../services/authService";
import express from "express";
import db from '../models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
require('dotenv').config();

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

const register = async (req, res) => {
    const { fullName, email, password, phone } = req.body;
    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    }
    try {
        const isValidEmail = validateEmail(email);
        if (!fullName && !isValidEmail && !phone && !password) {
            res.status(400).json({
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
            res.status(400).json({
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
            res.status(400).json({
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
            res.status(400).json({
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
            res.status(400).json({
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
            res.status(400).json({
                statusCode: 400,
                message: [
                    'fullName không được để trống',
                    'email không được để trống or không đúng định dạng'
                ],
                error: "Bad Request"
            })
        }

        if (!fullName && !password) {
            res.status(400).json({
                statusCode: 400,
                message: [
                    'fullName không được để trống',
                    'password không được để trống'
                ],
                error: "Bad Request"
            })
        }

        if (!fullName && !phone) {
            res.status(400).json({
                statusCode: 400,
                message: [
                    'fullName không được để trống',
                    'phone không được để trống'
                ],
                error: "Bad Request"
            })
        }

        if (!password && !phone) {
            res.status(400).json({
                statusCode: 400,
                message: [
                    'phone không được để trống',
                    'password không được để trống',
                ],
                error: "Bad Request"
            })
        }

        if (!password && !isValidEmail) {
            res.status(400).json({
                statusCode: 400,
                message: [
                    'email không được để trống or không đúng định dạng',
                    'password không được để trống',
                ],
                error: "Bad Request"
            })
        }

        if (!phone && !isValidEmail) {
            res.status(400).json({
                statusCode: 400,
                message: [
                    'email không được để trống or không đúng định dạng',
                    'phone không được để trống',
                ],
                error: "Bad Request"
            })
        }

        if (!fullName) {
            res.status(400).json({
                statusCode: 400,
                message: ['fullName không được để trống'],
                error: "Bad Request"
            })
        }

        if (!password) {
            res.status(400).json({
                statusCode: 400,
                message: ['password không được để trống'],
                error: "Bad Request"
            })
        }

        if (!phone) {
            res.status(400).json({
                statusCode: 400,
                message: ['phone không được để trống'],
                error: "Bad Request"
            })
        }

        if (!isValidEmail) {
            res.status(400).json({
                statusCode: 400,
                message: ['email không được để trống or không đúng định dạng'],
                error: "Bad Request"
            })
        }

        let check = await checkUserEmail(email);
        if (check === true) {
            res.status(400).json({
                statusCode: 400,
                message: 'Email đã tồn tại, vui lòng sử dụng email khác',
                error: "Bad Request"
            })
        } else {
            let hashPasswordFromBcrypt = await hashUserPassword(password);
            const user = await db.User.create({
                fullName: fullName,
                email: email,
                password: hashPasswordFromBcrypt,
                phone: phone,
                role: "USER",
            });
            if (user) {
                res.status(201).json({
                    statusCode: 201,
                    message: "",
                    data: {
                        id: user.id,
                        email: user.email,
                        fullName: user.fullName
                    },
                })
            }
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            statusCode: 500,
            message: 'Error from the server!'
        })
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;
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

                    res.cookie("refresh_token", refresh_token, {
                        httpOnly: true,
                        secure: false,
                        path: "/",
                        sameSite: "strict",
                        expires: new Date(Date.now() + 3600000),
                    });

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
                        },
                    }
                    res.status(201).json({
                        statusCode: 201,
                        message: "",
                        data: data,
                    })
                } else {
                    res.status(400).json({
                        statusCode: 400,
                        message: "Thông tin đăng nhập không chính xác",
                        error: "Bad Request"
                    })
                }
            } else {
                res.status(400).json({
                    statusCode: 400,
                    message: "Thông tin đăng nhập không chính xác",
                    error: "Bad Request"
                })
            }
        } else {
            res.status(400).json({
                statusCode: 400,
                message: "Thông tin đăng nhập không chính xác",
                error: "Bad Request"
            })
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            statusCode: 500,
            message: 'Error from the server!'
        })
    }
}

const getAccount = async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            res.status(401).json({
                statusCode: 401,
                message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
                error: "Unauthorized"
            })
        }
        const access_token = token.split(" ")[1];
        let decoded = jwt.verify(access_token, process.env.JWT_ACCESS_SECRET);
        if (!decoded) {
            res.status(401).json({
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
                            avatar: user.image
                        }
                    },
                })
            }
        }
    } catch (e) {
        console.log(e);
        res.status(401).json({
            statusCode: 401,
            message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
            error: "Unauthorized"
        })
    }
}

const logout = async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            res.status(401).json({
                statusCode: 401,
                message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
                error: "Unauthorized"
            })
        }
        const access_token = token.split(" ")[1];
        let decoded = jwt.verify(access_token, process.env.JWT_ACCESS_SECRET);
        if (!decoded) {
            res.status(401).json({
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
                res.clearCookie("refresh_token");
                await db.User.update({
                    refresh_token: ""
                }, {
                    where: {
                        email: decoded.email
                    }
                });
                res.status(200).json({
                    statusCode: 201,
                    message: "",
                    data: "Logout success."
                })
            }
        }
    } catch (e) {
        console.log(e);
        return res.status(401).json({
            statusCode: 401,
            message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
            error: "Unauthorized"
        })
    }
}



const refresh = async (req, res) => {
    try {
        let token = req.headers.cookie;
        if (token) {
            let refresh_token = token.substring('refresh_token='.length);
            if (!refresh_token) {
                await res.status(401).json({
                    statusCode: 401,
                    message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
                    error: "Unauthorized"
                })
            }
            let decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);

            if (!decoded) {
                await res.status(401).json({
                    statusCode: 402,
                    message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
                    error: "Unauthorized"
                })
            } else {
                let user = await db.User.findOne({
                    where: {
                        email: decoded.email,
                        refresh_token: refresh_token
                    },
                    raw: true
                });
                if (user) {
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
                            email: decoded.email
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
                    await res.status(200).json({
                        statusCode: 200,
                        message: "",
                        data: data
                    })
                } else {
                    await res.status(401).json({
                        statusCode: 402,
                        message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
                        error: "Unauthorized"
                    })
                }
            }
        } else {
            await res.status(400).json({
                statusCode: 400,
                message: "Không tồn tại refresh_token ở cookies. Please do login again.",
                error: "Unauthorized"
            })
        }
    } catch (e) {
        console.log(e);
        return await res.status(400).json({
            statusCode: 400,
            message: "Không tồn tại refresh_token ở cookies. Please do login again.",
            error: "Unauthorized"
        })
    }
}
module.exports = {
    register,
    login,
    getAccount,
    logout,
    refresh
}