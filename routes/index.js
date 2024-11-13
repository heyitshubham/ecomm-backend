const express = require("express");
const router = express.Router();

const authRoute = require("./auth");
const usersRoute = require("./users");
const productsRoute = require("./products");
const categoriesRoute = require("./categories");
const ordersRoute = require("./orders");
const imagesRoute = require("./images");
const countriesRoute = require("./countries");
const statesRoute = require("./states");
const couponsRoute = require("./coupons");
const tagsRoute = require("./tags");
const addressesRoute = require("./addresses");
const taxesRoute = require("./taxes");
const permissionRoute = require("./permission");
const attributesRoute = require("./attribute");
const variationRoute = require("./variation");

router.use("/api/v1/auth", authRoute);
router.use("/api/v1/users", usersRoute);
router.use("/api/v1/products", productsRoute);
router.use("/api/v1/categories", categoriesRoute);
router.use("/api/v1/orders", ordersRoute);
router.use("/api/v1/images", imagesRoute);
router.use("/api/v1/countries", countriesRoute);
router.use("/api/v1/states", statesRoute);
router.use("/api/v1/coupons", couponsRoute);
router.use("/api/v1/tags", tagsRoute);
router.use("/api/v1/addresses", addressesRoute);
router.use("/api/v1/taxes", taxesRoute);
router.use("/api/v1/permission", permissionRoute);
router.use("/api/v1/attribute", attributesRoute);
router.use("/api/v1/variation", variationRoute);

module.exports = router;
