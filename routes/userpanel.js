var express = require('express');
var router = express.Router();

/* GET userpanel page. */
router.get('/', function(req, res, next) {
    'use strict';
    if(req.session.username === null) {
        res.redirect('/');
        return;
    }
    var extra = getExtra(req);
    res.render('userpanel', { title: 'User Panel', extra: extra, username: req.session.username, error: ''});
});
module.exports = router;