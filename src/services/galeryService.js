
import db from '../models';
import { Op, where } from 'sequelize';
require('dotenv').config();
import jwt from 'jsonwebtoken';

const createNewGalery = (productId, image) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!productId || !image) {
                resolve({
                    statusCode: 400,
                    message: "Chưa nhập đủ tham số",
                })
            } else {
                const galery = await db.Galery.create({
                    product_id: productId,
                    image: image
                })

                if (galery) {
                    resolve({
                        statusCode: 200,
                        message: "",
                        data: {
                            product_id: productId,
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

const getAllGalery = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await db.Galery.findAll({
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

const updateGalery = (productId, image) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!productId || !image) {
                resolve({
                    statusCode: 400,
                    message: "Không truyền đủ tham số"
                })
            }
            let galery = await db.Galery.update({
                product_id: productId,
                image: image
            }, {
                where: {
                    id: id
                }
            });
            let data = {
                id: galery.id,
                product_id: galery.product_id
            }
            if (galery) {
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
    createNewGalery,
    getAllGalery,
    updateGalery
}