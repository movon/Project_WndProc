var express = require('express');
var router = express.Router();

/* GET userpanel page. */
router.get('/', function(req, res, next) {
    if(req.session.username == null)
    {
        res.redirect('/');
        return;
    }
    extra = getExtra(req);
    res.render('userpanel', { title: 'User Panel', extra:extra, username:req.session.username, error:""});
});
module.exports = router;