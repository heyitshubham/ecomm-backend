const userService = require("../services/userService");
const addressService = require("../services/addressService");
const permissionService = require("../services/permissionService");
const roleHelper = require("../helpers/roleHelper");

const authService = require("../services/authService");

exports.update_user = async (req, res, next) => {
  userService.updateUser(req.body)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode = 400, message, data } = err;
      res.status(statusCode).send({ message, data }) && next(err);
    });
};

exports.add_user = async (req, res, next) => {
  userService.addUser(req.body)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode = 400, message, data } = err;
      res.status(statusCode).send({ message, data }) && next(err);
    });
};

exports.delete_user = async (req, res, next) => {
  userService.deleteUser(req.body)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode = 400, message, data } = err;
      res.status(statusCode).send({ message, data }) && next(err);
    });
};

exports.get_user_info = async (req, res, next) => {
  const { id } = req.query;

  userService.getUserInfo({ userId: id })
    .then((result) => {
      let { statusCode, data, total } = result;
      if (data) {
        addressService.getAddressesByUserId(data[0].id)
          .then((addressRes) => {
            permissionService.getAllPermissions()
              .then((perData) => {
                data = data.map(i => {
                  i.address = addressRes.data;
                  i.role = roleHelper.getById(i.role_id);

                  if (roleHelper.getById(i.role_id).name == 'admin')
                    i.permission = perData.data;
                  return i;
                });
                res.status(statusCode).send({ data: data[0] });
              })
              .catch((err) => {
                console.log(err.message)
                const { statusCode = 400, message } = err;
                res.status(statusCode).send({ message }) && next(err);
              });
          })
          .catch((err) => {
            console.log(err.message)
            const { statusCode = 400, message } = err;
            res.status(statusCode).send({ message }) && next(err);
          });
      }
      else {
        res.status(statusCode).send({ message });
      }
    })
    .catch((err) => {
      console.log(err.message)
      const { statusCode = 400, message } = err;
      res.status(statusCode).send({ message }) && next(err);
    });
};

exports.get_all = (req, res, next) => {
  userService.getAll(req.query)
    .then(async (result) => {
      let { statusCode, data, total } = result;
      let resData = [];
      if (data.length) {
        await data.reduce(async (accumulatorPromise, user) => {
          const accumulator = await accumulatorPromise;

          const addressRes = await addressService.getAddressesByUserId(user.id);
          const perData = await permissionService.getAllPermissions();

          user.address = addressRes.data;
          user.role = roleHelper.getById(user.role_id);

          if (roleHelper.getById(user.role_id ? user.role_id : 2).name == 'admin')
            user.permission = perData.data;
          
          // Add the processed result to the accumulator (accumulator array in this case)
          return [...accumulator, resData.push(user)];
        }, Promise.resolve([]));

        if (resData.length)
          res.status(statusCode).send({ data: resData, total: resData.length });
        else
          res.status(statusCode).send({ message: 'Some error occur!' });
      }
      else {
        res.status(statusCode).send({ message });
      }
    })
    .catch((err) => {
      console.log(err.message)
      const { statusCode = 400, message } = err;
      res.status(statusCode).send({ message }) && next(err);
    });
};

