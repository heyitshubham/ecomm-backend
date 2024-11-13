const taxService = require("../services/taxService");

exports.get_all_taxes = (req, res) => {
    taxService
        .getAllTaxes()
        .then((result) => {
            const { data, total } = result;
            res.json({ data, total });
        })
        .catch((error) => {
            res.status(500).json(error);
        });
}

exports.get_tax_by_id = (req, res) => {
    const { id } = req.params;
    taxService
        .getTaxById(id)
        .then((result) => {
            res.json({ data: result });
        })
        .catch((error) => {
            res.status(500).json(error);
        });
}

exports.create_tax = (req, res) => {
    const taxData = req.body;
    taxService
        .createTax(taxData)
        .then((result) => {
            res.json(result);
        })
        .catch((error) => {
            res.json(error);
        });
}

exports.update_tax = (req, res) => {
    const { id } = req.params;
    const taxData = req.body;
    taxService
        .updateTax(id, taxData)
        .then((result) => {
            res.json(result);
        })
        .catch((error) => {
            res.json(error);
        });
}

exports.delete_tax = (req, res) => {
    const { id } = req.params;
    taxService
        .deleteTax(id)
        .then((result) => {
            res.json(result );
        })
        .catch((error) => {
            res.json(error);
        });
}