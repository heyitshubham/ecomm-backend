const db = require("../database/db");

exports.getAllPermissions = () => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM permission`, (err, result) => {
            if (err) {
                console.log(err);
                reject({ error: "Internal Server Error" });
            } else {
                resolve({ data: result, total: result.length });
            }
        });
    });
}

exports.getPermissionById = (id) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM permission WHERE id = ${id}`, (err, result) => {
            if (err) {
                console.log(err);
                reject({ error: "Internal Server Error" });
            } else {
                resolve(result[0]);
            }
        });
    });
}

exports.createPermission = (params) => {
    return new Promise((resolve, reject) => {
        db.query(
            `INSERT INTO permission (name) VALUES (?)`,
            [params.name],
            (err, result) => {
                if (err) {
                    console.log(err);
                    reject({ error: "Internal Server Error" });
                } else {
                    resolve({ data: result });
                }
            }
        );
    });
}

exports.updatePermission = (id, data) => {
    return new Promise((resolve, reject) => {
        db.query(
            `UPDATE permission SET name = ? WHERE id = ?`,
            [data.name, id],
            (err, result) => {
                if (err) {
                    console.log(err);
                    reject({ error: "Internal Server Error" });
                } else {
                    resolve({ data: result });
                }
            }
        );
    });
}

exports.deletePermission = (id) => {
    return new Promise((resolve, reject) => {
        db.query(`DELETE FROM permission WHERE id = ${id}`, (err, result) => {
            if (err) {
                console.log(err);
                reject({ error: "Internal Server Error" });
            } else {
                resolve({ data: result });
            }
        });
    });
}