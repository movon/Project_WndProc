var express = require('express');
var router = express.Router();

/* GET guides page. */
router.get('/', function(req, res, next) {
    extra = getExtra(req);
    res.render('guides', { title: 'Guides' , extra:extra, username:req.session.username});
});

module.exports = router;