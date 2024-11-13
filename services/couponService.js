const db = require("../database/db");

exports.createOrder = async (params) => {
    const {userId, cart} = params;

    if (!cart) throw {message: "cart was not provided", statusCode: 400};
    if (!userId) throw {message: "userId was not provided", statusCode: 400};

    return new Promise((resolve, reject) => {
        db.query(
            `INSERT INTO orders (user_id) VALUES (?)`,
            [userId],
            (err, result) => {
                if (err) reject({message: err, statusCode: 500});

                if (result) {
                    let newOrderId = result.insertId;
                    cart.products.forEach(async (prod) => {
                        db.query(
                            `SELECT p.quantity FROM products p WHERE p.id = ?`,
                            [prod.id],
                            (err, result) => {
                                if (err) reject({message: err, statusCode: 500});

                                let productQuantity = result[0].quantity; // db product

                                // deduct the quantity from products that were ordered in db
                                let updatedQuantity = productQuantity - prod.quantity;
                                if (updatedQuantity > 0) {
                                    productQuantity = updatedQuantity;
                                } else productQuantity = 0;

                                db.query(
                                    `INSERT INTO orders_details (order_id, product_id, quantity) VALUES (?,?,?)`,
                                    [newOrderId, prod.id, prod.quantity],
                                    (err, result) => {
                                        if (err) reject({message: err, statusCode: 500});

                                        db.query(
                                            `UPDATE products SET quantity = ${productQuantity} WHERE id = ${prod.id}`,
                                            (err, result) => {
                                                if (err) reject({message: err, statusCode: 500});
                                                console.log(result);
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    });

                    resolve({
                        message: `Order was successfully placed with order id ${newOrderId}`,
                        orderId: newOrderId,
                        products: cart.products,
                        statusCode: 201,
                    });
                } else {
                    reject({
                        message: "New order failed while adding order details",
                        statusCode: 500,
                    });
                }
            }
        );
    });
};

exports.getSingleOrder = async (params) => {
    const {orderId, userId} = params;

    if (!orderId) throw {message: "orderId was not provided", statusCode: 400};
    if (!userId) throw {message: "userId was not provided", statusCode: 400};

    return new Promise((resolve, reject) => {
        db.query(
            `SELECT * FROM orders INNER JOIN orders_details ON ( orders.id = orders_details.order_id ) WHERE orders.id = ? AND orders.user_id = ?`,
            [orderId, userId],
            (err, result) => {
                if (err) reject({message: err, statusCode: 500});

                if (result.length === 0)
                    reject({message: "order was not found", statusCode: 400});

                resolve({
                    statusCode: 200,
                    message: `Order was found`,
                    data: result,
                });
            }
        );
    });
};

exports.getOrders = async (params) => {
    const {userId} = params;

    if (!userId) throw {message: "userId was not provided", statusCode: 400};

    return new Promise((resolve, reject) => {
        db.query(
            `SELECT * FROM orders INNER JOIN orders_details ON ( orders.id = orders_details.order_id ) WHERE user_id = ?`,
            [userId],
            (err, result) => {
                if (err) reject({message: err, statusCode: 500});

                if (result.length === 0)
                    reject({message: "No order were found", statusCode: 400});

                resolve({
                    statusCode: 200,
                    message: `${result.length} orders were found`,
                    data: result,
                });
            }
        );
    });
};

exports.getCouponById = (id) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM coupons WHERE id = ${id}`, (err, result) => {
            if (err) {
                console.log(err);
                reject({error: "Internal Server Error"});
            } else {
                resolve({data:result[0]});
            }
        });
    });
};

exports.getAllCoupons = () => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM coupons`, (err, result) => {
            if (err) {
                console.log(err);
                reject({error: "Internal Server Error"});
            } else {
                resolve({data: result, total: result.length});
            }
        });
    });
}

exports.createCoupon = (couponData) => {
    return new Promise((resolve, reject) => {
        const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const sqlQuery = `
      INSERT INTO coupons (
        title,
        description,
        code,
        type,
        amount,
        min_spend,
        is_unlimited,
        usage_per_coupon,
        usage_per_customer,
        start_date,
        end_date,
        created_by_id,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s'), STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s'), ?, ?)
    `;

        db.query(
            sqlQuery,
            [
                couponData.title,
                couponData.description,
                couponData.code,
                couponData.type,
                couponData.amount,
                couponData.min_spend,
                couponData.is_unlimited,
                couponData.usage_per_coupon,
                couponData.usage_per_customer,
                couponData.start_date,
                couponData.end_date,
                couponData.created_by_id,
                createdAt
            ],
            (err, result) => {
                if (err) {
                    console.error(err);
                    reject({message: err, statusCode: 500});
                } else {
                    resolve({
                        message: "Coupon created successfully",
                        data: result,
                        statusCode: 201,
                    });
                }
            }
        );
    });
};

exports.updateCoupon = (id, couponData) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `UPDATE coupons SET title = ?,
        description = ?,
        code = ?,
        type = ?,
        amount = ?,
        min_spend = ?,
        is_unlimited = ?,
        usage_per_coupon = ?,
        usage_per_customer = ?,
        start_date = ?,
        end_date = ?,
        updated_at = NOW()
      WHERE id = ?`;

        db.query(sqlQuery, [couponData.title, couponData.description, couponData.code, couponData.type, couponData.amount, couponData.min_spend,
            couponData.is_unlimited, couponData.usage_per_coupon, couponData.usage_per_customer, couponData.start_date, couponData.end_date, id], (err, result) => {
            if (err) {
                console.error(err);
                reject({message: err, statusCode: 500});
            } else {
                resolve({message: "Coupon updated successfully", data: result, statusCode: 200});
            }
        });
    })
};
exports.deleteCoupon = (id) => {
    return new Promise((resolve, reject) => {
        const deleteAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

        db.query(`UPDATE coupons SET status = 0, deleted_at = '${deleteAt}' WHERE id = ${id}`,
            (err, result) => {
                if (err) {
                    console.log(err);
                    reject({error: err});
                } else {
                    const deletedAtFormatted = new Date(deleteAt).toISOString();
                    resolve({data: result});
                }
            });
    });
};