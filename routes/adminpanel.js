var express = require('express');
var router = express.Router();

/* GET admin page. */
router.get('/', function(req, res, next) {
    extra = getExtra(req);
    if (req.session.privileges != 'admin') {
    res.render('index', {title: 'Programming games in MASM32', extra: extra, username: req.session.username});
        return;
    }
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
        pool.getConnection(function(err,connection){
            if (err) {
                connection.release();
                res.json({"code" : 100, "status" : "Error in connection database"});
            }
            else {
                connection.query("select * from users", function (err, rows) {
                    connection.release();
                    if (!err) {
                        var userTable = '<tr><td>Username</td><td>hashed</td><td>email</td><td>privileges</td><td>salt</td></tr>';
                        for (var i = 0; i < rows.length; i++) {
                            console.log(rows[i]);
                            userTable += '<tr>';
                            for (var key in rows[i]) {
                                userTable += '<td contenteditable>' + rows[i][key] + '</td>';
                            }
                            userTable += '</tr>';
                        }
                        res.render('adminpanel', { title: 'Admin panel', extra:extra, username:req.session.username, userTable:userTable});
                    }
                });
            }
        });
        });

module.exports = router;