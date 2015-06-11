var express = require('express');
var router = express.Router();
var validator = require('validator');

/* GET home page. */
router.get('/', function(req, res, next) {
    extra = getExtra(req);
    res.render('adduser', { title: 'Thank you for signing up to our website!' , extra:extra, username:req.session.username});
});


var mysql = require('mysql');
mypass = 'winasmfspopaw256!';

var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : '149.78.95.151',
    user     : 'talbor49',
    password : mypass,
    database : 'userlogin',
    debug    :  false
});

//Handle POST request to sign up
router.post('/', function(req, res, next){
    extra = getExtra(req);
    pool.getConnection(function(err,connection){
        if (err) {
            connection.release();
            res.json({"code" : 100, "status" : "Error in connection database"});
            return;
        }
        else {
            var error = '';
            if(!validator.isEmail(req.body.email)){
                error += '<li style=\"color: red\">Invalid Email.</li>';
            }
            if(!validator.isAlphanumeric(req.body.username)){
                error += '<li style=\"color: red\">Username should only contain letters and numbers.</li>';
            }
            if(!validator.isAscii(req.body.password)){
                error += '<li style=\"color: red\">Password contains invalid characters.</li>';
            }
            var finished = false;
            connection.query("select * from users where username='" + req.body.username + "';", function (err, rows) {
                if(rows.length > 0) {
                    error += '<li style=\"color: red\">Username already taken.</li>';
                    finished = true;
                    if(error.length > 0){
                        res.render('register', { title: 'Register', error:error , extra:extra, username:req.session.username});
                        return;
                    }
                    console.log("insert into users(username, password, email, privileges) values('" + req.body.username + "','" + req.body.password + "','" + req.body.email + "'," + "'user');");
                    connection.query("insert into users(username, password, email, privileges) values('" + req.body.username + "','" + req.body.password + "','" + req.body.email + "'," + "'user');", function (err, rows) {
                        connection.release();
                        if (!err) {
                            res.render('adduser', { title: 'Thank you for signing up to our website!' , extra:extra, username:req.session.username});
                        }
                    });
                }
            });

        }
    });

});


module.exports = router;