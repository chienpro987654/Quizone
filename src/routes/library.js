const express = require('express');
const router = express.Router();

const libraryController = require("../app/controllers/LibraryController");

const {requireAuth} = require('../app/middleware/authMiddleware');

router.get('/setFavorite',requireAuth,libraryController.setFavorite);
router.get('/listReport',requireAuth,libraryController.listReport);
router.get('/viewReport',requireAuth,libraryController.viewReport);
router.get('/getTheme',requireAuth,libraryController.getTheme);
router.get('/view',requireAuth,libraryController.view);
router.get('/',requireAuth, libraryController.index);

module.exports = router;