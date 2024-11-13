const db = require("../database/db");

exports.getAllAttributes = () => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM attribute`, (err, result) => {
            if (err) {
                console.log(err);
                reject({ error: "Internal Server Error" });
            } else {
                resolve({ data: result, total: result.length });
            }
        });
    });
};

exports.getAttributeById = (id) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM attribute WHERE id = ${id}`, (err, result) => {
            if (err) {
                console.log(err);
                reject({ error: "Internal Server Error" });
            } else {
                resolve(result[0]);
            }
        });
    });
}

exports.createAttribute = (attributeData) => {
    return new Promise((resolve, reject) => {
        const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const sqlQuery = `INSERT INTO attribute (value, created_at) VALUES (?, ?)`;
        db.query(sqlQuery, [attributeData.value, createdAt], (err, result) => {
            if (err) {
                console.log(err);
                reject({ error: "Internal Server Error" });
            } else {
                const createdAtFormatted = new Date(createdAt).toISOString();
                resolve({ data: result, created_at: createdAtFormatted });
            }
        });
    });
}

exports.updateAttribute = (id, attributeData) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `UPDATE attribute SET value = ?, updated_at = NOW() WHERE id = ?`;
        db.query(sqlQuery, [attributeData.value, id], (err, result) => {
            if (err) {
                console.error(err);
                reject({message: err, statusCode: 500});
            } else {
                resolve({
                    message: "Attribute created successfully",
                    data: result,
                    statusCode: 201,
                });
            }
        });
    });
}

exports.deleteAttribute = (id) => {
    return new Promise((resolve, reject) => {
        db.query(`DELETE FROM attribute WHERE id = ${id}`, (err, result) => {
            if (err) {
                console.log(err);
                reject({ error: "Internal Server Error" });
            } else {
                resolve({ data: result });
            }
        });
    });
}