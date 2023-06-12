import db from '../models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
require('dotenv').config();
import categoryService from "../services/categoryService";

const createNewCategory = async (req, res) => {
    const { name } = req.body;
    const token = req.headers.authorization;
    try {
        if (token) {
            const access_token = token.split(" ")[1];
            let decoded = jwt.verify(access_token, process.env.JWT_ACCESS_SECRET);
            if (decoded) {
                const response = await categoryService.createNewCategory(name);
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

const getAllCategory = async (req, res) => {
    try {
        const response = await categoryService.getAllCategory();
        return res.status(200).json(response);
    }
    catch (e) {
        console.log(e);
        return res.status(401).json({
            statusCode: 401,
            message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
            error: "Unauthorized"
        })
    }
}

const getAllCategoryPaginate = async (req, res) => {
    const token = req.headers.authorization;
    try {
        if (token) {
            const access_token = token.split(" ")[1];
            let decoded = jwt.verify(access_token, process.env.JWT_ACCESS_SECRET);
            if (decoded) {
                const response = await categoryService.getAllCategoryPaginate(req.query);
                return res.status(200).json(response);
            }
        } else {
            return res.status(401).json({
                statusCode: 401,
                message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
                error: "Unauthorized"
            })
        }
    }
    catch (e) {
        console.log(e);
        return res.status(401).json({
            statusCode: 401,
            message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
            error: "Unauthorized"
        })
    }
}


const updateCategory = async (req, res) => {
    const token = req.headers.authorization;
    const name = req.body;
    try {
        if (token) {
            const access_token = token.split(" ")[1];
            let decoded = jwt.verify(access_token, process.env.JWT_ACCESS_SECRET);
            if (decoded) {
                const response = await userService.getAllUserPaginate(name);
                return res.status(200).json(response);
            }
        } else {
            return res.status(401).json({
                statusCode: 401,
                message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
                error: "Unauthorized"
            })
        }
    }
    catch (e) {
        console.log(e);
        return res.status(401).json({
            statusCode: 401,
            message: "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)",
            error: "Unauthorized"
        })
    }
}



const deleteCategory = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const { id } = req.params;
        const response = await categoryService.deleteCategory(token, id);
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
    createNewCategory,
    getAllCategory,
    getAllCategoryPaginate,
    updateCategory,
    deleteCategory
}