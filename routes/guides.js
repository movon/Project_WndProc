var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('guides', { title: 'Guides' });
});

module.exports = router;