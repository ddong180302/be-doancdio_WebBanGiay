
import db from '../models';
import { Op, where } from 'sequelize';
require('dotenv').config();
import jwt from 'jsonwebtoken';

const getAllUserPaginate = ({ current, pageSize, order, fullName, role, email, phone, address, ...query }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const queries = {
                raw: true, nest: true, attributes: {
                    exclude: [
                        "password",
                        "deleted_at",
                        "refresh_token",
                    ]
                },
            };
            let limit = +pageSize || process.env.LIMIT_USER;
            let offset = (!current || +current <= 1) ? 0 : (+current - 1) * limit;
            if (offset) queries.offset = offset;
            if (limit) queries.limit = limit;
            if (order) queries.order = [[order.split(' ')[0], order.split(' ')[1]]];
            const where = {};
            if (fullName) {
                where.fullName = {
                    [Op.substring]: fullName
                };
            }
            if (role) {
                where.role = {
                    [Op.substring]: role
                };
            }

            if (email) {
                where.email = {
                    [Op.substring]: email
                };
            }

            if (phone) {
                where.phone = {
                    [Op.substring]: phone
                };
            }

            if (address) {
                where.address = {
                    [Op.substring]: address
                };
            }
            let users = await db.User.findAll({
                ...queries,
                where: {
                    ...query,
                    ...where,
                },
            });
            const total = await db.User.count();
            const pages = Math.ceil(total / pageSize); // Tổng số trang
            const meta = {
                current: +current,
                pageSize: +pageSize,
                pages: pages,
                total: total
            };
            if (users) {
                for (let i = 0; i < users.length; i++) {
                    if (users[i].avatar) {
                        users[i].avatar = await new Buffer.from(users[i].avatar, 'binary').toString('base64');
                    } else {
                        users[i].avatar = '';
                    }
                }
            }
            let result = users;
            resolve({
                statusCode: 200,
                message: "",
                data: {
                    meta: meta,
                    result: result
                }
            })
        } catch (e) {
            reject(e);
        }
    })
}

const updateUser = (token, id, fullName, phone) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (token) {
                const access_token = token.split(" ")[1];
                let decoded = jwt.verify(access_token, process.env.JWT_ACCESS_SECRET);
                if (!decoded) {
                    resolve({
                        statusCode: 401,
                        message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
                        error: "Unauthorized"
                    })
                }
            }
            else {
                resolve({
                    statusCode: 401,
                    message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
                    error: "Unauthorized"
                })
            }
            if (!id || !fullName || !phone) {
                resolve({
                    statusCode: 400,
                    message: "Không truyền đủ tham số"
                })
            }
            let user = await db.User.findOne({
                where: {
                    id: id
                }
            })

            await db.User.update({
                fullName: fullName,
                phone: phone,
            }, {
                where: {
                    id: id
                }
            });

            let data = {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                phone: user.fullName
            }

            if (data) {
                resolve({
                    statusCode: 200,
                    message: "",
                    data: data
                })
            } else {
                resolve({
                    statusCode: 400,
                    message: "Người dùng không tồn tại!"
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let deleteUser = (token, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (token) {
                const access_token = token.split(" ")[1];
                let decoded = jwt.verify(access_token, process.env.JWT_ACCESS_SECRET);
                if (!decoded) {
                    resolve({
                        statusCode: 401,
                        message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
                        error: "Unauthorized"
                    })
                }
            } else {
                resolve({
                    statusCode: 401,
                    message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
                    error: "Unauthorized"
                })
            }
            if (!id) {
                resolve({
                    statusCode: 400,
                    message: "Không truyền đủ tham số"
                })
            }
            let user = await db.User.findOne({
                where: { id: id }
            })

            if (!user) {
                resolve({
                    statusCode: 400,
                    message: `the user isn't exist`
                })
            }

            await db.User.destroy({
                where: {
                    id: id
                }
            });
            resolve({
                statusCode: 200,
                message: 'delete the user successds!',
                data: {
                    acknowledged: true,
                    deletedCount: user.length
                }
            });
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    getAllUserPaginate,
    updateUser,
    deleteUser,
}