const express = require('express');
const router = express.Router();

const libraryController = require("../app/controllers/LibraryController");

const {requireAuth} = require('../app/middleware/authMiddleware');

router.get('/listReport',requireAuth,libraryController.listReport);
router.get('/viewReport',requireAuth,libraryController.viewReport);
router.get('/view/:slug',requireAuth,libraryController.view);
router.get('/',requireAuth, libraryController.index);

module.exports = router;