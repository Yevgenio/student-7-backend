const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');
const memoController = require('../controllers/memo.controller');
const upload = require('../middleware/file.middleware'); 
 

// GET all memos
router.get('/', memoController.getAllMemos);

// GET memo by ID
router.get('/id/:id', memoController.getMemoById); 
 
// GET memos by query
router.get('/search', memoController.searchMemos);

// // GET distinct categories
// router.get('/categories', memoController.getDistinctCategories);

// POST new memo
router.post(
    '/', 
    verifyToken, 
    verifyAdmin, 
    upload.fields([{ name: 'imagePath', maxCount: 1 }, { name: 'barcodePath', maxCount: 1 }]),
    memoController.addNewMemo
);

module.exports = router;
