const {
  getOrders,
  getSingleOrder,
  createOrder, getAllOrders,
  getSingleOrderAdmin
} = require("../services/orderService");
const orderService = require("../services/orderService");
const { PaymentStatus } = require("../static_data/payment_status");

exports.create_order = async (req, res, next) => {
  return createOrder(req.body)
};

exports.get_single_order = (req, res, next) => {
  const { orderId, userId } = req.query;
  getSingleOrder({ orderId, userId })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      const { statusCode = 400, message } = err;
      res.status(statusCode).send({ message }) && next(err);
    });
};

exports.get_single_order_admin = (req, res, next) => {
  const { orderId, userId } = req.query;
  getSingleOrderAdmin({ orderId, userId })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      const { statusCode = 400, message } = err;
      res.status(statusCode).send({ message }) && next(err);
    });
};

exports.get_orders = async (req, res, next) => {
  const { userId, page , paginate } = req.query;
  getOrders({ userId, page , paginate })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      const { statusCode = 400, message } = err;
      res.status(statusCode).send({ message }) && next(err);
    });
};

exports.get_orders_admin = async (req, res, next) => {
  const { userId, page , paginate } = req.query;
  orderService.getOrdersAdmin({ userId, page , paginate })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      const { statusCode = 400, message } = err;
      res.status(statusCode).send({ message }) && next(err);
    });
};

exports.get_all_orders = async (req, res, next) => {
  getAllOrders()
    .then((result) => {
      const { message, data } = result;
      res.status(200).json(result);
    })
    .catch((err) => {
      const { statusCode = 400, message } = err;
      res.status(statusCode).send({ message }) && next(err);
    });
};

exports.update_order = (req, res) => {
  const { id } = req.params;
  const orderData = req.body;
  orderService.updateOrder(id, orderData)
    .then(result => {
      res.status(result.statusCode).json(result);
    })
    .catch((err) => {
      res.status(err.statusCode || 500).json(err);

    });
};

exports.delete_order = (req, res) => {
  const { id } = req.params;
  orderService.deleteOrder(id)
    .then(result => {
      res.status(result.statusCode).json(result);
    })
    .catch((err) => {
      res.status(err.statusCode || 500).json(err);
    });
};

exports.update_order_payment_status = (order_number) => {
  return orderService.updateOrderPaymentStatus({ order_number: order_number, payment_status: PaymentStatus.COMPLETED, order_status_id: 2 })
};