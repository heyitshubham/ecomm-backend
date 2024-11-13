const express = require("express");
const router = express.Router();
const db = require("../database/db");
const productController = require("../controllers/productController");

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  const { search = "", field = "", sort = "", page, paginate, isConditional, isTrending } = req.query;

  let offsetValue;
  // This query won't work in MariaDB if you are using XAMPP default setting (which MariaDB is auto-configured instead of MySQL)
  let query = `
  SELECT p.*,
    ( CASE
        WHEN pc.product_id IS NULL THEN NULL
        ELSE 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', c.id, 
            'name', c.name, 
            'slug', c.slug, 
            'description', c.description, 
            'status', c.status, 
            'parent_id', c.parent_id, 
            'type', c.type, 
            'category_image_id', c.category_image_id, 
            'category_icon_id', c.category_icon_id
          )
        )
      END ) 'categories'
    from products p
    left join product_category pc on p.id = pc.product_id
    left join categories c on pc.category_id = c.id
  `;

  if (isConditional) {
    let conditionalQuery = [];
    if (isTrending) conditionalQuery.push(`p.is_trending = ${isTrending}`);
    if (search) conditionalQuery.push(`p.name LIKE '%${search}%'`);

    query += ` where ${conditionalQuery.join(" AND ")}`
  }
  query += ` GROUP BY p.id`

  if (page > 0) {
    offsetValue = (page - 1) * paginate;
    query += ` LIMIT ${paginate} OFFSET ${offsetValue}`;
  }
  else {
    if (paginate) query += ` LIMIT ${paginate}`;
  }
  // console.log(query);
  // var fs=require('fs');
  // var data=fs.readFileSync('./product.json', 'utf8');
  // var words=JSON.parse(data);
  // res.json(words)
  db.query(
    query,
    async (err, results) => {
      if (err) console.log(err);
      else {
        let resData = [];
        if (results.length) {
          await results.reduce(async (accumulatorPromise, item) => {
            const accumulator = await accumulatorPromise;

            const imgs = await new Promise((resolve, reject) => {
              db.query(`SELECT * FROM images WHERE id = ?`, [item.product_thumbnail_id], (err, result) => {
                if (err) {
                  console.log(err);
                  reject({ error: "Internal Server Error" });
                } else {
                  resolve(result.pop())
                }
              });
            }); 
            
            item.product_thumbnail = imgs;
            return [...accumulator, resData.push(item)];
            // Add the processed result to the accumulator (accumulator array in this case)

          }, Promise.resolve([]));


          if (resData.length)
            res.json({
              data: resData.map(obj => {
                return { ...obj, categories: JSON.parse(obj.categories) };
              }),
              total: resData ? resData.length : 0
            });
          else
            res.status(500).send({ message: 'Some error occur!' });
        }

      }
    }
  );
});

// GET ALL PRODUCTS
router.get("/get-v2", async (req, res) => {
  const { search = "", field = "", sort = "", page, paginate, isConditional, isTrending } = req.query;

  let offsetValue;
  // This query won't work in MariaDB if you are using XAMPP default setting (which MariaDB is auto-configured instead of MySQL)
  let query = `
  SELECT p.*,
    ( CASE
        WHEN pc.product_id IS NULL THEN NULL
        ELSE 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', c.id, 
            'name', c.name, 
            'slug', c.slug, 
            'description', c.description, 
            'status', c.status, 
            'parent_id', c.parent_id, 
            'type', c.type, 
            'category_image_id', c.category_image_id, 
            'category_icon_id', c.category_icon_id
          )
        )
      END ) 'categories'
    from products p
    left join product_category pc on p.id = pc.product_id
    left join categories c on pc.category_id = c.id
  `;

  if (isConditional) {
    let conditionalQuery = [];
    if (isTrending) conditionalQuery.push(`p.is_trending = ${isTrending}`);
    if (search) conditionalQuery.push(`p.name LIKE '%${search}%'`);

    query += ` where ${conditionalQuery.join(" AND ")}`
  }
  query += ` GROUP BY p.id`

  if (page > 0) {
    offsetValue = (page - 1) * paginate;
    query += ` LIMIT ${paginate} OFFSET ${offsetValue}`;
  }
  else {
    if (paginate) query += ` LIMIT ${paginate}`;
  }
  // console.log(query);
  // var fs=require('fs');
  // var data=fs.readFileSync('./product.json', 'utf8');
  // var words=JSON.parse(data);
  // res.json(words)
  db.query(
    query,
    (err, results) => {
      if (err) console.log(err);
      else {
        res.json({
          data: results.map(obj => {
            return { ...obj, categories: JSON.parse(obj.categories) };
          }),
          total: results ? results.length : 0
        });
      }
    }
  );
});

// GET SINGLE PRODUCT BY ID
router.get("/get-one", async (req, res) => {
  const { productId } = req.query;
  db.query(
    `
    SELECT p.*,
    ( CASE
        WHEN pc.product_id IS NULL THEN NULL
        ELSE 
        JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', c.id, 
          'name', c.name, 
          'slug', c.slug, 
          'description', c.description, 
          'status', c.status, 
          'parent_id', c.parent_id, 
          'type', c.type, 
          'category_image_id', c.category_image_id, 
          'category_icon_id', c.category_icon_id
        )
        )
      END   )  'categories'
    from products p
    left join product_category pc on p.id = pc.product_id
    left join categories c on pc.category_id = c.id
    where p.id = ${productId}
    GROUP BY p.id`,
    (err, results) => {
      if (err) console.log(err);
      else {
        res.json({
          data: results.length > 0 ? results.map(obj => {
            return { ...obj, categories: JSON.parse(obj.categories) };
          }).pop() : null,
          total: results ? results.length : 0
        });
      }
    }
  );
});

// GET SINGLE PRODUCT BY ID
router.get("/get-one-by-slug", async (req, res) => {
  const { slug } = req.query;
  db.query(
    `
    SELECT p.*,
    ( CASE
        WHEN pc.product_id IS NULL THEN NULL
        ELSE 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', c.id, 
            'name', c.name, 
            'slug', c.slug, 
            'description', c.description, 
            'status', c.status, 
            'parent_id', c.parent_id, 
            'type', c.type, 
            'category_image_id', c.category_image_id, 
            'category_icon_id', c.category_icon_id
          )
        )
      END ) 'categories',
      (Select JSON_ARRAYAGG(prr.child_id) from products_related prr where prr.parent_id = p.id AND prr.is_related = 1) 'related_products',
      (Select JSON_ARRAYAGG(prr.child_id) from products_related prr where prr.parent_id = p.id AND prr.is_cross_sell = 1) 'cross_sell_products',
      (Select JSON_OBJECT(
            "id", i.id,
            "collection_name", i.collection_name,
            "name", i.name,
            "file_name", i.file_name,
            "mime_type", i.mime_type,
            "disk", i.disk,
            "conversions_disk", i.conversions_disk,
            "size", i.size,
            "created_by_id", i.created_by_id,
            "created_at", i.created_at,
            "updated_at", i.updated_at,
            "original_url", i.original_url
          ) 
      from images i where p.product_thumbnail_id = i.id) 'product_thumbnail',
      ( CASE
        WHEN pi.product_id IS NULL THEN NULL
        ELSE 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            "id", im.id,
            "collection_name", im.collection_name,
            "name", im.name,
            "file_name", im.file_name,
            "mime_type", im.mime_type,
            "disk", im.disk,
            "conversions_disk", im.conversions_disk,
            "size", im.size,
            "created_by_id", im.created_by_id,
            "created_at", im.created_at,
            "updated_at", im.updated_at,
            "original_url", im.original_url
          )
        )
      END ) 'product_galleries'
    from products p
    left join product_category pc on p.id = pc.product_id
    left join categories c on pc.category_id = c.id
	  left join product_images pi on p.id = pi.product_id
    left join images im on pi.image_id = im.id
    where p.slug = '${slug}'
    GROUP BY p.id`,
    (err, results) => {
      if (err) console.log(err);
      else {
        res.json({
          data: results.length > 0 ? results.map(obj => {
            return {
              ...obj,
              categories: JSON.parse(obj.categories),
              related_products: JSON.parse(obj.related_products),
              cross_sell_products: JSON.parse(obj.cross_sell_products),
              product_thumbnail: JSON.parse(obj.product_thumbnail),
              product_galleries: JSON.parse(obj.product_galleries),
            };
          }) : null,
          total: results ? results.length : 0
        });
      }
    }
  );
});

router.get("/get-all", productController.get_all_products);
// router.get("/get-one/:id", productController.get_product_by_id);
router.post("/create", productController.create_product);
router.post("/update", productController.update_product);
router.post("/delete", productController.delete_product);
module.exports = router;
