var express = require('express');
var router = express.Router();
var { Client } = require('pg');
const client = new Client(
    {
        host: process.env.DATABASE_URL,
        port: 5334
    }
);

/* GET admin page. */
router.get('/', function (req, res, next) {
    'use strict';
    var extra = getExtra(req);
    if (req.session.privileges !== 'admin') {
        res.render('index', {title: 'Programming games in MASM32', extra: extra, username: req.session.username});
        return;
    }

    client.connect()
        .then(() => {
            connection.query("select * from users")
                .then(
                    (rows) => {
                        var userTable = '<tr><td>Username</td><td>hashed</td><td>email</td><td>privileges</td><td>salt</td></tr>';
                        for (var i = 0; i < rows.rows.length; i++) {
                            console.log(rows.rows[i]);
                            userTable += '<tr>';
                            for (var key in rows.rows[i]) {
                                userTable += '<td contenteditable>' + rows.rows[i][key] + '</td>';
                            }
                            userTable += '</tr>';
                        }
                        console.log("Admin panel retrieved");
                        client.end();
                        res.render('adminpanel', { title: 'Admin panel', extra:extra, username:req.session.username, userTable:userTable});
                    },
                    (err) => {
                        console.error("couldn't retrieve admin panel content");
                        client.end();
                        res.json({"code": 100, "status": "Error fetching admin panel"});
                    }
                );
        }, (err) => {
            console.error('connection errror when accessing admin panel', err.stack);
            res.json({"code": 100, "status": "Error in connection database"});
        });
});

module.exports = router;