var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    req.session.username = 'undefined';
    req.session.privileges = 'undefined';
    res.redirect('/');
});

module.exports = router;