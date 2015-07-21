var express = require('express');
var router = express.Router();
var crypto = require('crypto');
/* GET home page. */
router.get('/', function(req, res, next) {
    extra = getExtra(req);
    res.render('login', { title: 'Log in' , extra:extra, username:req.session.username});
});


var mysql = require('mysql');
var dbusername = 'root';
var dbpassword = 'winasmfspopaw256!';
var dbhost = 'localhost';
var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : dbhost,
    user     : dbusername,
    password : dbpassword,
    database : 'userlogin',
    debug    :  false
});
router.post('/', function(req, res, next) {
    pool.getConnection(function(err,connection){
        if (err) {
            connection.release();
            res.json({"code" : 100, "status" : "Error in connection database"});
            return;
        }
        else {
            extra = getExtra(req);
            username = req.body.username;
            password = req.body.password;
            if(username.indexOf("'")>-1 || password.indexOf("'")>-1){
                res.render('login', {title: 'Detected SQL injection.', extra:extra, req:req});
                return;
            }

            connection.query("select * from users where username='" + username + "';", function (err, rows) {
                if (!err) {
                    if (rows == 0) {
                        res.render('login', {title: 'Invalid username or password!', extra:extra, username:req.session.username});
                    }
                    else {
                        var salt = rows[0]['salt'];
                        var saltpassword =  password + salt;
                        var hashedpassword = crypto.createHash('md5').update(saltpassword).digest('hex');

                        if(rows[0]['hashed'] != hashedpassword) {
                            res.render('login', {
                                title: 'Invalid username or password!',
                                extra: extra,
                                username: req.session.username
                            });
                            return;
                        }


                        req.session.username = rows[0]['username'];
                        req.session.privileges = (rows[0]['privileges']);
                        res.redirect('/');
                    }
                }
            });
        }
    });
});

module.exports = router;