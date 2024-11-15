const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Deal = require('../models/deal.model');

const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');
const dealController = require('../controllers/deal.controller');
 

// GET all deals
router.get('/', dealController.getAllDeals);

// POST create a new deal
//router.post('/', dealController.addNewDeal); //verifyToken, verifyAdmin, 
router.post('/', verifyToken, verifyAdmin, dealController.addNewDeal);

// Route to get a specific deal by ID
router.get('/id/:id', dealController.getDealById);

// Route definitions with category parameters
// router.post('/new', dealController.catalog("new"));
// router.post('/popular', dealController.catalog("popular"));
// router.post('/sale', dealController.catalog("sale"));

module.exports = router;
