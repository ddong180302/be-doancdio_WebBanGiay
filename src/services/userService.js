
import db from '../models';
import { Op, where } from 'sequelize';
require('dotenv').config()

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

            //if (fullName) queries.fullName = { [Op.substring]: fullName }
            const users = await db.User.findAll({
                ...queries,
                where: {
                    ...query,
                    ...where,
                },
                // raw: false,
                // nest: true
            });
            const total = await db.User.count();
            const pages = Math.ceil(total / pageSize); // Tổng số trang
            const meta = {
                current: +current,
                pageSize: +pageSize,
                pages: pages,
                total: total
            };
            const result = users;
            if (result && result.users) {
                for (let i = 0; i < result.users.length; i++) {
                    if (result.users[i].image) {
                        result.users[i].image = await new Buffer.from(result.users[i].image, 'binary').toString('base64');
                    } else {
                        result.users[i].image = '';
                    }
                }
            }
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

module.exports = {
    getAllUserPaginate
}