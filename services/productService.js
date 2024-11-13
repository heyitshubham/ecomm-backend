const db = require("../database/db");
const moment = require('moment');

exports.createOrder = async (params) => {
    const { userId, cart } = params;

    if (!cart) throw { message: "cart was not provided", statusCode: 400 };
    if (!userId) throw { message: "userId was not provided", statusCode: 400 };

    return new Promise((resolve, reject) => {
        db.query(
            `INSERT INTO orders (user_id) VALUES (?)`,
            [userId],
            (err, result) => {
                if (err) reject({ message: err, statusCode: 500 });

                if (result) {
                    let newOrderId = result.insertId;
                    cart.products.forEach(async (prod) => {
                        db.query(
                            `SELECT p.quantity FROM products p WHERE p.id = ?`,
                            [prod.id],
                            (err, result) => {
                                if (err) reject({ message: err, statusCode: 500 });

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
                                        if (err) reject({ message: err, statusCode: 500 });

                                        db.query(
                                            `UPDATE products SET quantity = ${productQuantity} WHERE id = ${prod.id}`,
                                            (err, result) => {
                                                if (err) reject({ message: err, statusCode: 500 });
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
    const { orderId, userId } = params;

    if (!orderId) throw { message: "orderId was not provided", statusCode: 400 };
    if (!userId) throw { message: "userId was not provided", statusCode: 400 };

    return new Promise((resolve, reject) => {
        db.query(
            `SELECT * FROM orders INNER JOIN orders_details ON ( orders.id = orders_details.order_id ) WHERE orders.id = ? AND orders.user_id = ?`,
            [orderId, userId],
            (err, result) => {
                if (err) reject({ message: err, statusCode: 500 });

                if (result.length === 0)
                    reject({ message: "order was not found", statusCode: 400 });

                resolve({
                    statusCode: 200,
                    message: `Order was found`,
                    data: result,
                });
            }
        );
    });
};

exports.getProducts = async (params) => {
    const { userId } = params;

    if (!userId) throw { message: "userId was not provided", statusCode: 400 };

    return new Promise((resolve, reject) => {
        db.query(
            `SELECT * FROM orders INNER JOIN orders_details ON ( orders.id = orders_details.order_id ) WHERE user_id = ?`,
            [userId],
            (err, result) => {
                if (err) reject({ message: err, statusCode: 500 });

                if (result.length === 0)
                    reject({ message: "No order were found", statusCode: 400 });

                resolve({
                    statusCode: 200,
                    message: `${result.length} orders were found`,
                    data: result,
                });
            }
        );
    });
};

exports.getAllProducts = async () => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM products`, (err, result) => {
            if (err) reject({ message: err, statusCode: 500 });

            resolve({
                statusCode: 200,
                message: `${result.length} products were found`,
                data: result,
            });
        });
    });
};

exports.getProductById = (id) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM products WHERE id = ${id}`, (err, result) => {
            if (err) reject({ message: err, statusCode: 500 });
            if (result.length === 0)
                reject({ message: "Product was not found", statusCode: 400 });

            resolve({
                statusCode: 200,
                message: `Product was found`,
                data: result[0],
            });
        });
    });
};

exports.createProduct = (product) => {
    const { categories, related_products, cross_sell_products, description, discount, encourage_order, encourage_view, estimated_delivery_text, is_featured, is_free_shipping, is_random_related_products, is_return, is_sale_enable, is_trending, meta_description, meta_title, name, price, product_galleries_id, product_meta_image_id, product_thumbnail_id, quantity, return_policy_text, safe_checkout, sale_expired_at, sale_starts_at, secure_checkout, short_description, sku, social_share, status, stock_status, tax_id, type, unit, weight } = product;

    const sale_expired_at_formatted = moment(new Date(sale_expired_at)).format("YYYY-MM-DD");
    const sale_starts_at_formatted = moment(new Date(sale_starts_at)).format("YYYY-MM-DD")
    let sale_price = 0;
    if(discount)
        sale_price = price - price*discount/100;

    return new Promise((resolve, reject) => {
        db.query(
            `INSERT INTO products (description, discount, encourage_order, encourage_view, estimated_delivery_text, is_featured, is_free_shipping, is_random_related_products, is_return, is_sale_enable, is_trending, meta_description, meta_title, name, price, product_meta_image_id, product_thumbnail_id, quantity, return_policy_text, safe_checkout, sale_expired_at, sale_starts_at, secure_checkout, short_description, sku, social_share, status, stock_status, tax_id, type, unit, weight, sale_price) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [description, discount, encourage_order, encourage_view, estimated_delivery_text, is_featured, is_free_shipping, is_random_related_products, is_return, is_sale_enable, is_trending, meta_description, meta_title, name, price, product_meta_image_id, product_thumbnail_id, quantity, return_policy_text, safe_checkout, sale_expired_at_formatted, sale_starts_at_formatted, secure_checkout, short_description, sku, social_share, status, stock_status, tax_id, type, unit, weight, sale_price],
            (err, result) => {
                if (err) {
                    console.error(err);
                    reject({ message: err, statusCode: 500 });
                } else {
                    const product_id = result.insertId;

                    if (categories.length) {
                        const arrValue = [];
                        categories.forEach(x => { arrValue.push(`(${product_id}, ${x})`) })
                        db.query(
                            `INSERT INTO product_category (product_id, category_id) VALUES ${arrValue.join(',')}`,
                            [],
                            (err, result) => {
                                if (err) {
                                    console.error(err);
                                    reject({ message: err, statusCode: 500 });
                                }
                            });
                    }
                    let arrValue = [];
                    if (related_products != null){
                        if (related_products.length) {
                            related_products.forEach(x => {
                                if (cross_sell_products.indexOf(x) >= 0)
                                    arrValue.push(`(${product_id}, ${x}, 1, 1)`);
                                else
                                    arrValue.push(`(${product_id}, ${x}, 1, 0)`);
                            })
                        }
                    }
                    if(cross_sell_products != null){

                        if (cross_sell_products.length) {
                            cross_sell_products.forEach(x => {
                                if (related_products.indexOf(x) < 0)
                                    arrValue.push(`(${product_id}, ${x}, 0, 1)`);
                            })
                        }
                    }
                    db.query(
                        `INSERT INTO products_related (parent_id, child_id, is_related, is_cross_sell) VALUES ${arrValue.join(',')}`,
                        [],
                        (err, result) => {
                            if (err) {
                                console.error(err);
                                reject({ message: err, statusCode: 500 });
                            }
                        });

                    if(product_galleries_id != null){

                    if (product_galleries_id.length) {
                        arrValue = [];
                        product_galleries_id.forEach(x => { arrValue.push(`(${product_id}, ${x}, 1)`) })
                        db.query(
                            `INSERT INTO product_images (product_id, image_id, is_product_galleries) VALUES ${arrValue.join(',')}`,
                            [],
                            (err, result) => {
                                if (err) {
                                    console.error(err);
                                    reject({ message: err, statusCode: 500 });
                                }
                            });
                    }
                }

                    resolve({
                        message: "Category created successfully",
                        data: result,
                        statusCode: 201,
                    });
                }
            }
        );
    });
}

exports.updateProduct = (id, product) => {
    return new Promise((resolve, reject) => {
        db.query(
            `UPDATE products SET title = ?, name = ?, description = ?, price = ?, quantity = ?, status = ?, image = ?, short_desc = ? WHERE id = ?`,
            [product.title, product.name, product.description, product.price, product.quantity, product.status, product.image, product.short_desc, id],
            (err, result) => {
                if (err) reject({ message: err, statusCode: 500 });
                else resolve({ message: "Product was updated successfully", statusCode: 200 });
            }
        );
    });
}

exports.deleteProduct = (id) => {
    return new Promise((resolve, reject) => {
        db.query(
            `UPDATE products SET status = 0 WHERE id = ?`,
            [id],
            (err, result) => {
                if (err) reject({ message: err, statusCode: 500 });
                else resolve({ message: "Product was deleted successfully", statusCode: 200 });
            }
        );
    });
}