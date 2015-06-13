var express = require('express');
var router = express.Router();
var crypto = require('crypto');

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


router.post('/', function(req, res, next) {
    console.log("Got request to change password");
    pool.getConnection(function(err,connection){
        if (err) {
            connection.release();
            console.log("Error in creating connection to database: " + err);
            res.json({"code": 100, "status": "Error in connection database"});
            return;
        }
        else {
            username = req.session.username;

            connection.query("select * from users where username='" + username + "';", function (err, rows) {
                if(!err) {
                    var oldpass = req.body.old;
                    var salt = rows[0]['salt'];
                    var saltpassword = oldpass + salt;
                    var hashedpassword = crypto.createHash('md5').update(saltpassword).digest('hex');
                    if(rows[0]['hashed'] != hashedpassword)
                    {
                        extra = getExtra(req);
                        res.render('userpanel', { title: 'User Panel', extra:extra, username:req.session.username, error:"Invalid old password"});
                        return;
                    }
                    if(req.body.password != req.body.verifypassword)
                    {
                        extra = getExtra(req);
                        res.render('userpanel', { title: 'User Panel', extra:extra, username:req.session.username, error:"Password do not match"});
                        return;
                    }
                    var newpass = req.body.password;
                    var salt = rows[0]['salt'];
                    saltpassword = newpass + salt;
                    var hashedpassword = crypto.createHash('md5').update(saltpassword).digest('hex');

                    connection.query("UPDATE users SET hashed=" + "'" + hashedpassword + "'" + " where username='" + username + "';", function (err, rows) {
                        if(err)
                            console.log("Error occured in changing passwords: " + err);
                    });
                    res.render('userpanel', { title: 'User Panel', extra:extra, username:req.session.username, error:"Password change success."});
                }
                else{
                    console.log("error in accessing database in changepassword: " + err);
                }
            });
        }
    });

});

module.exports = router;