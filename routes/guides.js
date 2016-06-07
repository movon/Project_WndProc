var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET guides page. */
router.get('/', function (req, res) {
    'use strict';
    var extra = getExtra(req);
    var guideName = 'guide' + req.baseUrl.slice(req.baseUrl.lastIndexOf("/") + 1);
    var fileName = __dirname + '/../views/' + guideName;
    console.log(fileName);
    fs.exists(fileName + '.ejs', function(exists) {
        if (exists) {
            res.render(guideName, { title: 'Guide', extra: extra, username: req.session.username});
        } else {
            res.render('guides', { title: 'Guides', extra: extra, username: req.session.username});
        }
    });
});

module.exports = router;