var express = require('express');
var router = express.Router();



router.post('/', function(req, res) {
    'use strict';
    console.log("Got request to change password");
        var username = req.session.username;
        var extra = getExtra(req);

        if (req.body.password !== req.body.verifypassword) {
            res.render('userpanel', { title: 'User Panel', extra:extra, username:req.session.username, error:"Passwords do not match"});
            return;
        }

        connection.query("select * from users where username=$1;", [username]).then((rows) => {
            var oldpass = req.body.old;
            var salt = rows[0].salt;
            var saltpassword = oldpass + salt;
            var hashedpassword = crypto.createHash('md5').update(saltpassword).digest('hex');

            if (rows[0].hashed !== hashedpassword) {
                res.render('userpanel', { title: 'User Panel', extra:extra, username:req.session.username, error:"Invalid old password"});
                return;
            }

            var newpass = req.body.password;
            salt = rows[0].salt;
            saltpassword = newpass + salt;
            hashedpassword = crypto.createHash('md5').update(saltpassword).digest('hex');

            connection.query("UPDATE users SET hashed=$1 where username=$2;", [hashedpassword, username]).then(
                (result) => {
                    console.log("updated user: ", ussername, "password successfuly");
                    res.render('userpanel', { title: 'User Panel', extra:extra, username: req.session.username, error: "Password change success." });
                },
                (err) => {
                    console.error("Error occured in changing passwords:", err);
                    res.render('userpanel', { title: 'User Panel', extra:extra, username:req.session.username, error:"Error updating password"});
                });
            }, (err) => {
            console.err("Error querying database for changing password", err, err.stack);
            res.render('userpanel', { title: 'User Panel', extra:extra, username:req.session.username, error:"Error querying database for username"});
        });
});

module.exports = router;