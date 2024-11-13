const { updateUserValidation } = require("../middleware/validation");
const db = require("../database/db");
const md5 = require("md5");

const {
  loginValidation,
  registerValidation,
} = require("../middleware/validation");

exports.updateUser = async (params) => {
  const { name, country_code, email, phone, role_id, status, id } = params;

  const { error } = updateUserValidation({id, name, email, phone});
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  return new Promise((resolve, reject) => {
    let query = ``;
    let conditionalQuery = [];

    if (name) conditionalQuery.push(`name = '${name}'`);
    if (email) conditionalQuery.push(`email = '${email}'`);
    if (country_code) conditionalQuery.push(`country_code = '${country_code}'`);
    if (phone) conditionalQuery.push(`phone = '${phone}'`);
    if (role_id) conditionalQuery.push(`role_id = ${role_id}`);
    if (status || status == 0) conditionalQuery.push(`status = ${status}`);

    query += `${conditionalQuery.join(" , ")}`
  
    db.query(
      `UPDATE users SET ${query} WHERE id = ?`,
      [id],
      (err, result) => {
        if (err) throw { message: err, statusCode: 500 };
        resolve({
          message: "User details have been successfully updated",
          data: result,
        });
      }
    );
  });
};

exports.getUserInfo = async (params) => {
  const { userId } = params;

  if (!userId) throw { message: "userId was not provided", statusCode: 400 };

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT * FROM users where id = ${userId}`,
      (err, results) => {

        if (err) reject({ message: err, statusCode: 500 })
        else {
          if (results.length === 0) {
            reject({
              message: "No user found!",
              statusCode: 400,
            });
          }
          resolve({
            statusCode: 200,
            data: results,
            total: results.length
          });
        }
      }
    );
  });
};

exports.getAll = async (params) => {
  const { search = "", field = "", sort = "", page, paginate, isConditional } = params;
  // if (!userId) throw { message: "userId was not provided", statusCode: 400 };
  let offsetValue;
  let query = `SELECT * FROM users`;

  if (search.length) {
    let conditionalQuery = [];
    if (search) conditionalQuery.push(`name LIKE '%${search}%'`);

    query += ` where ${conditionalQuery.join(" AND ")}`
  }
  query += ` GROUP BY id`

  if (page > 0) {
    offsetValue = (page - 1) * paginate;
    query += ` LIMIT ${paginate} OFFSET ${offsetValue}`;
  }
  else {
    if (paginate) query += ` LIMIT ${paginate}`;
  }

  return new Promise((resolve, reject) => {
    db.query(
      query,
      (err, results) => {

        if (err) reject({ message: err, statusCode: 500 })
        else {
          if (results.length === 0) {
            reject({
              message: "No user found!",
              statusCode: 400,
            });
          }
          resolve({
            statusCode: 200,
            data: results,
            total: results.length
          });
        }
      }
    );
  });
};

exports.addUser = async (params) => {
  const { name, country_code, email, password, phone, role_id, status } = params;
  const { error } = registerValidation({ name, email, password });
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const hashedPassword = md5(password.toString());

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT email FROM users WHERE email = ?`,
      [email],
      (err, result) => {
        if (result.length > 0) {
          reject({
            message: "Email address is in use, please try a different one",
            statusCode: 400,
          });
        } else if (result.length === 0) {
          db.query(
            `INSERT INTO users (name, email, password, phone, country_code, role_id, status) VALUES (?,?,?,?,?,?, ?)`,
            [name, email, hashedPassword, phone, country_code, role_id, status],
            (err, result) => {
              if (err) {
                reject({
                  message: "Something went wrong, please try again",
                  statusCode: 400,
                  data: err,
                });
              } else {
                // const token = jwt.sign({ data: result }, "secret");
                resolve({
                  data: result,
                  message: "You have successfully registered.",
                  token: '',
                  statusCode: 200,
                });
              }
            }
          );
        }
      }
    );
  });
};

exports.deleteUser = async (params) => {
  const { id, ids } = params;

  return new Promise((resolve, reject) => {
    let query = ``;
    let conditionalQuery = [];

    if (id) conditionalQuery.push(id);
    if (ids) conditionalQuery.push(...ids);

    query += `${conditionalQuery.join(", ")}`
  
    db.query(
      `DELETE FROM users WHERE id IN (${query})`,
      [],
      (err, result) => {
        if (err) throw { message: err, statusCode: 500 };
        resolve({
          message: "Delete successfully!",
          data: result,
        });
      }
    );
  });
};