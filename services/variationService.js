const db = require("../database/db");

exports.getAllVariations = () => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM variation`, (err, result) => {
            if (err) {
                console.log(err);
                reject({ error: err });
            } else {
                resolve({ data: result, total: result.length });
            }
        });
    });
};

exports.getVariationById = (id) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM variation WHERE id = ${id}`, (err, result) => {
            if (err) {
                console.log(err);
                reject({ error: "Internal Server Error" });
            } else {
                resolve(result[0]);
            }
        });
    });
};

exports.createVariation = (data) => {
    return new Promise((resolve, reject) => {
        db.query(`INSERT INTO variation SET ?`, data, (err, result) => {
            if (err) {
                console.log(err);
                reject({ error: "Internal Server Error" });
            } else {
                resolve({ data: result, total: result.length });
            }
        });
    });
};

exports.updateVariation = (id, data) => {
    return new Promise((resolve, reject) => {
        db.query(`UPDATE variation SET ? WHERE id = ${id}`, data, (err, result) => {
            if (err) {
                console.log(err);
                reject({ error: "Internal Server Error" });
            } else {
                resolve({ data: result, total: result.length });
            }
        });
    });
};

exports.deleteVariation = (id) => {
    return new Promise((resolve, reject) => {
        db.query(`DELETE FROM variation WHERE id = ${id}`, (err, result) => {
            if (err) {
                console.log(err);
                reject({ error: err });
            } else {
                resolve({ data: result, total: result.length });
            }
        });
    });
};