const express = require('express');
const router = express.Router();

// Import controller
const blogController = require('../controllers/blogController');

// Define routes
router.get('/blog-stats', blogController.getBlogStats);
router.get('/blog-search', blogController.searchBlogs);

module.exports = router;
