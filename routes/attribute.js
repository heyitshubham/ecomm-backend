const express = require('express');
const router = express.Router();
const attributeController = require('../controllers/attributeController');

router.get('/', attributeController.get_all_attributes);
router.get('/:id', attributeController.get_attribute_by_id);
router.post('/create', attributeController.create_attribute);
router.put('/update/:id', attributeController.update_attribute);
router.delete('/delete/:id', attributeController.delete_attribute);

module.exports = router;