const imageService = require("../services/imageService");
exports.create_image = (req, res) => {
    const imageData = req.body; // Giả sử thông tin coupon được gửi trong body của request

    imageService.createImage(imageData)
        .then(result => {
            res.status(result.statusCode).json(result);
        })
        .catch(error => {
            res.status(error.statusCode || 500).json(error);
        });
};

exports.get_image_by_id = (req, res) => {
    const {id} = req.params;
    imageService
        .getImageById(id)
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.json(error);
        });
};

exports.update_image = (req, res) => {
    const {id} = req.params;
    const imageData = req.body;

    imageService
        .updateImage(id, imageData)
        .then(result => {
            res.status(result.statusCode).json(result);
        })
        .catch(error => {
            res.status(error.statusCode || 500).json(error);
        });
};

exports.delete_image = (req, res) => {
    const {id} = req.params;
    imageService
        .deleteImage(id)
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.json(error);
        });
}