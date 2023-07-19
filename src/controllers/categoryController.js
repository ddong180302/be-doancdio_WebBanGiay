import db from '../models';
import jwt from 'jsonwebtoken';
import { Op, where } from 'sequelize';
require('dotenv').config();

const TOKEN_ERROR_MESSAGE = "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)";

export const createNewCategory = async (req, res, next) => {
    const { name } = req.body;
    if (!name) {
        res.status(400).json({
            statusCode: 400,
            message: "Chưa nhập tên danh mục cần tạo",
        });
    }
    try {
        const category = await db.Category.create({ name });
        return {
            statusCode: 200,
            message: "",
            data: {
                name: category.name
            }
        };
    } catch (e) {
        next(e);
    }
}


export const getAllCategory = async (req, res, next) => {
    try {
        const data = await db.Category.findAll({
            order: [['id', 'DESC']],
            attributes: { exclude: ["deleted_at"] },
            raw: false,
            nest: true
        });

        res.status(200).json({
            statusCode: 200,
            message: "",
            data: data || {}
        });
    }
    catch (e) {
        next(e);
    }
}

export const getAllCategoryPaginate = async (req, res, next) => {
    const { current, pageSize, order, name, createdAt, updatedAt, ...query } = req.query;

    const limit = +pageSize;
    const offset = (+current - 1) * limit;
    console.log(offset)
    const where = {};

    if (name) {
        where.name = { [Op.substring]: name };
    }

    if (createdAt) {
        where.createdAt = { [Op.substring]: createdAt };
    }

    if (updatedAt) {
        where.updatedAt = { [Op.substring]: updatedAt };
    }

    try {
        const categories = await db.Category.findAndCountAll({
            raw: true,
            nest: true,
            attributes: { exclude: ["deleted_at"] },
            where: { ...query, ...where },
            order: [[order?.split(' ')[0], order?.split(' ')[1]]],
            limit,
            offset
        });
        const total = categories.count;
        const pages = Math.ceil(total / pageSize);
        const meta = { current: +current, pageSize: +pageSize, pages, total };
        const result = categories.rows || [];

        res.status(200).json({
            statusCode: 200,
            message: "",
            data: { meta, result }
        });
    }
    catch (e) {
        next(e);
    }
}

export const updateCategory = async (req, res, next) => {
    const token = req.headers.authorization;
    const { id, name } = req.body;
    if (!name) {
        return {
            statusCode: 400,
            message: "Không truyền đủ tham số"
        };
    }
    try {
        if (token) {
            const access_token = token.split(" ")[1];
            let decoded = jwt.verify(access_token, process.env.JWT_ACCESS_SECRET);
            if (decoded) {
                const [category] = await db.Category.update({ name }, { where: { id } });
                if (category) {
                    const data = { id: category.id, name: category.name };
                    res.status(200).json({
                        statusCode: 200,
                        message: "",
                        data
                    });
                } else {
                    res.status(200).json({
                        statusCode: 400,
                        message: "Người dùng không tồn tại!"
                    });
                }
            }
        } else {
            res.status(401).json({
                statusCode: 401,
                message: TOKEN_ERROR_MESSAGE,
                error: "Unauthorized"
            })
        }
    }
    catch (e) {
        next(e);
    }
}

export const deleteCategory = async (req, res, next) => {
    const token = req.headers.authorization;
    const { id } = req.params;
    if (!token) {
        res.status(401).json({
            statusCode: 401,
            message: TOKEN_ERROR_MESSAGE,
            error: "Unauthorized"
        });
    }

    try {
        const access_token = token.split(" ")[1];
        const decoded = jwt.verify(access_token, process.env.JWT_ACCESS_SECRET);
        if (!decoded) {
            res.status(401).json({
                statusCode: 401,
                message: TOKEN_ERROR_MESSAGE,
                error: "Unauthorized"
            });
        }

        if (!id) {
            res.status(400).json({
                statusCode: 400,
                message: "Không truyền đủ tham số"
            });
        }

        const category = await db.Category.findByPk(id);

        if (!category) {
            res.status(400).json({
                statusCode: 400,
                message: `the category isn't exist`
            });
        }

        const deletedCount = await db.Category.destroy({ where: { id } });

        res.status(200).json({
            statusCode: 200,
            message: 'delete the category success!',
            data: {
                acknowledged: true,
                deletedCount
            }
        });
    } catch (e) {
        next(e);
    }
}


export default {
    createNewCategory, getAllCategory, getAllCategoryPaginate, updateCategory, deleteCategory
}