const db = require("../database/db");
exports.getImageById = (id) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM images WHERE id = ?`, [id], (err, result) => {
            if (err) {
                console.log(err);
                reject({error: err});
            } else {
                resolve({data: result[0]});
            }
        });
    });
};

exports.createImage = (imageData) => {
    return new Promise((resolve, reject) => {
        const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const sqlQuery = `
      INSERT INTO images SET
        collection_name = ?,
        name = ?,
        file_name = ?,
        mime_type = ?,
        disk = ?,
        conversions_disk = ?,
        size = ?,
        created_by_id = ?,
        original_url = ?,
        created_at = NOW()
    `;

        db.query(
            sqlQuery,
            [
                imageData.collection_name,
                imageData.name,
                imageData.file_name,
                imageData.mime_type,
                imageData.disk,
                imageData.conversions_disk,
                imageData.size,
                imageData.created_by_id,
                imageData.original_url
            ],
            (err, result) => {
                if (err) {
                    console.error(err);
                    reject({message: err, statusCode: 500});
                } else {
                    resolve({
                        message: "Image created successfully",
                        data: result,
                        statusCode: 201,
                    });
                }
            }
        );
    });
};

exports.updateImage = (id, imageData) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `UPDATE images SET 
        collection_name = ?,
        name = ?,
        file_name = ?,
        mime_type = ?,
        disk = ?,
        conversions_disk = ?,
        size = ?,
        created_by_id = ?,
        original_url = ?,
        updated_at = NOW()
      WHERE id = ?`;

        db.query(sqlQuery,
            [
                imageData.collection_name,
                imageData.name,
                imageData.file_name,
                imageData.mime_type,
                imageData.disk,
                imageData.conversions_disk,
                imageData.size,
                imageData.created_by_id,
                imageData.original_url,
                id
            ],
            (err, result) => {
                if (err) {
                    console.error(err);
                    reject({message: err, statusCode: 500});
                } else {
                    resolve({
                        message: "Image updated successfully",
                        data: result,
                        statusCode: 200});
                }
            });
    })
};

exports.deleteImage = (id) => {
    return new Promise((resolve, reject) => {
        db.query(`DELETE FROM images WHERE id = ?`, [id], (err) => {
            if (err) {
                console.error(err);
                reject({message: err, statusCode: 500});
            } else {
                resolve({message: "Image deleted successfully", statusCode: 200});
            }
        });
    });
}