var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    extra = getExtra(req);
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
        pool.getConnection(function(err,connection){
            if (err) {
                connection.release();
                res.json({"code" : 100, "status" : "Error in connection database"});
                return;
            }
            else {
                connection.query("select * from users", function (err, rows) {
                    connection.release();
                    if (!err) {
                        var userTable = '';
                        for (var i = 0; i < rows.length; i++) {
                            console.log(rows[i]);
                            userTable += '<tr>';
                            for (var key in rows[i]) {
                                userTable += '<td>' + rows[i][key] + '</td>';
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