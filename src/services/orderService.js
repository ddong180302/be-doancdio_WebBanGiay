
import db from '../models';
import { Op, where } from 'sequelize';
require('dotenv').config();
import jwt from 'jsonwebtoken';

const createAnOrder = (user_id, email, fullName, address, note, phone, total_money, detail) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!user_id || !email || !fullName || !fullName || !phone || !total_money || !detail) {
                resolve({
                    statusCode: 400,
                    message: "Chưa nhập đủ tham số",
                })
            } else {
                let order = await db.Order.create({
                    user_id: user_id,
                    fullName: fullName,
                    email: email,
                    phone: phone,
                    address: address,
                    note: note,
                    order_date: new Date(),
                    status: "PENDING",
                    total_money: total_money,
                })

                if (order) {
                    for (let i = 0; i < detail.length; i++) {
                        await db.Order_Detail.create({
                            order_id: order.id,
                            product_id: detail[i].product_id,
                            price: detail[i].price,
                            quantity: detail[i].quantity,
                            total_money: detail[i].total_money,
                        })

                        await db.Product.update({
                            sold: +detail[i].sold + +detail[i].quantity
                        }, {
                            where: {
                                id: detail[i].product_id
                            }
                        });
                    }

                    let history = await db.History.create({
                        user_id: user_id,
                        user_name: fullName,
                        user_email: email,
                        user_phone: phone,
                        total_money: total_money,
                    })
                    if (history) {
                        for (let i = 0; i < detail.length; i++) {
                            await db.History_Detail.create({
                                history_id: history.id,
                                product_name: detail[i].product_name,
                                product_quantity: detail[i].quantity,
                            })
                        }
                    }
                }


                if (order) {
                    resolve({
                        statusCode: 200,
                        message: "",
                        data: {
                            user_id: order.user_id,
                            fullName: order.fullName,
                            email: order.email,
                            phone: order.phone,
                            address: order.address,
                            note: order.note,
                            order_date: order.order_date,
                            status: order.status,
                            total_money: order.total_money,
                        }
                    })
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    createAnOrder,

}