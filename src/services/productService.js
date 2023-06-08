
import db from '../models';
import { Op, where } from 'sequelize';
require('dotenv').config();
import jwt from 'jsonwebtoken';

const createNewProduct = (category_id, title, price, discount, description, image) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!category_id || !title || !price || !discount || !description || !image) {
                resolve({
                    statusCode: 400,
                    message: "Chưa nhập đủ tham số",
                })
            } else {
                const product = await db.Product.create({
                    category_id: category_id,
                    title: title,
                    price: price,
                    discount: discount,
                    description: description,
                    image: image
                })

                if (product) {
                    resolve({
                        statusCode: 200,
                        message: "",
                        data: {
                            category_id: category_id,
                            title: title,
                            price: price,
                            discount: discount,
                            description: description,
                        }
                    })
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

const getAllProduct = () => {
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

const getAllProductPaginate = ({ current, pageSize, order, category_id, title, price, discount, description, createdAt, updatedAt, ...query }) => {
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
            let categoryIds = category_id;
            if (category_id && typeof category_id === 'string') {
                const categoryIdList = categoryIds.split(",");
                where.category_id = {
                    [Op.in]: categoryIdList
                };
            }
            if (title) {
                where.title = {
                    [Op.substring]: title
                };
            }
            const priceRange = price;
            if (priceRange) {
                const [minPrice, maxPrice] = priceRange.split('-');
                where.price = {
                    [Op.between]: [minPrice, maxPrice]
                };
            }

            if (discount) {
                where.discount = {
                    [Op.substring]: discount
                };
            }


            if (description) {
                where.description = {
                    [Op.substring]: description
                };
            }

            if (description) {
                where.description = {
                    [Op.substring]: description
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

            let product = await db.Product.findAll({
                ...queries,
                where: {
                    ...query,
                    ...where,
                },
            });
            const total = await db.Product.count();
            const pages = Math.ceil(total / pageSize); // Tổng số trang
            const meta = {
                current: +current,
                pageSize: +pageSize,
                pages: pages,
                total: total
            };

            let result = product;
            for (let i = 0; i < result.length; i++) {
                if (result[i].image) {
                    result[i].image = await new Buffer.from(result[i].image, 'binary').toString('base64');
                } else {
                    result[i].image = '';
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

const updateProduct = (title, price, description) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!title || !price || !description) {
                resolve({
                    statusCode: 400,
                    message: "Không truyền đủ tham số"
                })
            }
            let product = await db.Product.update({
                title: title,
                price: price,
                description: description
            }, {
                where: {
                    id: id
                }
            });
            let data = {
                title: product.title,
                price: product.price,
                description: product.description
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

let deleteProduct = (token, id) => {
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

let getDetailProductById = (id) => {
    return new Promise(async (resolve, reject) => {
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
            if (dataProduct && dataProduct.image) {
                dataProduct.image = await new Buffer.from(dataProduct.image, 'binary').toString('base64');
            }

            let dataGalery = await db.Galery.findAll({
                where: {
                    product_id: id
                },
                attributes: ["image"],
                raw: true,
                nest: true
            })
            if (dataGalery) {
                for (let i = 0; i < dataGalery.length; i++) {
                    if (dataGalery[i].image) {
                        dataGalery[i].image = await new Buffer.from(dataGalery[i].image, 'binary').toString('base64');
                    } else {
                        dataGalery[i].image = '';
                    }
                }
            }
            const data = {
                dataProduct: dataProduct,
                dataGalery: dataGalery
            }

            resolve({
                data: data
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