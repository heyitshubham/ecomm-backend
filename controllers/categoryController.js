const {
    getOrders,
    getSingleOrder,
    createOrder,
} = require("../services/orderService");
const categoryService = require('../services/categoryService');


exports.create_order = async (req, res, next) => {
    const {userId, cart} = req.body;
    createOrder({userId, cart})
        .then((result) => {
            res.status(result.statusCode).send({...result});
        })
        .catch((err) => {
            const {statusCode = 400, message} = err;
            res.status(statusCode).send({message}) && next(err);
        });
};

exports.get_single_order = async (req, res, next) => {
    const {orderId, userId} = req.query;
    getSingleOrder({orderId, userId})
        .then((result) => {
            const {message, data} = result;
            res.status(200).send({message, data});
        })
        .catch((err) => {
            const {statusCode = 400, message} = err;
            res.status(statusCode).send({message}) && next(err);
        });
};

exports.get_orders = async (req, res, next) => {
    const {userId} = req.query;
    getOrders({userId})
        .then((result) => {
            const {message, data} = result;
            res.status(200).send({message, data});
        })
        .catch((err) => {
            const {statusCode = 400, message} = err;
            res.status(statusCode).send({message}) && next(err);
        });
};

exports.get_all_categories = (req, res) => {
    categoryService.getAllCategories()
        .then(result => {
            const {data, total} = result;
            res.json({data, total})
        })
        .catch((err) => {
            res.status(500).json(err);
        });
};

exports.get_category_by_id = (req, res) => {
    const {id} = req.params;
    categoryService.getCategoryById(id)
        .then(result => {
            res.json({data: result});
        })
        .catch(err => {
            res.status(500).json(err);
        });
}

exports.create_category = (req, res) => {
    const category = req.body;
    categoryService.createCategory(category)
        .then(result => {
            res.status(result.statusCode).json(result);
        })
        .catch(err => {
            res.status(500).json(err);
        });
}

exports.update_category = (req, res) => {
    const category = req.body;
    categoryService.updateCategory(category)
        .then(result => {
            res.status(result.statusCode).json(result);
        })
        .catch(err => {
            res.status(500).json(err);
        });
}

exports.delete_category = (req, res) => {
    categoryService.deleteCategory(req.body)
        .then(result => {
            res.send({result, message: "Success!"});
        })
        .catch(err => {
            res.status(500).json(err);
        });
}