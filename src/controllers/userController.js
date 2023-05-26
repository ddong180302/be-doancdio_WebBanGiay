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
                        if (data[i].image) {
                            data[i].image = await new Buffer.from(data[i].image, 'binary').toString('base64');
                        } else {
                            data[i].image = '';
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
        // const page = parseInt(req.query.current);
        //const limit = parseInt(req.query.pageSize);

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


module.exports = {
    getAllUser,
    getAllUserPaginate
}