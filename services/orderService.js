const db = require("../database/db");
const { PaymentStatus } = require("../static_data/payment_status");
const orderStatusHelper = require("../helpers/orderStatusHelper");
const countryHelper = require("../helpers/countryHelper");
const stateHelper = require("../helpers/stateHelper");

exports.createOrder = (params) => {
  if (!params.products) throw { message: "No products in order found", statusCode: 400 };

  return new Promise((resolve, reject) => {
    db.query(`INSERT INTO orders (order_number, billing_address_id, shipping_address_id, coupon_id, delivery_description, payment_method, payment_status, order_status_id, amount, tax_total, total, status, consumer_id) 
        VALUES (?, ?, ?, ?, ? ,? ,? ,? ,?, ?, ? ,?, ?)`, [
      params.order_number,
      params.billing_address_id,
      params.shipping_address_id,
      params.coupon_id ? params.coupon_id : null,
      params.delivery_description,
      params.payment_method,
      PaymentStatus.PENDING,
      1,
      params.amount,
      params.tax_total,
      params.total,
      1,
      params.consumer_id
    ], (err, order_insert_result) => {
      if (err) reject({ message: err, statusCode: 500 });

      if (order_insert_result) {
        let newOrderId = order_insert_result.insertId;
        params.products.forEach(async (prod) => {
          db.query(`SELECT p.quantity FROM products p WHERE p.id = ?`, [prod.product_id], (err, result) => {
            if (err) reject({ message: err, statusCode: 500 });

            let productQuantity = result[0].quantity; // db product

            // deduct the quantity from products that were ordered in db
            let updatedQuantity = productQuantity - prod.quantity;
            if (updatedQuantity > 0) {
              productQuantity = updatedQuantity;
            } else productQuantity = 0;

            db.query(`INSERT INTO orders_details (order_id, product_id, quantity) VALUES (?,?,?)`, [newOrderId, prod.product_id, prod.quantity], (err, result) => {
              if (err) reject({ message: err, statusCode: 500 });

              db.query(`UPDATE products SET quantity = ${productQuantity} WHERE id = ${prod.product_id}`, (err, result) => {
                if (err) reject({ message: err, statusCode: 500 });
                // console.log(result);
              });
            });
          });
        });

        resolve({
          message: `Order was successfully placed with order id ${newOrderId}`,
          id: newOrderId,
          statusCode: 201,
        });
      } else {
        reject({
          message: "New order failed while adding order details", statusCode: 500,
        });
      }
    });
  });
};

exports.getSingleOrder = (params) => {
  const { orderId, userId } = params;

  if (!orderId) throw { message: "orderId was not provided", statusCode: 400 };
  if (!userId) throw { message: "userId was not provided", statusCode: 400 };

  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM orders WHERE orders.id = ? AND orders.consumer_id = ?`, [parseInt(orderId), parseInt(userId)], (err, result) => {
      if (err) {
        console.log(err);
        reject({ error: "Internal Server Error" });
      } else {
        // Get list of products to the order detail
        let query = `select p.*, od.quantity as order_quantity from orders_details od
        INNER JOIN products p ON ( p.id = od.product_id ) 
        WHERE od.order_id = ?`

        db.query(query, [parseInt(orderId)], (prod_err, prod_result) => {
          if (prod_err) {
            console.log(prod_err);
            reject({ error: "Internal Server Error" });
          } else {
            result = result.map(x => {
              x.products = prod_result.map(element => {
                element.quantity = element.order_quantity
                element.sub_total = element.order_quantity * element.sale_price
                return element
              });
              return x;
            });

            if (result.length == 0) {
              reject({ error: "Internal Server Error" });
              return false;
            }
            // Get billing address to the order detail
            query = `select * from addresses
            WHERE id = ?`

            db.query(query, [parseInt(result[0].billing_address_id)], (bill_add_err, bill_add_result) => {
              if (bill_add_err) {
                console.log(bill_add_err);
                reject({ error: "Internal Server Error" });
              } else {
                result = result.map(x => {
                  x.billing_address = bill_add_result.length ? bill_add_result.pop() : null;
                  x.billing_address.country = countryHelper.getCountryById(x.billing_address.country_id);
                  x.billing_address.state = stateHelper.getById(x.billing_address.state_id);
                  return x;
                });

                // Get shipping address to the order detail
                query = `select * from addresses
                WHERE id = ?`

                db.query(query, [parseInt(result[0].shipping_address_id)], (ship_add_err, ship_add_result) => {
                  if (ship_add_err) {
                    console.log(ship_add_err);
                    reject({ error: "Internal Server Error" });
                  } else {
                    result = result.map(x => {
                      x.shipping_address = ship_add_result.length ? ship_add_result.pop() : null;
                      x.shipping_address.country = countryHelper.getCountryById(x.shipping_address.country_id);
                      x.shipping_address.state = stateHelper.getById(x.shipping_address.state_id);
                      return x;
                    });

                    result = result.map(x => {
                      x.order_status = result[0].order_status_id ? orderStatusHelper.getById(result[0].order_status_id) : null;
                      return x;
                    });

                    result = result.map(x => {
                      x.sub_orders = [];
                      return x;
                    });

                    resolve({ data: result, total: result.length });
                  }
                });
                //END: Get shipping address to the order detail
              }
            });
            //END: Get billing address to the order detail
          }
        });

      }
    });
  });
};

exports.getSingleOrderAdmin = (params) => {
  const { orderId, userId } = params;

  if (!orderId) throw { message: "orderId was not provided", statusCode: 400 };
  if (!userId) throw { message: "userId was not provided", statusCode: 400 };

  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM orders WHERE orders.id = ?`, [parseInt(orderId)], (err, result) => {
      if (err) {
        console.log(err);
        reject({ error: "Internal Server Error" });
      } else {
        // Get list of products to the order detail
        let query = `select p.*, od.quantity as order_quantity from orders_details od
        INNER JOIN products p ON ( p.id = od.product_id ) 
        WHERE od.order_id = ?`

        db.query(query, [parseInt(orderId)], (prod_err, prod_result) => {
          if (prod_err) {
            console.log(prod_err);
            reject({ error: "Internal Server Error" });
          } else {
            result = result.map(x => {
              x.products = prod_result.map(element => {
                element.quantity = element.order_quantity
                element.sub_total = element.order_quantity * element.sale_price
                return element
              });
              return x;
            });

            if (result.length == 0) {
              reject({ error: "Internal Server Error" });
              return false;
            }
            // Get billing address to the order detail
            query = `select * from addresses
            WHERE id = ?`

            db.query(query, [parseInt(result[0].billing_address_id)], (bill_add_err, bill_add_result) => {
              if (bill_add_err) {
                console.log(bill_add_err);
                reject({ error: "Internal Server Error" });
              } else {
                result = result.map(x => {
                  x.billing_address = bill_add_result.length ? bill_add_result.pop() : null;
                  x.billing_address.country = countryHelper.getCountryById(x.billing_address.country_id);
                  x.billing_address.state = stateHelper.getById(x.billing_address.state_id);
                  return x;
                });

                // Get shipping address to the order detail
                query = `select * from addresses
                WHERE id = ?`

                db.query(query, [parseInt(result[0].shipping_address_id)], (ship_add_err, ship_add_result) => {
                  if (ship_add_err) {
                    console.log(ship_add_err);
                    reject({ error: "Internal Server Error" });
                  } else {
                    result = result.map(x => {
                      x.shipping_address = ship_add_result.length ? ship_add_result.pop() : null;
                      x.shipping_address.country = countryHelper.getCountryById(x.shipping_address.country_id);
                      x.shipping_address.state = stateHelper.getById(x.shipping_address.state_id);
                      return x;
                    });

                    result = result.map(x => {
                      x.order_status = result[0].order_status_id ? orderStatusHelper.getById(result[0].order_status_id) : null;
                      return x;
                    });

                    result = result.map(x => {
                      x.sub_orders = [];
                      return x;
                    });

                    resolve({ data: result, total: result.length });
                  }
                });
                //END: Get shipping address to the order detail
              }
            });
            //END: Get billing address to the order detail
          }
        });

      }
    });
  });
};

exports.getOrders = async (params) => {
  const { userId, page, paginate } = params;
  let query = `SELECT * FROM orders WHERE consumer_id = ?`;
  let offsetValue = 0;

  if (!userId) throw { message: "userId was not provided", statusCode: 400 };

  if (page > 0) {
    offsetValue = (page - 1) * paginate;
    query += ` LIMIT ${paginate} OFFSET ${offsetValue}`;
  }
  else {
    if (paginate) query += ` LIMIT ${paginate}`;
  }
  return new Promise((resolve, reject) => {
    db.query(query, [userId], (err, result) => {
      if (err) {
        console.log(err);
        reject({ error: "Internal Server Error" });
      } else {
        resolve({ data: result, total: result.length });
      }
    });
  });
};

exports.getOrdersAdmin = async (params) => {
  const { userId, page, paginate } = params;
  let query = `SELECT * FROM orders`;
  let offsetValue = 0;

  if (!userId) throw { message: "userId was not provided", statusCode: 400 };

  if (page > 0) {
    offsetValue = (page - 1) * paginate;
    query += ` LIMIT ${paginate} OFFSET ${offsetValue}`;
  }
  else {
    if (paginate) query += ` LIMIT ${paginate}`;
  }
  return new Promise((resolve, reject) => {
    db.query(query, [], (err, result) => {
      if (err) {
        console.log(err);
        reject({ error: "Internal Server Error" });
      } else {
        resolve({ data: result, total: result.length });
      }
    });
  });
};

exports.getAllOrders = () => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM orders`, (err, result) => {
      if (err) {
        console.log(err);
        reject({ error: "Internal Server Error" });
      } else {
        resolve({ data: result, total: result.length });
      }
    });
  });
}

exports.updateOrder = (id, orderData) => {

  // if (!orderId) throw {message: "orderId was not provided", statusCode: 400};
  return new Promise((resolve, reject) => {
    const sqlQuery = `UPDATE orders SET order_number = ?, 
            amount = ?, 
            consumer_id = ?, 
            products = ?,
             coupon_id = ?,
             billing_address_id = ?,
             shipping_address_id = ?,
             order_status_id = ?,
             payment_method = ?,
             payment_status = ?,
            tax_total = ?,
            total = ?,
            delivery_description = ?,
            parent_id = ?,
            status = ?,
            invoice_url = ?,
            created_by_id = ?,
            updated_at = NOW()
             WHERE id = ?`
    db.query(sqlQuery, [orderData.order_number, orderData.amount, orderData.consumer_id, orderData.products, orderData.coupon_id, orderData.billing_address_id, orderData.shipping_address_id, orderData.order_status_id, orderData.payment_method, orderData.payment_status, orderData.tax_total, orderData.total, orderData.delivery_description, orderData.parent_id, orderData.status, orderData.invoice_url, orderData.created_by_id, id], (err, result) => {
      if (err) {
        console.error(err);
        reject({ message: err, statusCode: 500 });
      } else {
        resolve({ message: "Order updated successfully", data: result, statusCode: 200 });
      }
    });
  });
};

exports.deleteOrder = (orderId) => {
  return new Promise((resolve, reject) => {
    db.query(`UPDATE orders SET status = 0, deleted_at = NOW() WHERE id = ?`, [orderId], (err, result) => {
      if (err) {
        console.error(err);
        reject({ message: err, statusCode: 500 });
      } else {
        resolve({ message: "Order deleted successfully", data: result, statusCode: 200 });
      }
    });
  });
}

exports.updateOrderPaymentStatus = (params) => {

  // if (!orderId) throw {message: "orderId was not provided", statusCode: 400};
  return new Promise((resolve, reject) => {
    let sqlQuery = `UPDATE orders SET payment_status = ?, order_status_id = ?
           WHERE order_number = ?`
    db.query(sqlQuery, [params.payment_status, params.order_status_id, params.order_number], (err, result) => {
      if (err) {
        console.error(err);
        reject({ message: err, statusCode: 500 });
      } else {
        sqlQuery = `select id from orders WHERE order_number = ?`;
        // Get order Id
        db.query(sqlQuery, [params.order_number], (get_order_err, get_order_result) => {
          if (get_order_err) {
            console.error(get_order_err);
            reject({ message: get_order_err, statusCode: 500 });
          } else {
            resolve({ message: "Order updated successfully", data: get_order_result.length ? get_order_result[0].id : null, statusCode: 200 });
          }
        });
      }
    });
  });
};