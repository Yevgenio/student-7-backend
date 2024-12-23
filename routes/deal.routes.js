const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');
const dealController = require('../controllers/deal.controller');
const upload = require('../middleware/file.middleware'); 
 

// GET all deals
router.get('/', dealController.getAllDeals);

// GET deal by ID
router.get('/id/:id', dealController.getDealById); 
 
// GET deals by query
router.get('/search', dealController.searchDeals);

// GET distinct categories
router.get('/categories', dealController.getDistinctCategories);

// POST new deal
router.post(
    '/', 
    verifyToken, 
    verifyAdmin, 
    upload.fields([{ name: 'imagePath', maxCount: 1 }, { name: 'barcodePath', maxCount: 1 }]),
    dealController.addNewDeal
);

// // PUT update deal by ID
// router.put('/id/:id',
//     verifyToken, 
//     verifyAdmin, 
//     upload.fields([{ name: 'imagePath', maxCount: 1 }, { name: 'barcodePath', maxCount: 1 }]),
//     dealController.updateDealById
// );

// // DELETE deal by ID
// router.delete('/id/:id', 
//     verifyToken, 
//     verifyAdmin, 
//     dealController.deleteDealById
// );
// router.post('/', verifyToken, verifyAdmin, upload.single('image'), dealController.addNewDeal);

// Route definitions with category parameters
// router.post('/new', dealController.catalog("new"));
// router.post('/popular', dealController.catalog("popular"));
// router.post('/sale', dealController.catalog("sale"));

module.exports = router;
