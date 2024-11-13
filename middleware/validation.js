const Joi = require("joi");

var options = {
  errors: {
    wrap: {
      label: "",
    },
  },
};

const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().strict(),
    email: Joi.string().email().required().strict(),
    password: Joi.string().min(6).required().strict(),
    phone: Joi.string().max(10)
  });

  return schema.validate(data, options);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().strict(),
    password: Joi.string().min(6).required().strict(),
  });

  return schema.validate(data, options);
};

const updateUserValidation = (data) => {
  const schema = Joi.object({
    id: Joi.number().required(),
    email: Joi.string().email().strict(),
    name: Joi.string().strict(),
    phone: Joi.string().max(10)
  });

  return schema.validate(data, options);
};

const changePasswordValidation = (data) => {
  const schema = Joi.object({
    id: Joi.string().required().strict(),
    password: Joi.string().min(6).required().strict()
  });

  return schema.validate(data, options);
};

module.exports = {
  registerValidation,
  loginValidation,
  updateUserValidation,
  changePasswordValidation
};
