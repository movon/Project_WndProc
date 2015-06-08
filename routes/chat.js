var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    extra = '';
    if(req.session.username != 'undefined'){
        extra += '<li><a href="/chat">Chat</a></li>';
        extra += '<li><a href="/logout">Log Out</a></li>';
        if(req.session.privileges == 'admin'){
            extra += '<li><a href="/adminpanel">Admin Panel</a></li>';
        }
    }
    else{
        extra += '<li><a href="/register">Register</a></li>';
        extra +=  '<li><a href="/login">Log in</a></li>';
    }
    res.render('chat', { title: 'Chat', extra:extra});
});

module.exports = router;