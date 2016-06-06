var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET guides page. */
router.get('/', function (req, res) {
    'use strict';
    var extra = getExtra(req);
    var guideName = 'guide' + req.baseUrl.slice(req.baseUrl.lastIndexOf("/") + 1);
    res.render(guideName, { title: 'Guide', extra: extra, username: req.session.username});
});

module.exports = router;