const variationService = require("../services/variationService");
exports.get_all_variations = (req, res) => {
    variationService.getAllVariations()
        .then(result => {
            const {data, total} = result;
            res.json({data, total});
        })
        .catch(error => {
            res.status(500).json(error);
        });
}

exports.get_variation_by_id = (req, res) => {
    const {id} = req.params;
    variationService.getVariationById(id)
        .then(result => {
            res.json({data: result});
        })
        .catch(error => {
            res.status(500).json(error);
        });
}

exports.create_variation = (req, res) => {
    const variationData = req.body;
    variationService.createVariation(variationData)
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.json(error);
        });
}

exports.update_variation = (req, res) => {
    const {id} = req.params;
    const variationData = req.body;
    variationService.updateVariation(id, variationData)
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.json(error);
        });
}

exports.delete_variation = (req, res) => {
    const {id} = req.params;
    variationService.deleteVariation(id)
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.json(error);
        });
}