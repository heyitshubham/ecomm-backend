const couponService = require('../services/couponService');

exports.get_all_coupons = (req, res) => {

    couponService.getAllCoupons()
        .then(result => {
            const {data, total} = result;
            res.json({ data, total });
        })
        .catch(error => {
            res.status(500).json(error);
        });
};

exports.get_coupon_by_id = (req, res) => {
    const { id } = req.params;

    couponService.getCouponById(id)
        .then(result => {
            res.json({ data: result });
        })
        .catch(error => {
            res.status(500).json(error);
        });
};

exports.create_coupon = (req, res) => {
    const couponData = req.body; // Giả sử thông tin coupon được gửi trong body của request

    couponService.createCoupon(couponData)
        .then(result => {
            res.status(result.statusCode).json(result);
        })
        .catch(error => {
            res.status(error.statusCode || 500).json(error);
        });
};

exports.update_coupon = (req, res) => {
    const { id } = req.params;
    const couponData = req.body; // Giả sử thông tin coupon được gửi trong body của request

    couponService.updateCoupon(id, couponData)
        .then(result => {
            res.status(result.statusCode).json(result);
        })
        .catch(error => {
            res.status(error.statusCode || 500).json(error);
        });
};

exports.delete_coupon = async (req, res) => {
    const { id } = req.params;

    couponService.deleteCoupon(id)
        .then(result => {
            res.json({ data: result });
        })
        .catch(error => {
            res.status(500).json(error);
        });
}