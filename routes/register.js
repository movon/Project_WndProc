var express = require('express');
var router = express.Router();

/* GET register page. */
router.get('/', function(req, res, next) {
    'use strict';
    var extra = getExtra(req);
    res.render('register', { title: 'Register', error: '', extra: extra, username: req.session.username});
});

module.exports = router;
