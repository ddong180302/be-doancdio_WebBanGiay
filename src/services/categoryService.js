
import db from '../models';
import { Op, where } from 'sequelize';
require('dotenv').config();
import jwt from 'jsonwebtoken';

const createNewCategory = (name) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!name) {
                resolve({
                    statusCode: 400,
                    message: "Chưa nhập tên danh mục cần tạo",
                })
            } else {
                const category = await db.Category.create({
                    name: name
                })

                if (category) {
                    resolve({
                        statusCode: 200,
                        message: "",
                        data: {
                            name: category.name
                        }
                    })
                }
            }
        } catch (error) {
            reject(e);
        }
    })
}

const getAllCategory = () => {
    return new Promise(async (resolve, reject) => {
        try {

            let data = await db.Category.findAll({
                order: [['id', 'DESC']],
                attributes: {
                    exclude: [
                        "deleted_at",
                    ]
                },
                raw: false,
                nest: true
            })
            if (!data) data = {};
            resolve({
                statusCode: 200,
                message: "",
                data: data
            })


        } catch (e) {
            reject(e);
        }
    })
}

const getAllCategoryPaginate = ({ current, pageSize, order, name, createdAt, updatedAt, ...query }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const queries = {
                raw: true, nest: true, attributes: {
                    exclude: [
                        "deleted_at",
                    ]
                },
            };
            let limit = +pageSize || process.env.LIMIT_USER;
            let offset = (!current || +current <= 1) ? 0 : (+current - 1) * limit;
            if (offset) queries.offset = offset;
            if (limit) queries.limit = limit;
            if (order) queries.order = [[order.split(' ')[0], order.split(' ')[1]]];
            const where = {};
            if (name) {
                where.name = {
                    [Op.substring]: name
                };
            }
            if (createdAt) {
                where.createdAt = {
                    [Op.substring]: createdAt
                };
            }

            if (updatedAt) {
                where.updatedAt = {
                    [Op.substring]: updatedAt
                };
            }

            let categories = await db.Category.findAll({
                ...queries,
                where: {
                    ...query,
                    ...where,
                },
            });
            const total = await db.Category.count();
            const pages = Math.ceil(total / pageSize); // Tổng số trang
            const meta = {
                current: +current,
                pageSize: +pageSize,
                pages: pages,
                total: total
            };

            let result = categories;
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

const updateCategory = (name) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!name) {
                resolve({
                    statusCode: 400,
                    message: "Không truyền đủ tham số"
                })
            }
            let category = await db.Category.update({
                name: name
            }, {
                where: {
                    id: id
                }
            });
            let data = {
                id: category.id,
                name: category.name
            }
            if (category) {
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

let deleteCategory = (token, id) => {
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
            let category = await db.Category.findOne({
                where: { id: id }
            })

            if (!category) {
                resolve({
                    statusCode: 400,
                    message: `the category isn't exist`
                })
            }

            await db.Category.destroy({
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
    createNewCategory,
    getAllCategory,
    getAllCategoryPaginate,
    updateCategory,
    deleteCategory

}