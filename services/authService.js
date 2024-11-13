const {
  loginValidation,
  registerValidation,
} = require("../middleware/validation");
const db = require("../database/db");
const jwt = require("jsonwebtoken");
const md5 = require("md5");
const addressService = require("../services/addressService");
const roleHelper = require("../helpers/roleHelper");

exports.loginUser = async (params) => {
  const { error } = loginValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { email, password } = params;
  const hashedPassword = md5(password.toString());

  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, hashedPassword],
      (err, result) => {
        if (err) {
          reject({
            data: err,
            message: "Something went wrong, please try again",
            statusCode: 400,
          });
        }

        if (result.length === 0) {
          reject({
            message: "Wrong credentials, please try again",
            statusCode: 400,
          });
        }

        if (result.length > 0) {

          addressService.getAddressesByUserId(result[0].id)
            .then(address_result => {
              result = result.map(i => {
                i.address = address_result.data,
                  i.role = roleHelper.getById(result[0].role_id)
                return i;
              });

              // Query to get profile image
              db.query(
                "SELECT * FROM images WHERE id = ?",
                [result[0].profile_image_id],
                (err, img_result) => {
                  if (err) {
                    reject({
                      data: err,
                      message: "Something went wrong, please try again",
                      statusCode: 400,
                    });
                  }

                  result = result.map(i => {
                    i.profile_image = img_result.pop()
                    return i;
                  });

                  // Return login data 
                  const token = jwt.sign({ data: result }, "secret");
                  resolve({
                    message: "Logged in successfully",
                    data: result.pop(),
                    token: token
                  });
                }
              );
            })
            .catch((err) => {
              const { statusCode = 400, message, data } = err;
              res.status(statusCode).send({ message, data }) && next(err);
            });


          
        }
      }
    );
  });
};

exports.registerUser = async (params) => {
  const { name, country_code, email, password, phone } = params;
  const { error } = registerValidation({name, email, password});
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
            `INSERT INTO users (name, email, password, phone, country_code) VALUES (?,?,?,?,?)`,
            [name, email, hashedPassword, phone, country_code],
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
