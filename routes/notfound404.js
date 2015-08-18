var express = require('express');
var router = express.Router();

/* GET an unknown page. */
router.get('/', function(req, res, next) {
    'use strict';
    var extra = getExtra(req);
    res.render('notfound404', {title: "Error 404, Not found. ", extra: extra, username: req.session.username});
});

module.exports = router;