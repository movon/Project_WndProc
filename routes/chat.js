var express = require('express');
var router = express.Router();

/* GET chat page. */
router.get('/', function(req, res, next) {
    'use strict';
    var extra = getExtra(req);
    res.render('chat', { title: 'Chat', extra:extra, username:req.session.username});
});

module.exports = router;