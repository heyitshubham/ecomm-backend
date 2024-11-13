const express = require("express");
const router = express.Router();
const db = require("../database/db");
const categoryController = require("../controllers/categoryController");

// GET ALL Categories
router.get("/", async (req, res) => {
  // This query won't work in MariaDB if you are using XAMPP default setting (MariaDB is auto-configured instead of MySQL)
  let query = `
  SELECT c.*, ( CASE
      WHEN pc.parent_id IS NULL THEN NULL
      ELSE
          JSON_ARRAYAGG(
                    JSON_OBJECT(
                      'id', pc.id,
                      'name', pc.name,
                      'slug', pc.slug,
                      'description', pc.description,
                      'status', pc.status,
                      'parent_id', pc.parent_id,
                      'type', pc.type,
                      'category_image_id', pc.category_image_id,
                      'category_icon_id', pc.category_icon_id
                    )
                  )
    END   ) 'subcategories'
                from categories c
          left join categories pc on c.id = pc.parent_id AND pc.status = true
                where c.status = true
                GROUP BY c.id`;

  // console.log(query);
  // var fs=require('fs');
  // var data=fs.readFileSync('./product.json', 'utf8');
  // var words=JSON.parse(data);
  // res.json(words)
  db.query(
    query,
    (err, results) => {
      if (err) console.log(err);
      else{

        res.json({
          data: results.map(obj => {
            return { ...obj, subcategories: JSON.parse(obj.subcategories) };
        }),
          total: results ? results.length : 0
        });
      }
    }
  );
});

// GET ALL Level 1 categories
router.get("/get-parent-categories", async (req, res) => {
  // This query won't work in MariaDB if you are using XAMPP default setting (MariaDB is auto-configured instead of MySQL)
  let query = `
                SELECT c.*, JSON_ARRAYAGG(
                    JSON_OBJECT(
                      'id', pc.id, 
                      'name', pc.name, 
                      'slug', pc.slug, 
                      'description', pc.description, 
                      'status', pc.status, 
                      'parent_id', pc.parent_id, 
                      'type', pc.type, 
                      'category_image_id', pc.category_image_id, 
                      'category_icon_id', pc.category_icon_id
                    )
                  ) AS 'subcategories'
                from categories c
                inner join categories pc on c.id = pc.parent_id AND pc.status = true
                where c.status = true
                GROUP BY c.id `;

  // console.log(query);
  // var fs=require('fs');
  // var data=fs.readFileSync('./product.json', 'utf8');
  // var words=JSON.parse(data);
  // res.json(words)
  db.query(
    query,
    (err, results) => {
      if (err) console.log(err);
      else{
        
        res.json({
          data: results.map(obj => {
            return { ...obj, subcategories: JSON.parse(obj.subcategories) };
        }),
          total: results ? results.length : 0
        });
      } 
    }
  );
});

// GET SINGLE BY ID
router.get("/get-one", async (req, res) => {
  const { categoryId } = req.query;
  db.query(
    `SELECT c.*, ( CASE
      WHEN pc.parent_id IS NULL THEN NULL
      ELSE 
          JSON_ARRAYAGG(
                    JSON_OBJECT(
                      'id', pc.id, 
                      'name', pc.name, 
                      'slug', pc.slug, 
                      'description', pc.description, 
                      'status', pc.status, 
                      'parent_id', pc.parent_id, 
                      'type', pc.type, 
                      'category_image_id', pc.category_image_id, 
                      'category_icon_id', pc.category_icon_id
                    )
                  )
    END   ) 'subcategories'
                from categories c
          left join categories pc on c.id = pc.parent_id AND pc.status = true
                where c.status = true AND c.id = ${categoryId}
                group by c.id`,
    (err, results) => {
      if (err) console.log(err);
      else {
        res.json({
          data: results.length > 0 ? results.map(obj => {
            return { ...obj, subcategories: JSON.parse(obj.subcategories) };
        }).pop() : null,
          total: results ? results.length : 0
        });
      }
    }
  );
});

router.get('/get-all', categoryController.get_all_categories);

router.get('/get-one/:id', categoryController.get_category_by_id);

router.post('/create', categoryController.create_category);

router.post('/update', categoryController.update_category);

router.post('/delete', categoryController.delete_category);

module.exports = router;
