var express = require('express');
var router = express.Router();
var crypto = require('crypto');

/* GET login page. */
router.get('/', function (req, res) {
    'use strict';
    var extra = getExtra(req);
    res.render('login', { title: 'Log in', extra: extra, username: req.session.username});
});


router.post('/', function (req, res) {
    'use strict';
        var extra = getExtra(req);
        var username = req.body.username;
        var password = req.body.password;
        client.query("select * from users where username=$1;", [username])
            .then(
                (rows) => {
                    if (rows.rowCount === 0) {
                        console.log("user not found");
                        res.render('login', {title: 'Invalid username or password!', extra:extra, username:req.session.username});
                        return;
                    }

                    // verify password hash
                    var salt = rows.rows[0].salt;
                    var saltpassword =  password + salt;
                    var hashedpassword = crypto.createHash('md5').update(saltpassword).digest('hex');

                    if (rows.rows[0].hashed !== hashedpassword) {
                        console.log("password hash doesn't match given password");
                        res.render('login', {title: 'Invalid username or password!', extra: extra, username: req.session.username});
                        return;
                    }

                    req.session.username = rows.rows[0].username;
                    req.session.privileges = (rows.rows[0].privileges);
                    console.log("login successful");
                    res.redirect('/');
                },
                (err) => {
                    console.error("failed querying users database for logging in", err, err.stack);
                    res.render('login', {title: 'Failed querying database for logging in', extra: extra, username: req.session.username});
                }
            );
});

module.exports = router;