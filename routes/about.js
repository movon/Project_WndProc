var express = require('express');
var router = express.Router();

/* GET about page. */
router.get('/', function (req, res) {
    'use strict';
    var extra = getExtra(req);
    var content = 'This way you will learn a lot about assembly language and low-level programming,' +
        'how the operating system handles graphics, and how the computer works.';
    res.render('about', { title: 'About', extra: extra, username: req.session.username, content: content});
});


module.exports = router;