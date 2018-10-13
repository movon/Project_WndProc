var express = require('express');
var router = express.Router();
var crypto = require('crypto');
const { Client } = require('pg');
const client = new Client(
    {
        host: process.env.DATABASE_URL,
        port: 5334
    }
);

/* GET login page. */
router.get('/', function (req, res) {
    'use strict';
    var extra = getExtra(req);
    res.render('login', { title: 'Log in', extra: extra, username: req.session.username});
});


router.post('/', function (req, res) {
    'use strict';
    client.connect(process.env.DATABASE_URL, function(err, connection, done) {
        if (err) {
            res.json({"code" : 100, "status" : "Error in connection database"});
        } else {
            var extra = getExtra(req);
            var username = req.body.username;
            var password = req.body.password;
            if (username.indexOf("'") > -1 || password.indexOf("'") > -1) {
                res.render('login', {title: 'Detected SQL injection.', extra:extra, req:req});
                return;
            }

            connection.query("select * from users where username='" + username + "';", function (err, rows) {
                if (!err) {
                    if (rows.rowCount === 0) {
                        res.render('login', {title: 'Invalid username or password!', extra:extra, username:req.session.username});
                    } else {
                        var salt = rows.rows[0].salt;
                        var saltpassword =  password + salt;
                        var hashedpassword = crypto.createHash('md5').update(saltpassword).digest('hex');

                        if (rows.rows[0].hashed !== hashedpassword) {
                            res.render('login', {
                                title: 'Invalid username or password!',
                                extra: extra,
                                username: req.session.username
                            });
                            return;
                        }
                        req.session.username = rows.rows[0].username;
                        req.session.privileges = (rows.rows[0].privileges);
                        res.redirect('/');
                    }
                }
            });
        }
        done();
    });
});

module.exports = router;