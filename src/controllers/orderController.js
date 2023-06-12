import db from '../models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
require('dotenv').config();
import orderService from "../services/orderService";


const createAnOrder = async (req, res) => {
    const { user_id, email, fullName, address, note, phone, total_money, detail } = req.body;
    try {
        const response = await orderService.createAnOrder(user_id, email, fullName, address, note, phone, total_money, detail);
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

module.exports = {
    createAnOrder
}