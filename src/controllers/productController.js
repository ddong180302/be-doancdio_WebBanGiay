import db from '../models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
require('dotenv').config();
import productService from "../services/productService";

const createNewProduct = async (req, res) => {
    const { category_id, name, price, quantity, sold } = req.body;
    const thumbnail = req.file.buffer;

    const token = req.headers.authorization;
    try {
        if (token) {
            const access_token = token.split(" ")[1];
            let decoded = jwt.verify(access_token, process.env.JWT_ACCESS_SECRET);
            if (decoded) {
                const response = await productService.createNewProduct(category_id, name, price, quantity, sold, thumbnail);
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

const getAllProduct = async (req, res) => {
    try {
        const response = await productService.getAllProduct();
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

const getAllProductPaginate = async (req, res) => {
    try {
        const response = await productService.getAllProductPaginate(req.query);
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


const updateProduct = async (req, res) => {
    const token = req.headers.authorization;
    const { id, name, price, quantity } = req.body;
    const thumbnail = req.file.buffer;
    try {
        if (token) {
            const access_token = token.split(" ")[1];
            let decoded = jwt.verify(access_token, process.env.JWT_ACCESS_SECRET);
            if (decoded) {
                const response = await productService.updateProduct(id, name, price, quantity, thumbnail);
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



const deleteProduct = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const { id } = req.params;
        const response = await productService.deleteProduct(token, id);
        return res.status(200).json(response)
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            statusCode: 500,
            message: "đã có lỗi xảy ra!"
        })
    }
}

const getDetailProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await productService.getDetailProductById(id);
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
    createNewProduct,
    getAllProduct,
    getAllProductPaginate,
    updateProduct,
    deleteProduct,
    getDetailProductById
}