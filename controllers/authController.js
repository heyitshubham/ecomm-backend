const { registerUser, loginUser } = require("../services/authService");

exports.login_user = async (req, res, next) => {
  const { email, password } = req.body;

  loginUser({ email, password })
    .then((result) => {
      console.log(result);
      const { statusCode = 200, message, data, token } = result;
      res.cookie("jwt", token, {
        httpOnly: true,
      });
      res.status(statusCode).send({ message, data, token: token.substring(0, 15) });
    })
    .catch((err) => {
      const { statusCode = 400, message, data } = err;
      res.status(statusCode).send({ message, data }) && next(err);
    });
};

exports.register_user = async (req, res, next) => {
  const { name, country_code, email, password, phone } = req.body;

  registerUser({ name, country_code, email, password, phone })
    .then((result) => {
      const { statusCode = 200, message, data, token } = result;
      res.status(statusCode).send({ message, data, token });
    })
    .catch((err) => {
      const { statusCode = 400, message, data } = err;
      res.status(statusCode).send({ message, data }) && next(err);
    });
};
