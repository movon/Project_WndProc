var express = require('express');
var router = express.Router();

/* logout. */
router.get('/', function (req, res) {
    'use strict';
    req.session.username = null;
    req.session.privileges = null;
    res.redirect('/');
});

module.exports = router;