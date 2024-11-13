const db = require("../database/db");

exports.getAllTaxes = () => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM taxes`, (err, result) => {
            if (err) {
                console.log(err);
                reject({ error: "Internal Server Error" });
            } else {
                resolve({ data: result, total: result.length });
            }
        });
    });
}

exports.getTaxById = (id) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM taxes WHERE id = ${id}`, (err, result) => {
            if (err) {
                console.log(err);
                reject({ error: "Internal Server Error" });
            } else {
                resolve(result[0]);
            }
        });
    });
}

exports.createTax = (taxData) => {
    return new Promise((resolve, reject) => {
        const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const sqlQuery = `
      INSERT INTO taxes (
        name,
        rate,
        status,
        created_by_id,
        created_at
      ) VALUES (?, ?, ?, ?, ?)
    `;

        db.query(sqlQuery, [
            taxData.name,
            taxData.rate,
            taxData.status,
            taxData.created_by_id,
            createdAt
        ], (err, result) => {
            if (err) {
                console.log(err);
                reject({ error: "Internal Server Error" });
            } else {
                resolve({ data: result });
            }
        });
    });
}

exports.updateTax = (id, taxData) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `
      UPDATE taxes
      SET
        name = ?,
        rate = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
    `;

        db.query(sqlQuery, [
            taxData.name,
            taxData.rate,
            taxData.status,
            id
        ], (err, result) => {
            if (err) {
                console.log(err);
                reject({ error: "Internal Server Error" });
            } else {
                resolve({ data: result });
            }
        });
    });
}

exports.deleteTax = (id) => {
    return new Promise((resolve, reject) => {
        db.query(`UPDATE taxes SET status = 0, deleted_at = NOW() WHERE id = ${id}`, (err, result) => {
            if (err) {
                console.log(err);
                reject({ error: "Internal Server Error" });
            } else {
                resolve({ data: result });
            }
        });
    });
}