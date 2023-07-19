
import db from '../models';
import { Op, where } from 'sequelize';
require('dotenv').config();
import jwt from 'jsonwebtoken';

const createNewGallery = (image, product_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!image || !product_id) {
                resolve({
                    statusCode: 400,
                    message: "Chưa nhập đủ tham số",
                })
            } else {
                let gallery = {};
                for (let i = 0; i < image.length; i++) {
                    gallery = await db.Gallery.create({
                        product_id: product_id,
                        image: image[i].buffer
                    })
                }

                if (gallery) {
                    resolve({
                        statusCode: 200,
                        message: "",
                        data: {
                            product_id: product_id,
                            image: image
                        }
                    })
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

const getAllGallery = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await db.Gallery.findAll({
                order: [['id', 'DESC']],
                attributes: {
                    exclude: [
                        "deleted_at",
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

const updateGallery = (productId, image) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!productId || !image) {
                resolve({
                    statusCode: 400,
                    message: "Không truyền đủ tham số"
                })
            }
            let gallery = await db.Gallery.update({
                product_id: productId,
                image: image
            }, {
                where: {
                    id: id
                }
            });
            let data = {
                id: gallery.id,
                product_id: gallery.product_id
            }
            if (gallery) {
                resolve({
                    statusCode: 200,
                    message: "",
                    data: data
                })
            } else {
                resolve({
                    statusCode: 400,
                    message: "id không tồn tại!"
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}



module.exports = {
    createNewGallery,
    getAllGallery,
    updateGallery
}