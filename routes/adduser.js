var express = require('express');
var router = express.Router();
var validator = require('validator');
var https = require('https');
var crypto = require('crypto');
var { Client } = require('pg');
const client = new Client(
    {
        host: process.env.DATABASE_URL
    }
);



/* GET after registration page. */
router.get('/', function(req, res, next) {
    'use strict';
    var extra = getExtra(req);
    res.render('adduser', { title: 'Thank you for signing up to our website!' , extra:extra, username:req.session.username});
});

// Helper function to make API call to recatpcha and check response
function verifyRecaptcha(key, callback) {
    'use strict';
    console.log("Verifying captcha with secret " + process.env.SECRET + " and response key " + key);
    https.get("https://www.google.com/recaptcha/api/siteverify?secret=" + process.env.SECRET + "&response=" + key, function(res) {
        var data = "";
        res.on('data', function (chunk) {
            data += chunk.toString();
        });
        res.on('end', function() {
            try {
                var parsedData = JSON.parse(data);
                console.log("Got all data from google recaptcha: " + JSON.stringify(parsedData));
                callback(parsedData.success);
            } catch (e) {
                console.log("Error while trying to get all data from google recaptcha, exception: " + e, e.stack);
                callback(false);
            }
        });
    });
}

//Handle POST request to sign up
router.post('/', function(req, res) {
    'use strict';
    var extra = getExtra(req);
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    verifyRecaptcha(req.body["g-recaptcha-response"], function(success) {
        if (success) {
            var error = '';
            if (!validator.isEmail(email)) {
                error += '<li style=\"color: red\">Invalid Email.</li>';
            }
            if (!validator.isAlphanumeric(username)) {
                error += '<li style=\"color: red\">Username should only contain letters and numbers.</li>';
            }
            if (!validator.isAscii(password)) {
                error += '<li style=\"color: red\">Password contains invalid characters.</li>';
            }

            if(error) {
                res.render('register', {
                    title: 'Register',
                    error: error,
                    extra: extra,
                    username: req.session.username
                });
            }
            client.connect()
                .then(() =>  {
                    client.query("select * from users where username=$1;", [req.body.username])
                        .then(
                            (rows) => {
                                if (rows.rows.length > 0) {
                                    var error = '<li style=\"color: red\">Username already taken.</li>';
                                    console.log("username already taken");
                                    client.end();
                                    res.render('register', {
                                        title: 'Register',
                                        error: error,
                                        extra: extra,
                                        username: req.session.username
                                    });
                                    return;
                                }

                                var salt = crypto.randomBytes(32).toString('hex');
                                var saltpassword =  password + salt;
                                var hashedpassword = crypto.createHash('md5').update(saltpassword).digest('hex');
                                connection.query("insert into users(username, hashed, email, privileges, salt) values($1,$2,$3,$4,$5);", [req.body.username, hashedpassword, req.body.email, 'user', salt])
                                    .then(
                                        () => {
                                            console.log("sent him thank you, adding user successful");
                                            client.end();
                                            res.render('adduser', {
                                                title: 'Thank you for signing up to our website!',
                                                extra: extra,
                                                username: req.session.username
                                            });
                                        }, (err) => {
                                            console.error(err);
                                            client.end();
                                            res.json({"code": 100, "status": "Error in updating database"});
                                        }
                                    );
                            }, (err) => {
                                    console.error("error querying database for adding user");
                                    client.end();
                                    res.render('register', {
                                        title: 'Register',
                                        error: error,
                                        extra: extra,
                                        username: req.session.username
                                    });
                            });
                }, (err) => {
                    console.error('connection errror when adding user', err.stack);
                    res.json({"code": 100, "status": "Error in connection database"});
                });
        } else {
            res.render('register', {
                title: 'Register',
                error: '<li style=\"color: red\">Recaptcha failed.</li>',
                extra: extra,
                username: req.session.username
            });
            console.log('Recaptcha failed for ');
        }
    });


});


module.exports = router;