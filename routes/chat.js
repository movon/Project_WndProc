var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    extra = getExtra(req);
    res.render('chat', { title: 'Chat', extra:extra, username:req.session.username});
});

module.exports = router;