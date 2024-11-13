const attributeService = require("../services/attributeService");

exports.get_all_attributes = (req, res, next) => {
    attributeService.getAllAttributes()
        .then((result) => {
            const { message, data } = result;
            res.status(200).send({ message, data });
        })
        .catch((err) => {
            const { statusCode = 400, message } = err;
            res.status(statusCode).send({ message });
        });
};

exports.get_attribute_by_id = (req, res, next) => {
    const { id } = req.params;
    attributeService.getAttributeById(id)
        .then(result => {
            res.json({ data: result });
        })
        .catch(error => {
            res.status(500).json(error);
        });
};

exports.create_attribute = (req, res, next) => {
    const attributeData = req.body;
    attributeService.createAttribute(attributeData)
        .then((result) => {
            const { message, data } = result;
            res.status(200).send({ message, data });
        })
        .catch((err) => {
            const { statusCode = 400, message } = err;
            res.status(statusCode).send({ message });
        });
}

exports.update_attribute = (req, res, next) => {
    const attributeData = req.body;
    const { id } = req.params;
    attributeService.updateAttribute(id, attributeData)
        .then(result => {
            res.json({ data: result });
        })
        .catch(error => {
            res.status(500).json(error);
        });
}

exports.delete_attribute = (req, res, next) => {
    const { id } = req.params;
    attributeService.deleteAttribute(id)
        .then((result) => {
            const { message, data } = result;
            res.status(200).send({ message, data });
        })
        .catch((err) => {
            const { statusCode = 400, message } = err;
            res.status(statusCode).send({ message });
        });
}