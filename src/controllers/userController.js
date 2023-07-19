import db from '../models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
require('dotenv').config();
import userService from "../services/userService";


const getAllUser = async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (token) {
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
                });
                if (user) {
                    let data = await db.User.findAll({
                        order: [['id', 'DESC']],
                        attributes: {
                            exclude: [
                                "password",
                                "deletedAt",
                                "refresh_token",
                            ]
                        },
                        raw: false,
                        nest: true
                    })

                    for (let i = 0; i < data.length; i++) {
                        if (data[i].avatar) {
                            data[i].avatar = await new Buffer.from(data[i].avatar, 'binary').toString('base64');
                        } else {
                            data[i].avatar = '';
                        }
                    }
                    if (!data) data = {};
                    await res.status(200).json({
                        statusCode: 200,
                        message: "",
                        data: data
                    })
                } else {
                    await res.status(400).json({
                        statusCode: 400,
                        message: "Không tồn tại refresh_token ở cookies. Please do login again.",
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

    }
}

const getAllUserPaginate = async (req, res) => {
    try {
        const token = req.headers.authorization;

        if (token) {
            const access_token = token.split(" ")[1];
            let decoded = jwt.verify(access_token, process.env.JWT_ACCESS_SECRET);
            if (decoded) {
                const response = await userService.getAllUserPaginate(req.query);
                return res.status(200).json(response);
            }
        } else {
            return res.status(401).json({
                statusCode: 401,
                message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
                error: "Unauthorized"
            })
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


const createNewUser = async (req, res) => {
    const { fullName, email, password, phone, role } = req.body;
    const token = req.headers.authorization;
    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    }
    try {
        if (token) {
            const access_token = token.split(" ")[1];
            let decoded = jwt.verify(access_token, process.env.JWT_ACCESS_SECRET);
            if (decoded) {
                const isValidEmail = validateEmail(email);
                if (!fullName && !isValidEmail && !phone && !password && !role) {
                    res.status(400).json({
                        statusCode: 400,
                        message: [
                            'fullName không được để trống',
                            'phone không được để trống',
                            'password không được để trống',
                            'role không được để trống',
                            'email không được để trống or không đúng định dạng'
                        ],
                        error: "Bad Request"
                    })
                }
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

                if (!fullName && !isValidEmail && !phone && !role) {
                    res.status(400).json({
                        statusCode: 400,
                        message: [
                            'fullName không được để trống',
                            'phone không được để trống',
                            'role không được để trống',
                            'email không được để trống or không đúng định dạng'
                        ],
                        error: "Bad Request"
                    })
                }

                if (!fullName && !isValidEmail && !role && !password) {
                    res.status(400).json({
                        statusCode: 400,
                        message: [
                            'fullName không được để trống',
                            'role không được để trống',
                            'password không được để trống',
                            'email không được để trống or không đúng định dạng'
                        ],
                        error: "Bad Request"
                    })
                }
                if (!fullName && !role && !phone && !password) {
                    res.status(400).json({
                        statusCode: 400,
                        message: [
                            'fullName không được để trống',
                            'phone không được để trống',
                            'password không được để trống',
                            'role không được để trống'
                        ],
                        error: "Bad Request"
                    })
                }

                if (!role && !isValidEmail && !phone && !password) {
                    res.status(400).json({
                        statusCode: 400,
                        message: [
                            'role không được để trống',
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

                if (!isValidEmail && !password && !role) {
                    res.status(400).json({
                        statusCode: 400,
                        message: [
                            'fullName không được để trống',
                            'role không được để trống',
                            'email không được để trống or không đúng định dạng'
                        ],
                        error: "Bad Request"
                    })
                }
                if (!isValidEmail && !role && !fullName) {
                    res.status(400).json({
                        statusCode: 400,
                        message: [
                            'role không được để trống',
                            'phone không được để trống',
                            'email không được để trống or không đúng định dạng'
                        ],
                        error: "Bad Request"
                    })
                }
                if (!role && !password && !fullName) {
                    res.status(400).json({
                        statusCode: 400,
                        message: [
                            'fullName không được để trống',
                            'phone không được để trống',
                            'role không được để trống'
                        ],
                        error: "Bad Request"
                    })
                }
                if (!role && !password && !phone) {
                    res.status(400).json({
                        statusCode: 400,
                        message: [
                            'password không được để trống',
                            'phone không được để trống',
                            'role không được để trống'
                        ],
                        error: "Bad Request"
                    })
                }
                if (!isValidEmail && !role && !phone) {
                    res.status(400).json({
                        statusCode: 400,
                        message: [
                            'role không được để trống',
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

                if (!fullName && !role) {
                    res.status(400).json({
                        statusCode: 400,
                        message: [
                            'fullName không được để trống',
                            'role không được để trống'
                        ],
                        error: "Bad Request"
                    })
                }
                if (!password && !role) {
                    res.status(400).json({
                        statusCode: 400,
                        message: [
                            'role không được để trống',
                            'password không được để trống',
                        ],
                        error: "Bad Request"
                    })
                }

                if (!phone && !role) {
                    res.status(400).json({
                        statusCode: 400,
                        message: [
                            'role không được để trống',
                            'phone không được để trống',
                        ],
                        error: "Bad Request"
                    })
                }

                if (!role && !isValidEmail) {
                    res.status(400).json({
                        statusCode: 400,
                        message: [
                            'email không được để trống or không đúng định dạng',
                            'role không được để trống',
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
                if (!role) {
                    res.status(400).json({
                        statusCode: 400,
                        message: ['role không được để trống'],
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
                        role: role,
                    });
                    if (user) {
                        res.status(201).json({
                            statusCode: 201,
                            message: "",
                            data: {
                                fullName: user.fullName,
                                email: user.email,
                                phone: user.phone,
                                role: user.role,
                                avatar: user.avatar,
                                createdAt: user.createdAt,
                                updatedAt: user.updatedAt,
                                id: user.id,
                            },
                        })
                    }
                }
            }
        } else {
            return res.status(401).json({
                statusCode: 401,
                message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
                error: "Unauthorized"
            })
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

const bulkCreate = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const users = req.body;


        if (token) {
            const access_token = token.split(" ")[1];
            let decoded = jwt.verify(access_token, process.env.JWT_ACCESS_SECRET);
            if (!decoded) {
                res.status(401).json({
                    statusCode: 401,
                    message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
                    error: "Unauthorized"
                })
            } else {
                for (let i = 0; i < users.length; i++) {
                    let check = await checkUserEmail(users[i].email);
                    if (check === true) {
                        res.status(400).json({
                            statusCode: 400,
                            message: 'Email đã tồn tại, vui lòng sử dụng email khác',
                            error: "Bad Request"
                        })
                    }
                    const hashedPassword = await hashUserPassword(users[i].password);
                    users[i].password = hashedPassword;
                }

                const createdUsers = await db.User.bulkCreate(users);
                res.status(201).json({
                    statusCode: 201,
                    message: "",
                    data: {
                        countSuccess: createdUsers.length,
                        countError: 0,
                        message: null
                    },
                });
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
    }
}

const updateUser = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const { id, fullName, phone } = req.body;
        //const avatar = req.file.buffer;
        const response = await userService.updateUser(token, id, fullName, phone);
        return res.status(200).json(response)
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            statusCode: 500,
            message: "đã có lỗi xảy ra!"
        })
    }
}


const deleteUser = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const { id } = req.params;
        const response = await userService.deleteUser(token, id);
        return res.status(200).json(response)
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            statusCode: 500,
            message: "đã có lỗi xảy ra!"
        })
    }
}

module.exports = {
    getAllUser,
    getAllUserPaginate,
    createNewUser,
    bulkCreate,
    updateUser,
    deleteUser
}