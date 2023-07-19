
import db from '../models';
import { Op, where } from 'sequelize';
require('dotenv').config();
import jwt from 'jsonwebtoken';

export const createNewProduct = (category_id, name, price, quantity, sold, thumbnail) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!category_id || !name || !price || !quantity || !sold || !thumbnail) {
                resolve({
                    statusCode: 400,
                    message: "Chưa nhập đủ tham số",
                })
            } else {
                const product = await db.Product.create({
                    category_id: category_id,
                    name: name,
                    price: price,
                    quantity: quantity,
                    sold: sold,
                    thumbnail: thumbnail
                })

                if (product) {
                    resolve({
                        statusCode: 200,
                        message: "",
                        data: {
                            product_id: product.id,
                            category_id: product.category_id,
                            name: product.name,
                            price: product.price,
                            quantity: product.quantity,
                            sold: product.sold
                        }
                    })
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

export const getAllProduct = () => {
    return new Promise(async (resolve, reject) => {
        try {

            let data = await db.Product.findAll({
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
                if (data[i].thumbnail) {
                    data[i].thumbnail = await new Buffer.from(data[i].thumbnail, 'binary').toString('base64');
                } else {
                    data[i].thumbnail = '';
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

export const getAllProductPaginate = ({ current, pageSize, order, category_id, name, price, quantity, sold, createdAt, updatedAt, ...query }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let limit = +pageSize || process.env.LIMIT_USER;
            console.log(limit);
            let offset = (!current || +current <= 1) ? 0 : (+current - 1) * limit;
            console.log(offset);

            const where = {};
            let categoryIds = category_id;
            if (category_id && typeof category_id === 'string') {
                const categoryIdList = categoryIds.split(",");
                where.category_id = {
                    [Op.in]: categoryIdList
                };
            }
            if (name) {
                where.name = {
                    [Op.substring]: name
                };
            }
            const priceRange = price;
            if (priceRange) {
                const [minPrice, maxPrice] = priceRange.split('-');
                where.price = {
                    [Op.between]: [minPrice, maxPrice]
                };
            }

            if (quantity) {
                where.quantity = {
                    [Op.substring]: quantity
                };
            }

            if (sold) {
                where.sold = {
                    [Op.substring]: sold
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
            let product = await db.Product.findAndCountAll({
                raw: true,
                nest: true,
                attributes: { exclude: ["deleted_at"] },
                where: { ...query, ...where },
                order: [[order?.split(' ')[0], order?.split(' ')[1]]],
                limit,
                offset
            });
            console.log(product)
            const total = await db.Product.count();
            const pages = Math.ceil(total / pageSize); // Tổng số trang
            const meta = {
                current: +current,
                pageSize: +pageSize,
                pages: pages,
                total: total
            };

            const result = product.rows || [];
            for (let i = 0; i < result.length; i++) {
                if (result[i].thumbnail) {
                    result[i].thumbnail = await new Buffer.from(result[i].thumbnail, 'binary').toString('base64');
                } else {
                    result[i].thumbnail = '';
                }
            }

            for (let i = 0; i < result.length; i++) {
                if (result[i].category_id) {
                    let name = await db.Category.findOne({
                        where: {
                            id: result[i].category_id
                        }
                    })
                    if (name)
                        result[i].category_id = name.name
                } else {
                    result[i].category_id = '';
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

export const updateProduct = (id, name, price, quantity) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id || !name || !price || !quantity) {
                resolve({
                    statusCode: 400,
                    message: "Không truyền đủ tham số"
                })
            }

            let product = await db.Product.findOne({
                where: {
                    id: id
                }
            })
            if (product) {
                await db.Product.update({
                    name: name,
                    price: price,
                    quantity: quantity,
                }, {
                    where: {
                        id: id
                    }
                });
            }
            let data = {
                name: product.name,
                price: product.price,
                quantity: product.quantity
            }
            if (product) {
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

export const deleteProduct = (token, id) => {
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
            let product = await db.Product.findOne({
                where: { id: id }
            })

            if (!product) {
                resolve({
                    statusCode: 400,
                    message: `the product isn't exist`
                })
            }

            await db.Product.destroy({
                where: {
                    id: id
                }
            });
            resolve({
                statusCode: 200,
                message: 'delete the product successds!',
                data: {
                    acknowledged: true,
                    deletedCount: product.length
                }
            });
        } catch (e) {
            reject(e)
        }
    })
}

export const getDetailProductById = (id) => {
    return new Promise(async (resolve, reject) => {
        console.log("check id: ", id)
        try {
            if (!id) {
                resolve({
                    statusCode: 400,
                    message: "Không truyền đủ tham số"
                })
            }
            let dataProduct = await db.Product.findOne({
                where: {
                    id: id
                },
                raw: true,
                nest: true
            })
            if (dataProduct && dataProduct.thumbnail) {
                dataProduct.thumbnail = await new Buffer.from(dataProduct.thumbnail, 'binary').toString('base64');
            }

            let dataGallery = await db.Gallery.findAll({
                where: {
                    product_id: id
                },
                attributes: ["image"],
                raw: true,
                nest: true
            })
            if (dataGallery) {
                for (let i = 0; i < dataGallery.length; i++) {
                    if (dataGallery[i].image) {
                        dataGallery[i].image = await new Buffer.from(dataGallery[i].image, 'binary').toString('base64');
                    } else {
                        dataGallery[i].image = '';
                    }
                }
            }
            const data = {
                dataProduct,
                dataGallery
            }
            resolve({
                statusCode: 200,
                message: '',
                data
            })

        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    createNewProduct,
    getAllProduct,
    getAllProductPaginate,
    updateProduct,
    deleteProduct,
    getDetailProductById

}