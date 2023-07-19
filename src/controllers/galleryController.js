import jwt from 'jsonwebtoken';
require('dotenv').config();
import galleryService from "../services/galleryService";
const TOKEN_ERROR_MESSAGE = "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)";
export const createNewGallery = async (req, res, next) => {
    // const image = req.files;
    // const { product_id } = req.body;
    // const token = req.headers.authorization;
    // try {
    //     if (token) {
    //         const access_token = token.split(" ")[1];
    //         let decoded = jwt.verify(access_token, process.env.JWT_ACCESS_SECRET);
    //         if (decoded) {
    //             const response = await galleryService.createNewGallery(image, product_id);
    //             return res.status(200).json(response);
    //         }
    //     } else {
    //         return res.status(401).json({
    //             statusCode: 401,
    //             message: TOKEN_ERROR_MESSAGE,
    //             error: "Unauthorized"
    //         })
    //     }
    // } catch (e) {
    //     next(e);
    // }
    const image = req.files;
    const { product_id } = req.body;
    const response = await galleryService.createNewGallery(image, product_id);
    return res.status(200).json(response);
}
const getAllGallery = async (req, res, next) => {
    const token = req.headers.authorization;
    try {
        if (token) {
            const access_token = token.split(" ")[1];
            let decoded = jwt.verify(access_token, process.env.JWT_ACCESS_SECRET);
            if (decoded) {
                const response = await galleryService.getAllGallery();
                return res.status(200).json(response);
            }
        } else {
            return res.status(401).json({
                statusCode: 401,
                message: TOKEN_ERROR_MESSAGE,
                error: "Unauthorized"
            })
        }
    } catch (e) {
        next(e);
    }
}
const updateGallery = async (req, res, next) => {
    let productId = req.body;
    let image = req.file.buffer;
    const token = req.headers.authorization;
    try {
        if (token) {
            const access_token = token.split(" ")[1];
            let decoded = jwt.verify(access_token, process.env.JWT_ACCESS_SECRET);
            if (decoded) {
                const response = await galleryService.updateGallery(productId, image);
                return res.status(200).json(response);
            }
        } else {
            return res.status(401).json({
                statusCode: 401,
                message: TOKEN_ERROR_MESSAGE,
                error: "Unauthorized"
            })
        }
    } catch (e) {
        next(e);
    }
}
module.exports = {
    createNewGallery,
    getAllGallery,
    updateGallery
}