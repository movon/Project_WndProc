var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    extra = getExtra(req);
    console.log("Got into my 404");
    res.render('notfound404', {title: "Error 404, Not found. ", extra:extra, username:req.session.username});
});

module.exports = router;