const db = require("../database/db");
const countryHelper = require("../helpers/countryHelper");
const stateHelper = require("../helpers/stateHelper");

exports.getAddressesByUserId = async (params) => {
  const userId = params;

  if (!userId) throw { message: "userId was not provided", statusCode: 400 };

  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM myapp.addresses where user_id = ${userId}`, (err, results) => {
      results = results.map(i => {
        i.country = countryHelper.getCountryById(i.country_id), i.state = stateHelper.getById(i.state_id)

        return i;
      });

      if (err) reject({ message: err, statusCode: 500 })
      else {
        resolve({
          statusCode: 200, data: results, total: results.length
        });
      }
    });
  });
};

// exports.getAllAddresses = () => {
//   return new Promise((resolve, reject) => {
//     db.query(`SELECT * FROM addresses`, (err, result) => {
//       if (err) {
//         console.log(err);
//         reject({ error: "Internal Server Error" });
//       } else {
//         resolve({ data: result, total: result.length });
//       }
//     });
//   });
// }

exports.getAddressById = (id) => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM addresses WHERE id = ${id}`, (err, result) => {
      if (err) {
        console.log(err);
        reject({ error: "Internal Server Error" });
      } else {
        if (result.length === 0) {
          reject({
            message: "Wrong credentials, please try again",
            statusCode: 400,
          });
        }
        results = results.map(i => {
          i.country = countryHelper.getCountryById(i.country_id), i.state = stateHelper.getById(i.state_id)

          return i;
        });
        resolve({
          statusCode: 200, data: results, total: results.length
        });
        // resolve(result[0]);
      }
    });
  });
}

exports.createAddress = (addressData) => {
  const { city, country_code, country_id, phone, pincode, state_id, street, title, userId } = addressData
  return new Promise((resolve, reject) => {
    const sqlQuery = `INSERT INTO addresses SET
        city = ?,
        country_code = ?,
        country_id = ?,
        phone = ?,
        pincode = ?,
        state_id = ?,
        street = ?,
        title = ?,
        user_id = ?
        `;
    db.query(sqlQuery,
      [city, country_code, country_id, phone, pincode, state_id, street, title, userId],
      (err, result) => {
        if (err) {
          console.log(err);
          reject({
            message: "Something went wrong, please try again",
            statusCode: 400,
            data: err,
          });
        } else {
          resolve({
            data: result,
            message: "Success!",
            statusCode: 200,
          });
        }
      });
  });
}

exports.updateAddress = (addressData) => {
  const { city, country_code, country_id, phone, pincode, state_id, street, title, id } = addressData

  return new Promise((resolve, reject) => {
    const sqlQuery = `UPDATE addresses SET city = ?,
    country_code = ?,
    country_id = ?,
    phone = ?,
    pincode = ?,
    state_id = ?,
    street = ?,
    title = ? WHERE id = ?`;

    db.query(sqlQuery,
      [city, country_code, country_id, phone, pincode, state_id, street, title, id],
      (err, result) => {
        if (err) {
          console.log(err);
          reject({
            message: "Something went wrong, please try again",
            statusCode: 400,
            data: err,
          });
        } else {
          resolve({
            data: result,
            message: "Success!",
            statusCode: 200,
          });
        }
      });
  });
}

exports.deleteAddress = (params) => {
  const { id, ids } = params;
  return new Promise((resolve, reject) => {
    let query = ``;
    let conditionalQuery = [];

    if (id) conditionalQuery.push(id);
    if (ids) conditionalQuery.push(...ids);

    query += `${conditionalQuery.join(", ")}`

    db.query(`DELETE FROM addresses WHERE id IN (${query})`,
      [],
      (err, result) => {
        if (err) {
          console.log(err);
          reject({
            message: "Something went wrong, please try again",
            statusCode: 400,
            data: err,
          });
        } else {
          resolve({
            data: result,
            message: "Success!",
            statusCode: 200,
          });
        }
      });
  });
}