var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    'use strict';
    var extra = getExtra(req);
    res.render('index', { title: 'WinAsm', extra: extra, username: req.session.username });
});
module.exports = router;